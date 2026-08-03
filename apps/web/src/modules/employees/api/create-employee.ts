import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { EmployeeDto, EmployeeFormValues } from "../types/employee.types";

export async function createEmployee(data: EmployeeFormValues) {
  return apiFetch<EmployeeDto>(ENDPOINTS.employees.root, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
