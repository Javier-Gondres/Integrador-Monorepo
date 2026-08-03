import { useQuery } from "@tanstack/react-query";

import { getSales } from "../api/get-sales";
import { saleHistoryKeys } from "../query-keys";
import type { SaleHistoryFilters } from "../types/sales-history.types";

export function useSales(filters?: SaleHistoryFilters) {
  return useQuery({
    queryKey: saleHistoryKeys.list(filters),
    queryFn: () => getSales(filters),
  });
}
