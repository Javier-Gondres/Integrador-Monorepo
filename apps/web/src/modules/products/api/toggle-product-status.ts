import { apiFetch } from "@/lib/api/client";

import type { ProductDto } from "../types/product.types";

export async function activateProduct(id: string) {
  return apiFetch<ProductDto>(`/products/${id}/activate`, {
    method: "PATCH",
  });
}

export async function deactivateProduct(id: string) {
  return apiFetch<ProductDto>(`/products/${id}/deactivate`, {
    method: "PATCH",
  });
}
