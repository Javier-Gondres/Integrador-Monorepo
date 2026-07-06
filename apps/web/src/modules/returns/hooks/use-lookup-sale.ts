import { useMutation } from "@tanstack/react-query";

import { lookupSaleByNcf } from "../api/lookup-sale-by-ncf";

export function useLookupSale() {
  return useMutation({
    mutationFn: (ncf: string) => lookupSaleByNcf(ncf),
  });
}
