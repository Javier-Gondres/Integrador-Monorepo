"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { canAccessRoute } from "@/config/route-access";

import { AUTH_ROUTES } from "../constants";
import { usePermissions } from "../hooks/use-permissions";
import { useAuthStore } from "../store/auth-store";

type PermissionGuardProps = {
  children: React.ReactNode;
};

/**
 * Protege rutas del dashboard según RBAC tenant (JWT).
 * Complementa al sidebar: bloquea acceso directo por URL.
 *
 * - `/forbidden` siempre permitida (evita loop de redirect).
 * - Super Admin sin tenant → redirige a `/platform/dashboard`.
 * - Rutas sin regla en `route-access.ts` pasan (404 de Next si no existen).
 * - El backend sigue siendo la autoridad real.
 */
export function PermissionGuard({ children }: PermissionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const user = useAuthStore((state) => state.user);
  const { can, isSuperAdmin } = usePermissions();

  const isForbiddenPage = pathname === AUTH_ROUTES.forbidden;

  const allowed = isForbiddenPage
    ? true
    : canAccessRoute(pathname, {
        can,
        isSuperAdmin,
        roleName: user?.role?.name,
        hasTenant: Boolean(user?.companyId),
      });

  useEffect(() => {
    if (!isAuthReady || !user || isForbiddenPage) {
      return;
    }

    if (!user.companyId && isSuperAdmin) {
      router.replace(AUTH_ROUTES.platformDashboard);
      return;
    }

    if (!user.companyId) {
      router.replace(`${AUTH_ROUTES.forbidden}?reason=no-tenant`);
      return;
    }

    if (!allowed) {
      router.replace(`${AUTH_ROUTES.forbidden}?reason=no-permission`);
    }
  }, [allowed, isAuthReady, isForbiddenPage, isSuperAdmin, router, user]);

  if (!isAuthReady || !user) {
    return null;
  }

  if (!isForbiddenPage && (!user.companyId || !allowed)) {
    return null;
  }

  return <>{children}</>;
}
