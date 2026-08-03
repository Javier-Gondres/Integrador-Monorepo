import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { LoginCredentials, LoginResponse } from "../types/auth.types";

export async function login(credentials: LoginCredentials) {
  return apiFetch<LoginResponse>(ENDPOINTS.auth.login, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}
