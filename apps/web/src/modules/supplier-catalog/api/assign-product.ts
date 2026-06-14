import { apiFetch } from "@/lib/api/client";

import type { SupplierProductDto } from "../types/supplier-product.types";

export interface AssignProductPayload {
  productId: string;
  lastCost?: number;
}

export async function assignProduct(
  supplierId: string,
  payload: AssignProductPayload,
) {
  return apiFetch<SupplierProductDto>(`/suppliers/${supplierId}/products`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
