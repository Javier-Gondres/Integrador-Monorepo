import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { CreateSalePayload, SaleDetailDto } from "../types/sale.types";

export async function createSale(payload: CreateSalePayload) {
  return apiFetch<SaleDetailDto>(ENDPOINTS.sales.root, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
