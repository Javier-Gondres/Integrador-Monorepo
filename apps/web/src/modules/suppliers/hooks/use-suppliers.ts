import { useQuery } from "@tanstack/react-query";

import { getSuppliers } from "../api/get-suppliers";
import { mapSuppliersPageToUi } from "../mappers/supplier.mapper";
import { supplierKeys } from "../query-keys";
import type { SupplierFilters } from "../types/supplier.types";

export function useSuppliers(filters?: SupplierFilters) {
  return useQuery({
    queryKey: supplierKeys.list(filters),
    queryFn: async () => mapSuppliersPageToUi(await getSuppliers(filters)),
  });
}
