import { useQuery } from "@tanstack/react-query";

import { getBranches } from "../api/get-branches";
import { branchKeys } from "../query-keys";

export function useBranches() {
  return useQuery({
    queryKey: branchKeys.list(),
    queryFn: getBranches,
    staleTime: 60_000,
  });
}
