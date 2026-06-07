import { apiFetch } from "@/lib/api/client";
import type { AuthUser } from "@/types";

import type {
  AuthMeResponse,
  AuthSession,
  LoginCredentials,
  LoginResponse,
} from "../types/auth.types";

function mapMeResponseToUser(me: AuthMeResponse): AuthUser {
  return {
    id: me.auth.userId,
    email: "",
    companyId: me.company.companyId,
    branchId: me.company.branchId ?? undefined,
    role: {
      id: me.company.role,
      name: me.company.role,
      permissions: [],
    },
  };
}

export async function getSession(): Promise<AuthSession> {
  const me = await apiFetch<AuthMeResponse>("/auth/me");
  return { user: mapMeResponseToUser(me) };
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
