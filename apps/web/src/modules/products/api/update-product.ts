import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { ProductDto, ProductFormValues } from "../types/product.types";

export async function updateProduct(id: string, data: ProductFormValues) {
  return apiFetch<ProductDto>(ENDPOINTS.products.byId(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
