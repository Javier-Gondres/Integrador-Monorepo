/**
 * Modelos de master data con eliminación lógica (`deletedAt`).
 * No incluir entidades transaccionales/históricas (AuditLog, RefreshToken, etc.).
 *
 * Al agregar Product, Customer, Supplier, Employee u otro master data al schema, añadirlos aquí y en el schema:
 * - `deletedAt DateTime?`
 * - `@@unique([campoUnico, deletedAt])` donde aplique
 */
export const SOFT_DELETE_MODELS = [
  "Company",
  "Branch",
  "User",
  "Role",
  "UserCompany",
  "Category",
  "Product",
  "Employee",
  "Supplier",
] as const;

export type SoftDeleteModel = (typeof SOFT_DELETE_MODELS)[number];

/** Modelos que además desactivan `isActive` al hacer soft delete. */
export const SOFT_DELETE_MODELS_WITH_IS_ACTIVE = [
  "Company",
  "Branch",
  "User",
  "Category",
  "Product",
  "Employee",
  "Supplier",
] as const satisfies readonly SoftDeleteModel[];

const softDeleteModelSet = new Set<string>(SOFT_DELETE_MODELS);

const softDeleteWithIsActiveSet = new Set<string>(
  SOFT_DELETE_MODELS_WITH_IS_ACTIVE,
);

export function isSoftDeleteModel(model: string): model is SoftDeleteModel {
  return softDeleteModelSet.has(model);
}

export function softDeleteSetsIsActive(model: string): boolean {
  return softDeleteWithIsActiveSet.has(model);
}

/** Convierte `UserCompany` → `userCompany` (delegado del cliente Prisma). */
export function modelToDelegate(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}
