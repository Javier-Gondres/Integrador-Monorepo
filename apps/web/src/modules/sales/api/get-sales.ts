import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/pagination";

import type { SaleFilters, SaleListItemDto } from "../types/sale.types";

export async function getSales(filters?: SaleFilters) {
  return apiFetch<PaginatedResponse<SaleListItemDto>>(ENDPOINTS.sales.root, {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      branchId: filters?.branchId,
      status: filters?.status,
    },
  });
}
