import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { ProductDto, ProductFormValues } from "../types/product.types";

export async function createProduct(data: ProductFormValues) {
  return apiFetch<ProductDto>(ENDPOINTS.products.root, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
