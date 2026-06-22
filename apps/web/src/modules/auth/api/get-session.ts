import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { AuthUser } from "@/types";

import type {
  AuthSession,
  BasicProfileResponse,
  MyCompanyResponse,
  SessionResponse,
} from "../types/auth.types";

function mapToAuthUser(
  session: SessionResponse,
  profile: BasicProfileResponse,
  companySlug?: string,
): AuthUser {
  return {
    id: session.userId,
    email: session.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    isSuperAdmin: session.isSuperAdmin,
    permissions: session.permissions,
    companyId: session.companyId ?? undefined,
    companySlug,
    branchId: session.branchId ?? undefined,
    role: session.role ? { id: session.role, name: session.role } : undefined,
  };
}

async function fetchCompanySlug(
  companyId: string | null,
): Promise<string | undefined> {
  if (!companyId) {
    return undefined;
  }

  const company = await apiFetch<MyCompanyResponse>(ENDPOINTS.me.company);

  return company.slug;
}

export async function getSession(): Promise<AuthSession> {
  const [session, profile] = await Promise.all([
    apiFetch<SessionResponse>(ENDPOINTS.auth.session),
    apiFetch<BasicProfileResponse>(ENDPOINTS.auth.profile),
  ]);

  const companySlug = await fetchCompanySlug(session.companyId);

  return { user: mapToAuthUser(session, profile, companySlug) };
}
