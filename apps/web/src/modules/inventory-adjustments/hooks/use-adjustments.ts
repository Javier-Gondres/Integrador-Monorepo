import { useQuery } from "@tanstack/react-query";

import { getAdjustments } from "../api/get-adjustments";
import { mapAdjustmentsPageToUi } from "../mappers/adjustment.mapper";
import { adjustmentKeys } from "../query-keys";
import type { AdjustmentFilters } from "../types/inventory-adjustment.types";

export function useAdjustments(filters?: AdjustmentFilters) {
  return useQuery({
    queryKey: adjustmentKeys.list(filters),
    queryFn: async () => mapAdjustmentsPageToUi(await getAdjustments(filters)),
    enabled: Boolean(filters?.branchId),
  });
}
