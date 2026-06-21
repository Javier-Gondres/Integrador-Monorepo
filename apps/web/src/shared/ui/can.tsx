"use client";

import { usePermissions } from "@/modules/auth/hooks/use-permissions";

interface CanProps {
  /** Permiso requerido para mostrar los hijos. */
  permission: string;
  children: React.ReactNode;
  /** Contenido alternativo si el usuario no tiene el permiso. Por defecto: null. */
  fallback?: React.ReactNode;
}

/**
 * Renderiza `children` solo si el usuario tiene el permiso tenant especificado.
 *
 * No aplica bypass por `isSuperAdmin` (plataforma ≠ RBAC empresarial).
 * IMPORTANTE: esto es solo para la UI. El backend es la autoridad real.
 *
 * @example
 * <Can permission="products.create">
 *   <CreateProductButton />
 * </Can>
 *
 * @example
 * <Can permission="users.delete" fallback={<span>Sin acceso</span>}>
 *   <DeleteUserButton />
 * </Can>
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
