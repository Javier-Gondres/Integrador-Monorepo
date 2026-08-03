import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export async function getTransferStock(branchId: string, productId: string) {
  return apiFetch<{ quantity: number }>(ENDPOINTS.transfers.stock, {
    params: { branchId, productId },
  });
}
