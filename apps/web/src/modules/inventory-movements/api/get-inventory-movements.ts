import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/pagination";

import type {
  InventoryMovementDto,
  InventoryMovementFilters,
} from "../types/inventory-movement.types";

function dayBoundaryIso(date: string, end: boolean): string | undefined {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  const d = end
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);
  return d.toISOString();
}

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
        dateFrom: filters?.dateFrom
          ? dayBoundaryIso(filters.dateFrom, false)
          : undefined,
        dateTo: filters?.dateTo
          ? dayBoundaryIso(filters.dateTo, true)
          : undefined,
      },
    },
  );
}
