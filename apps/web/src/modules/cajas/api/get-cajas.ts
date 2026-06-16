import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { Caja } from "../types/caja.types";

export async function getCajas(branchId?: string) {
  return apiFetch<Caja[]>(ENDPOINTS.cashRegisters.root, {
    params: { branchId },
  });
}
