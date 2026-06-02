import { apiFetch } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/pagination";

import type { CategoryDto, CategoryFilters } from "../types/category.types";

export async function getCategories(filters?: CategoryFilters) {
  return apiFetch<PaginatedResponse<CategoryDto>>("/categories", {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      isActive: filters?.isActive,
    },
  });
}
