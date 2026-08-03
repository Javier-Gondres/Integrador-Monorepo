import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { UserDto } from "../types/user.types";

export async function activateUser(id: string) {
  return apiFetch<UserDto>(ENDPOINTS.users.activate(id), {
    method: "PATCH",
  });
}

export async function deactivateUser(id: string) {
  return apiFetch<UserDto>(ENDPOINTS.users.deactivate(id), {
    method: "PATCH",
  });
}
