import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { SupplierProductDto } from "../types/supplier-product.types";

export async function activateSupplierProduct(
  supplierId: string,
  productId: string,
) {
  return apiFetch<SupplierProductDto>(
    ENDPOINTS.suppliers.products.activate(supplierId, productId),
    { method: "PATCH" },
  );
}

export async function deactivateSupplierProduct(
  supplierId: string,
  productId: string,
) {
  return apiFetch<SupplierProductDto>(
    ENDPOINTS.suppliers.products.deactivate(supplierId, productId),
    { method: "PATCH" },
  );
}
