"use client";

import { usePermissions } from "@/modules/auth/hooks/use-permissions";

interface CanPlatformAdminProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renderiza `children` solo para Super Admin de plataforma.
 *
 * Equivalente UI de `@RequirePlatformAdmin()` en rutas `/platform/*`.
 */
export function CanPlatformAdmin({
  children,
  fallback = null,
}: CanPlatformAdminProps) {
  const { isSuperAdmin } = usePermissions();

  if (!isSuperAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
