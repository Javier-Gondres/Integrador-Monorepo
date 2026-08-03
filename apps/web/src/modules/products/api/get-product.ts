import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { ProductDto } from "../types/product.types";

export async function getProduct(id: string) {
  return apiFetch<ProductDto>(ENDPOINTS.products.byId(id));
}
