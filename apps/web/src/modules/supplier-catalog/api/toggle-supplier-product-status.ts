import { apiFetch } from "@/lib/api/client";

import type { SupplierProductDto } from "../types/supplier-product.types";

export async function activateSupplierProduct(
  supplierId: string,
  productId: string,
) {
  return apiFetch<SupplierProductDto>(
    `/suppliers/${supplierId}/products/${productId}/activate`,
    { method: "PATCH" },
  );
}

export async function deactivateSupplierProduct(
  supplierId: string,
  productId: string,
) {
  return apiFetch<SupplierProductDto>(
    `/suppliers/${supplierId}/products/${productId}/deactivate`,
    { method: "PATCH" },
  );
}
