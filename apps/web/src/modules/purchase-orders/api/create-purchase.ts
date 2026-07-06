import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type {
  CreatePurchaseValues,
  PurchaseDetailDto,
} from "../types/purchase-order.types";

export async function createPurchase(data: CreatePurchaseValues) {
  return apiFetch<PurchaseDetailDto>(ENDPOINTS.purchases.root, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
