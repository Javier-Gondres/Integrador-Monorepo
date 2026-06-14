import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/pagination";

import type { SupplierDto, SupplierFilters } from "../types/supplier.types";

export async function getSuppliers(filters?: SupplierFilters) {
  return apiFetch<PaginatedResponse<SupplierDto>>(ENDPOINTS.suppliers.root, {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      isActive: filters?.isActive,
    },
  });
}
