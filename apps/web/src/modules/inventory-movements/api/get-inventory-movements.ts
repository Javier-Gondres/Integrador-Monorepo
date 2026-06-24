import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/pagination";

import type {
  InventoryMovementDto,
  InventoryMovementFilters,
} from "../types/inventory-movement.types";

export async function getInventoryMovements(
  filters?: InventoryMovementFilters,
) {
  return apiFetch<PaginatedResponse<InventoryMovementDto>>(
    ENDPOINTS.inventoryMovements.root,
    {
      params: {
        page: filters?.page,
        take: filters?.take,
        search: filters?.search,
        branchId: filters?.branchId,
        type: filters?.type,
        dateFrom: filters?.dateFrom,
        dateTo: filters?.dateTo,
      },
    },
  );
}
