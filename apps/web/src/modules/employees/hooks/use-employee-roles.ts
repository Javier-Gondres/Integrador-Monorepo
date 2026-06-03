import { useQuery } from "@tanstack/react-query";

import { getRolesForSelect } from "../api/get-roles";
import { employeeKeys } from "../query-keys";

export function useEmployeeRoles() {
  return useQuery({
    queryKey: employeeKeys.roles,
    queryFn: getRolesForSelect,
    staleTime: 60_000,
  });
}
