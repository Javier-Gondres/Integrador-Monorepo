import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { RoleOption } from "../types/user.types";

export async function getUserRoles() {
  return apiFetch<RoleOption[]>(ENDPOINTS.users.roles);
}
