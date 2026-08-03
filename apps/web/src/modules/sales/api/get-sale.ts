import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { SaleDetailDto } from "../types/sale.types";

export async function getSale(id: string) {
  return apiFetch<SaleDetailDto>(ENDPOINTS.sales.byId(id));
}
