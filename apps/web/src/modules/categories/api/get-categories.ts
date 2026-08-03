import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/pagination";

import type { CategoryDto, CategoryFilters } from "../types/category.types";

export async function getCategories(filters?: CategoryFilters) {
  return apiFetch<PaginatedResponse<CategoryDto>>(ENDPOINTS.categories.root, {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      isActive: filters?.isActive,
    },
  });
}
