import { useQuery } from "@tanstack/react-query";

import { getSale } from "../api/get-sale";
import { saleHistoryKeys } from "../query-keys";

export function useSale(id: string | null) {
  return useQuery({
    queryKey: saleHistoryKeys.detail(id ?? ""),
    queryFn: () => getSale(id as string),
    enabled: Boolean(id),
  });
}
