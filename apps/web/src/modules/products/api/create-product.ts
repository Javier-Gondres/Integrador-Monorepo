import { apiFetch } from "@/lib/api/client";

import type { ProductDto, ProductFormValues } from "../types/product.types";

export async function createProduct(data: ProductFormValues) {
  return apiFetch<ProductDto>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
