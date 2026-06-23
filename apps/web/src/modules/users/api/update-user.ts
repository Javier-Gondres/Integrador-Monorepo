import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { UpdateUserPayload, UserDto } from "../types/user.types";

export async function updateUser(id: string, payload: UpdateUserPayload) {
  return apiFetch<UserDto>(ENDPOINTS.users.byId(id), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
