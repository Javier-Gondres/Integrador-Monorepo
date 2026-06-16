import { apiFetch } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/pagination";

import type {
  PurchaseFilters,
  PurchaseListDto,
} from "../types/purchase-history.types";

export async function getPurchases(filters?: PurchaseFilters) {
  return apiFetch<PaginatedResponse<PurchaseListDto>>("/purchases", {
    params: {
      page: filters?.page,
      take: filters?.take,
      branchId: filters?.branchId,
      supplierId: filters?.supplierId,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
    },
  });
}
