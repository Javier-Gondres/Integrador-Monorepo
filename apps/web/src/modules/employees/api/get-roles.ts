import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { RoleOption } from "../types/employee.types";

export async function getRolesForSelect() {
  return apiFetch<RoleOption[]>(ENDPOINTS.users.roles);
}
