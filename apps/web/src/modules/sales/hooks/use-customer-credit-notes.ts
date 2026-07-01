import { useQuery } from "@tanstack/react-query";

import { getCustomerCreditNotes } from "../api/get-customer-credit-notes";
import { saleKeys } from "../query-keys";

export function useCustomerCreditNotes(customerId: string | null) {
  return useQuery({
    queryKey: saleKeys.creditNotes(customerId),
    queryFn: () => getCustomerCreditNotes(customerId as string),
    enabled: Boolean(customerId),
  });
}
