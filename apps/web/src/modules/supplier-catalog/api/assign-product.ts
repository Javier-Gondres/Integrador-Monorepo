import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { SupplierProductDto } from "../types/supplier-product.types";

export interface AssignProductPayload {
  productId: string;
  lastCost?: number;
}

export async function assignProduct(
  supplierId: string,
  payload: AssignProductPayload,
) {
  return apiFetch<SupplierProductDto>(
    ENDPOINTS.suppliers.products.root(supplierId),
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
