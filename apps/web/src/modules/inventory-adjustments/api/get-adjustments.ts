import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/pagination";

import type {
  AdjustmentDto,
  AdjustmentFilters,
} from "../types/inventory-adjustment.types";

export async function getAdjustments(filters?: AdjustmentFilters) {
  return apiFetch<PaginatedResponse<AdjustmentDto>>(
    ENDPOINTS.inventoryMovements.root,
    {
      params: {
        type: "ADJUSTMENT",
        page: filters?.page,
        take: filters?.take,
        search: filters?.search,
        branchId: filters?.branchId,
        adjustmentReason: filters?.adjustmentReason,
      },
    },
  );
}
