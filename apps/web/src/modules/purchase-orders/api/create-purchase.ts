import { apiFetch } from "@/lib/api/client";

import type {
  CreatePurchaseValues,
  PurchaseDetailDto,
} from "../types/purchase-order.types";

export async function createPurchase(data: CreatePurchaseValues) {
  return apiFetch<PurchaseDetailDto>("/purchases", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
