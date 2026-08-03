import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { Caja } from "../types/caja.types";

export async function createCaja(payload: { name: string; branchId?: string }) {
  return apiFetch<Caja>(ENDPOINTS.cashRegisters.root, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
