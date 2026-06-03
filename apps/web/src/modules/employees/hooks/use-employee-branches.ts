import { useQuery } from "@tanstack/react-query";

import { getBranchesForSelect } from "../api/get-branches";
import { employeeKeys } from "../query-keys";

export function useEmployeeBranches() {
  return useQuery({
    queryKey: employeeKeys.branches,
    queryFn: getBranchesForSelect,
    staleTime: 60_000,
  });
}
