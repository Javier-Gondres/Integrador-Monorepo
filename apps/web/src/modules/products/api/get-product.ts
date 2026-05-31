import { apiFetch } from "@/lib/api/client";

import type { ProductDto } from "../types/product.types";

export async function getProduct(id: string) {
  return apiFetch<ProductDto>(`/products/${id}`);
}
