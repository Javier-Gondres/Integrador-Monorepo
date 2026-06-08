import { apiFetch } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/pagination";

import type { DiscountDto, DiscountFilters } from "../types/discount.types";

export async function getDiscounts(filters?: DiscountFilters) {
  return apiFetch<PaginatedResponse<DiscountDto>>("/discounts", {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      isActive: filters?.isActive,
      isCurrent: filters?.isCurrent,
    },
  });
}