import type { EmployeeFilters } from "./types/employee.types";

export const employeeKeys = {
  all: ["employees"] as const,
  list: (filters?: EmployeeFilters) =>
    ["employees", "list", filters] as const,
  detail: (id: string) => ["employees", "detail", id] as const,
  branches: ["employees", "branches"] as const,
  roles: ["employees", "roles"] as const,
};
