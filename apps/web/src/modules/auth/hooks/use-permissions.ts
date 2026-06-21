import type { PermissionCode } from "@repo/shared";

import { useAuthStore } from "../store/auth-store";

/**
 * Helper de autorización del lado del cliente para permisos de tenant (RBAC empresarial).
 *
 * Devuelve funciones para verificar permisos basados en el JWT activo.
 * Úsalo para ocultar o mostrar elementos de la UI.
 *
 * REGLA ARQUITECTÓNICA: Los permisos tenant y la administración de plataforma
 * son sistemas distintos. `isSuperAdmin` NO otorga permisos empresariales.
 * Para pantallas de plataforma (/platform/*) usa `auth.isSuperAdmin` directamente.
 *
 * IMPORTANTE: el backend es la autoridad real.
 * Nunca confíes únicamente en el frontend para seguridad.
 *
 * @example
 * const { can, isSuperAdmin } = usePermissions();
 *
 * if (can(Permission.PRODUCTS_CREATE)) { ... }  // permisos RBAC empresarial
 * if (isSuperAdmin) { ... }                     // administración de plataforma
 */
export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  const isSuperAdmin = user?.isSuperAdmin ?? false;
  const permissions = user?.permissions ?? [];

  /** Devuelve true si el usuario tiene el permiso especificado. */
  function can(permission: PermissionCode): boolean {
    return permissions.includes(permission);
  }

  /** Devuelve true si el usuario tiene TODOS los permisos especificados. */
  function canAll(...perms: PermissionCode[]): boolean {
    return perms.every((p) => permissions.includes(p));
  }

  /** Devuelve true si el usuario tiene AL MENOS UNO de los permisos especificados. */
  function canAny(...perms: PermissionCode[]): boolean {
    return perms.some((p) => permissions.includes(p));
  }

  return { can, canAll, canAny, isSuperAdmin, permissions };
}
