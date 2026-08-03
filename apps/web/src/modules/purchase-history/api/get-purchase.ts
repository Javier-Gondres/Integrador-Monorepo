import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PurchaseDetailDto } from "@/modules/purchase-orders/types/purchase-order.types";

export async function getPurchase(id: string) {
  return apiFetch<PurchaseDetailDto>(ENDPOINTS.purchases.byId(id));
}
