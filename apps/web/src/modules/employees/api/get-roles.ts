import { apiFetch } from "@/lib/api/client";

import type { RoleOption } from "../types/employee.types";

export async function getRolesForSelect() {
  return apiFetch<RoleOption[]>("/users/roles");
}
