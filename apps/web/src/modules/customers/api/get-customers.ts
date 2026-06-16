import { apiFetch } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/pagination";

import type { CustomerDto, CustomerFilters } from "../types/customer.types";

export async function getCustomers(filters?: CustomerFilters) {
  return apiFetch<PaginatedResponse<CustomerDto>>("/customers", {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      isActive: filters?.isActive,
    },
  });
}
