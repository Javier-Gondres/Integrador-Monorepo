import { apiFetch } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/pagination";

import type { InventoryDto, InventoryFilters } from "../types/inventory.types";

export async function getInventories(filters?: InventoryFilters) {
  return apiFetch<PaginatedResponse<InventoryDto>>("/inventories", {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      branchId: filters?.branchId,
      isActive: filters?.isActive,
      needsRestock: filters?.needsRestock,
    },
  });
}
