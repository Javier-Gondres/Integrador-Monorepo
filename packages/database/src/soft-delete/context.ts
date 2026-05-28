import { AsyncLocalStorage } from "node:async_hooks";

/**
 * - `excludeDeleted` (default): lecturas/updates solo sobre registros no eliminados.
 * - `includeDeleted`: incluye eliminados (auditoría, papelera, restore).
 */
export type SoftDeleteQueryMode = "excludeDeleted" | "includeDeleted";

const softDeleteQueryModeStorage =
  new AsyncLocalStorage<SoftDeleteQueryMode>();

export function getSoftDeleteQueryMode(): SoftDeleteQueryMode {
  return softDeleteQueryModeStorage.getStore() ?? "excludeDeleted";
}

export function isIncludingDeleted(): boolean {
  return getSoftDeleteQueryMode() === "includeDeleted";
}

export function runWithSoftDeleteQueryMode<T>(
  mode: SoftDeleteQueryMode,
  fn: () => T,
): T {
  return softDeleteQueryModeStorage.run(mode, fn);
}

/** Ejecuta `fn` sin filtrar `deletedAt` en queries del cliente extendido. */
export function runWithDeleted<T>(fn: () => T): T {
  return runWithSoftDeleteQueryMode("includeDeleted", fn);
}
