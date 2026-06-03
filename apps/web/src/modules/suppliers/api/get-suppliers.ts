import { apiFetch } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/pagination";

import type { SupplierDto, SupplierFilters } from "../types/supplier.types";

export async function getSuppliers(filters?: SupplierFilters) {
  return apiFetch<PaginatedResponse<SupplierDto>>("/suppliers", {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      isActive: filters?.isActive,
    },
  });
}
