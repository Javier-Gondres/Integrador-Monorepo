import { apiFetch } from "@/lib/api/client";

import type { LoginCredentials, LoginResponse } from "../types/auth.types";

export async function login(credentials: LoginCredentials) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}
