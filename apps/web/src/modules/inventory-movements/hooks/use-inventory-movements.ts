import { useQuery } from "@tanstack/react-query";

import { getInventoryMovements } from "../api/get-inventory-movements";
import { mapInventoryMovementsPageToUi } from "../mappers/inventory-movement.mapper";
import { inventoryMovementKeys } from "../query-keys";
import type { InventoryMovementFilters } from "../types/inventory-movement.types";

export function useInventoryMovements(filters?: InventoryMovementFilters) {
  return useQuery({
    queryKey: inventoryMovementKeys.list(filters),
    queryFn: async () =>
      mapInventoryMovementsPageToUi(await getInventoryMovements(filters)),
    enabled: Boolean(filters?.branchId),
  });
}
