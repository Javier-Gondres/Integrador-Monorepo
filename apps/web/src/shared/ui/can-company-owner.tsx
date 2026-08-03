"use client";

import { usePermissions } from "@/modules/auth/hooks/use-permissions";

interface CanCompanyOwnerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renderiza `children` solo para OWNER de la empresa o Super Admin de plataforma.
 *
 * Equivalente UI de `@RequireCompanyOwnerOrPlatformAdmin` y `canAccessNav` con
 * `{ type: "role", role: TenantRole.OWNER }`.
 *
 * IMPORTANTE: esto es solo para la UI. El backend es la autoridad real.
 */
export function CanCompanyOwner({
  children,
  fallback = null,
}: CanCompanyOwnerProps) {
  const { canManageCompany } = usePermissions();

  if (!canManageCompany) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
