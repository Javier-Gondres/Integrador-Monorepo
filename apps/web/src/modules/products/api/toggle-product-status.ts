import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { ProductDto } from "../types/product.types";

export async function activateProduct(id: string) {
  return apiFetch<ProductDto>(ENDPOINTS.products.activate(id), {
    method: "PATCH",
  });
}

export async function deactivateProduct(id: string) {
  return apiFetch<ProductDto>(ENDPOINTS.products.deactivate(id), {
    method: "PATCH",
  });
}
