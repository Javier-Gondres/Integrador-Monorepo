import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { MyBranchResponse } from "../types/auth.types";

/** Sucursal activa del usuario (JWT). No requiere `BRANCHES_READ`. */
export async function getMyBranch() {
  return apiFetch<MyBranchResponse>(ENDPOINTS.me.branch);
}
