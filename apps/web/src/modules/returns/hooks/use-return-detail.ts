import { useQuery } from "@tanstack/react-query";

import { getReturn } from "../api/get-return";
import { mapReturnDetailToUi } from "../mappers/return.mapper";
import { returnKeys } from "../query-keys";

export function useReturnDetail(id: string | null) {
  return useQuery({
    queryKey: returnKeys.detail(id ?? ""),
    queryFn: async () => mapReturnDetailToUi(await getReturn(id!)),
    enabled: Boolean(id),
  });
}
