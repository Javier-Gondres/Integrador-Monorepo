import { useQuery } from "@tanstack/react-query";

import { purchaseKeys } from "@/modules/purchase-orders/query-keys";

import { getPurchases } from "../api/get-purchases";
import type { PurchaseFilters } from "../types/purchase-history.types";

export function usePurchases(filters?: PurchaseFilters) {
  return useQuery({
    queryKey: purchaseKeys.list(filters),
    queryFn: () => getPurchases(filters),
  });
}
