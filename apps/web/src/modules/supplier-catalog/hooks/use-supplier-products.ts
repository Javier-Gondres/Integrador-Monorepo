import { useQuery } from "@tanstack/react-query";

import { getSupplierProducts } from "../api/get-supplier-products";
import { mapSupplierProductsPageToUi } from "../mappers/supplier-product.mapper";
import { supplierCatalogKeys } from "../query-keys";
import type { SupplierProductFilters } from "../types/supplier-product.types";

export function useSupplierProducts(
  supplierId: string | null,
  filters?: SupplierProductFilters,
) {
  return useQuery({
    queryKey: supplierCatalogKeys.products(supplierId ?? "", filters),
    queryFn: async () =>
      mapSupplierProductsPageToUi(
        await getSupplierProducts(supplierId as string, filters),
      ),
    enabled: Boolean(supplierId),
  });
}
