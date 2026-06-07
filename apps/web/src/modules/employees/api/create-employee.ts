import { apiFetch } from "@/lib/api/client";

import type { EmployeeDto, EmployeeFormValues } from "../types/employee.types";

export async function createEmployee(data: EmployeeFormValues) {
  return apiFetch<EmployeeDto>("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
