import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/pagination";

import type { ProductDto, ProductFilters } from "../types/product.types";

export async function getProducts(filters?: ProductFilters) {
  return apiFetch<PaginatedResponse<ProductDto>>(ENDPOINTS.products.root, {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      categoryId: filters?.categoryId,
      excludeSupplierId: filters?.excludeSupplierId,
      isActive: filters?.isActive,
    },
  });
}
