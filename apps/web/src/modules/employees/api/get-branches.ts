import { apiFetch } from "@/lib/api/client";

import type { BranchOption } from "../types/employee.types";

export async function getBranchesForSelect() {
  return apiFetch<BranchOption[]>("/branches");
}
