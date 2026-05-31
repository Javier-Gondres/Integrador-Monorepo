import { apiFetch } from "@/lib/api/client";

import type {
  AuthSession,
  LoginCredentials,
  LoginResponse,
} from "../types/auth.types";

export async function getSession() {
  return apiFetch<AuthSession>("/auth/me");
}

export async function login(credentials: LoginCredentials) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function logout() {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}
