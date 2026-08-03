import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { EmployeeDto } from "../types/employee.types";

export function upsertLaborProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    position?: string;
    salary?: number;
    branchId: string;
    roleId?: string;
  },
) {
  return apiFetch<EmployeeDto>(
    ENDPOINTS.employees.laborProfileByUserId(userId),
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}
