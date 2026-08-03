import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/pagination";

import type { ReturnFilters, ReturnListItemDto } from "../types/return.types";

export async function getReturns(filters?: ReturnFilters) {
  return apiFetch<PaginatedResponse<ReturnListItemDto>>(
    ENDPOINTS.returns.root,
    {
      params: {
        page: filters?.page,
        take: filters?.take,
        search: filters?.search,
        branchId: filters?.branchId,
        dateFrom: filters?.dateFrom,
        dateTo: filters?.dateTo,
      },
    },
  );
}
