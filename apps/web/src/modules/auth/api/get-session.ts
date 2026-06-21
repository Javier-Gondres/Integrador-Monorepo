import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { AuthUser } from "@/types";

import type {
  AuthSession,
  BasicProfileResponse,
  SessionResponse,
} from "../types/auth.types";

function mapToAuthUser(
  session: SessionResponse,
  profile: BasicProfileResponse,
): AuthUser {
  return {
    id: session.userId,
    email: session.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    isSuperAdmin: session.isSuperAdmin,
    permissions: session.permissions,
    companyId: session.companyId ?? undefined,
    branchId: session.branchId ?? undefined,
    role: session.role ? { id: session.role, name: session.role } : undefined,
  };
}

export async function getSession(): Promise<AuthSession> {
  const [session, profile] = await Promise.all([
    apiFetch<SessionResponse>(ENDPOINTS.auth.session),
    apiFetch<BasicProfileResponse>(ENDPOINTS.auth.profile),
  ]);

  return { user: mapToAuthUser(session, profile) };
}
