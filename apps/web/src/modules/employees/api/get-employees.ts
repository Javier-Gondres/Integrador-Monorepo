import { apiFetch } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/pagination";

import type { EmployeeDto, EmployeeFilters } from "../types/employee.types";

export async function getEmployees(filters?: EmployeeFilters) {
  return apiFetch<PaginatedResponse<EmployeeDto>>("/employees", {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      isActive: filters?.isActive,
      branchId: filters?.branchId,
    },
  });
}
