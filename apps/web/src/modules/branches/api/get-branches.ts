import { apiFetch } from "@/lib/api/client";

import type { BranchListItem } from "../types/branch.types";

export async function getBranches() {
  return apiFetch<BranchListItem[]>("/branches");
}
