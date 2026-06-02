import { type SoftDeleteModel, softDeleteSetsIsActive } from "./config.js";

/** Filtro estándar para excluir registros eliminados lógicamente. */
export const notDeleted = { deletedAt: null } as const;

/** Registros eliminados lógicamente (auditoría, restauración, etc.). */
export const onlyDeleted = { deletedAt: { not: null } } as const;

export type SoftDeleteUpdateData = {
  deletedAt: Date;
  isActive?: false;
};

export type RestoreUpdateData = {
  deletedAt: null;
};

export type ActivateUpdateData = {
  isActive: true;
};

export type DeactivateUpdateData = {
  isActive: false;
};

/**
 * Payload para `update` / `updateMany` al eliminar lógicamente.
 * Mantiene `isActive` separado: solo lo pone en `false` en modelos que lo tienen.
 */
export function softDeleteData(
  model?: SoftDeleteModel,
  at: Date = new Date(),
): SoftDeleteUpdateData {
  return softDeleteDataForModel(model ?? "", at);
}

export function softDeleteDataForModel(
  model: string,
  at: Date = new Date(),
): SoftDeleteUpdateData {
  const data: SoftDeleteUpdateData = { deletedAt: at };
  if (softDeleteSetsIsActive(model)) {
    data.isActive = false;
  }
  return data;
}

/** Revierte eliminación lógica (`deletedAt = null`). No cambia `isActive`. */
export function restoreDataForModel(_model: string): RestoreUpdateData {
  return { deletedAt: null };
}

export function activateDataForModel(_model: string): ActivateUpdateData {
  return { isActive: true };
}

export function deactivateDataForModel(_model: string): DeactivateUpdateData {
  return { isActive: false };
}

type ArgsWithWhere = { where?: Record<string, unknown> };

/** Combina un `where` existente con `deletedAt: null`. */
export function mergeNotDeleted<T extends ArgsWithWhere>(args: T): T {
  return {
    ...args,
    where: {
      ...(args.where ?? {}),
      ...notDeleted,
    },
  };
}

/** Combina un `where` existente con `deletedAt` no nulo (solo registros eliminados). */
export function mergeOnlyDeleted<T extends ArgsWithWhere>(args: T): T {
  return {
    ...args,
    where: {
      ...(args.where ?? {}),
      ...onlyDeleted,
    },
  };
}

/**
 * `where` para `findUnique` con índices `@@unique([campo, deletedAt])`.
 * Ej.: `prisma.company.findUnique({ where: uniqueWithNotDeleted('slug', slug) })`
 */
export function uniqueWithNotDeleted(
  field: string,
  value: string,
): Record<string, unknown> {
  return {
    [`${field}_deletedAt`]: {
      [field]: value,
      deletedAt: null,
    },
  };
}
