import { useQuery } from "@tanstack/react-query";

import { getInventories } from "../api/get-inventories";
import { mapInventoriesPageToUi } from "../mappers/inventory.mapper";
import { inventoryKeys } from "../query-keys";
import type { InventoryFilters } from "../types/inventory.types";

export function useInventories(filters?: InventoryFilters) {
  return useQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn: async () => mapInventoriesPageToUi(await getInventories(filters)),
    enabled: Boolean(filters?.branchId),
  });
}
