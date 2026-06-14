import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { AuthUser } from "@/types";

import type { AuthSession, MeProfileResponse } from "../types/auth.types";

function mapProfileToUser(profile: MeProfileResponse): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    companyId: profile.membership?.companyId,
    branchId: profile.membership?.defaultBranchId ?? undefined,
    role: profile.membership?.role
      ? {
          id: profile.membership.role.id,
          name: profile.membership.role.name,
          permissions: [],
        }
      : undefined,
  };
}

export async function getSession(): Promise<AuthSession> {
  const profile = await apiFetch<MeProfileResponse>(ENDPOINTS.me.profile);
  return { user: mapProfileToUser(profile) };
}
