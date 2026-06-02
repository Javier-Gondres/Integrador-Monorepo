import { useQuery } from "@tanstack/react-query";

import { getProducts } from "../api/get-products";
import { mapProductsPageToUi } from "../mappers/product.mapper";
import { productKeys } from "../query-keys";
import type { ProductFilters } from "../types/product.types";

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => mapProductsPageToUi(await getProducts(filters)),
  });
}
