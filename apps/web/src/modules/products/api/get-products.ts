import { apiFetch } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/pagination";

import type { ProductDto, ProductFilters } from "../types/product.types";

export async function getProducts(filters?: ProductFilters) {
  return apiFetch<PaginatedResponse<ProductDto>>("/products", {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      categoryId: filters?.categoryId,
      isActive: filters?.isActive,
    },
  });
}
