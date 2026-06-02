import { apiFetch } from "@/lib/api/client";

import type { ProductDto, ProductFormValues } from "../types/product.types";

export async function updateProduct(id: string, data: ProductFormValues) {
  return apiFetch<ProductDto>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
