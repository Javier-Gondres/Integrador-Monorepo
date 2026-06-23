"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { AUTH_ROUTES } from "@/modules/auth/constants";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { useAuthStore } from "@/modules/auth/store/auth-store";

type PlatformGuardProps = {
  children: React.ReactNode;
};

/**
 * Protege rutas `/platform/*` — solo Super Admin.
 * No usa RBAC tenant ni exige `companyId`.
 */
export function PlatformGuard({ children }: PlatformGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const user = useAuthStore((state) => state.user);
  const { isSuperAdmin } = usePermissions();

  const isForbiddenPage = pathname === AUTH_ROUTES.forbidden;

  useEffect(() => {
    if (!isAuthReady || !user || isForbiddenPage) {
      return;
    }

    if (!isSuperAdmin) {
      router.replace(`${AUTH_ROUTES.forbidden}?reason=platform-admin`);
    }
  }, [isAuthReady, isForbiddenPage, isSuperAdmin, router, user]);

  if (!isAuthReady || !user) {
    return null;
  }

  if (!isSuperAdmin && !isForbiddenPage) {
    return null;
  }

  return <>{children}</>;
}
