import { useQuery } from "@tanstack/react-query";

import { purchaseKeys } from "@/modules/purchase-orders/query-keys";

import { getPurchase } from "../api/get-purchase";

export function usePurchase(id: string | null) {
  return useQuery({
    queryKey: purchaseKeys.detail(id ?? ""),
    queryFn: () => getPurchase(id as string),
    enabled: Boolean(id),
  });
}
