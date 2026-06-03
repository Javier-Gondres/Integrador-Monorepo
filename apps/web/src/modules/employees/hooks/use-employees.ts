import { useQuery } from "@tanstack/react-query";

import { getEmployees } from "../api/get-employees";
import { mapEmployeesPageToUi } from "../mappers/employee.mapper";
import { employeeKeys } from "../query-keys";
import type { EmployeeFilters } from "../types/employee.types";

export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: async () => mapEmployeesPageToUi(await getEmployees(filters)),
  });
}
