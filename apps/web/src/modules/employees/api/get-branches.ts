import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { BranchOption } from "../types/employee.types";

export async function getBranchesForSelect() {
  return apiFetch<BranchOption[]>(ENDPOINTS.branches.root);
}
