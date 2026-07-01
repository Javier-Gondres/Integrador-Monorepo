import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { CurrentShiftResponse } from "../types/sale.types";

export async function getCurrentShift(branchId: string) {
  return apiFetch<CurrentShiftResponse>(ENDPOINTS.sales.currentShift, {
    params: { branchId },
  });
}
