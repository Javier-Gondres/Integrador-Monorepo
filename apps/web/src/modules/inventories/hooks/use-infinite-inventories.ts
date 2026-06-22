import { useInfiniteQuery } from "@tanstack/react-query";

import { getInventories } from "../api/get-inventories";
import { mapInventoriesPageToUi } from "../mappers/inventory.mapper";
import { inventoryKeys } from "../query-keys";
import type { InventoryFilters } from "../types/inventory.types";

export function useInfiniteInventories(filters?: Omit<InventoryFilters, "page">) {
  return useInfiniteQuery({
    queryKey: [...inventoryKeys.list(filters), "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getInventories({ ...filters, page: pageParam });
      return mapInventoriesPageToUi(response);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    enabled: Boolean(filters?.branchId),
  });
}
