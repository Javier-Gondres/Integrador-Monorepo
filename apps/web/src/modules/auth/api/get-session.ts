import { apiFetch } from "@/lib/api/client";
import type { AuthUser } from "@/types";

import type {
  AuthSession,
  LoginCredentials,
  LoginResponse,
  MeProfileResponse,
} from "../types/auth.types";

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
  const profile = await apiFetch<MeProfileResponse>("/me");
  return { user: mapProfileToUser(profile) };
}

export async function login(credentials: LoginCredentials) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function refreshToken() {
  return apiFetch<LoginResponse>("/auth/refresh", {
    method: "POST",
  });
}

export async function logout() {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}
