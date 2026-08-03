import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/pagination";

import type { CustomerDto, CustomerFilters } from "../types/customer.types";

export async function getCustomers(filters?: CustomerFilters) {
  return apiFetch<PaginatedResponse<CustomerDto>>(ENDPOINTS.customers.root, {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      isActive: filters?.isActive,
    },
  });
}
