import type { AuthUser } from "@/types";

import { AUTH_ROUTES } from "../constants";

/** Ruta post-login según si el usuario opera tenant o solo plataforma. */
export function getPostLoginRoute(user: AuthUser | null | undefined): string {
  if (user?.isSuperAdmin && !user.companyId) {
    return AUTH_ROUTES.platformDashboard;
  }

  if (!user?.companyId) {
    return AUTH_ROUTES.onboardingCompany;
  }

  return AUTH_ROUTES.dashboard;
}
