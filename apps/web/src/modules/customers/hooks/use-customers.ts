import { useQuery } from "@tanstack/react-query";

import { getCustomers } from "../api/get-customers";
import { mapCustomersPageToUi } from "../mappers/customer.mapper";
import { customerKeys } from "../query-keys";
import type { CustomerFilters } from "../types/customer.types";

export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: async () => mapCustomersPageToUi(await getCustomers(filters)),
  });
}
