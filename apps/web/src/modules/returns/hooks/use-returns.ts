import { useQuery } from "@tanstack/react-query";

import { getReturns } from "../api/get-returns";
import { mapReturnsPageToUi } from "../mappers/return.mapper";
import { returnKeys } from "../query-keys";
import type { ReturnFilters } from "../types/return.types";

export function useReturns(filters?: ReturnFilters) {
  return useQuery({
    queryKey: returnKeys.list(filters),
    queryFn: async () => mapReturnsPageToUi(await getReturns(filters)),
  });
}
