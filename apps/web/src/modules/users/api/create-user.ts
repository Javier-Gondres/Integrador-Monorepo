import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { CreateUserPayload, UserDto } from "../types/user.types";

export async function createUser(payload: CreateUserPayload) {
  return apiFetch<UserDto>(ENDPOINTS.users.root, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
