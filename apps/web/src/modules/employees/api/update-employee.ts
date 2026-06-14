import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { EmployeeDto, EmployeeFormValues } from "../types/employee.types";

export async function updateEmployee(
  id: string,
  data: Partial<EmployeeFormValues> & { terminationDate?: string },
) {
  return apiFetch<EmployeeDto>(ENDPOINTS.employees.byId(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
