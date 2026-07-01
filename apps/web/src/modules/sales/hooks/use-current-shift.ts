import { useQuery } from "@tanstack/react-query";

import { getCurrentShift } from "../api/get-current-shift";
import { saleKeys } from "../query-keys";

export function useCurrentShift(branchId: string | null) {
  return useQuery({
    queryKey: saleKeys.currentShift(branchId),
    queryFn: () => getCurrentShift(branchId as string),
    enabled: Boolean(branchId),
  });
}
