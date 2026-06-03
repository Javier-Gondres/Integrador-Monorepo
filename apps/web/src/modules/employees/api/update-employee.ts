import { apiFetch } from "@/lib/api/client";

import type { EmployeeDto, EmployeeFormValues } from "../types/employee.types";

export async function updateEmployee(
  id: string,
  data: Partial<EmployeeFormValues> & { terminationDate?: string },
) {
  return apiFetch<EmployeeDto>(`/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
