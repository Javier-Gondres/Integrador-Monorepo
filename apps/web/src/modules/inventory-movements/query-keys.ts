import type { InventoryMovementFilters } from "./types/inventory-movement.types";

export const inventoryMovementKeys = {
  all: ["inventory-movements"] as const,

  list: (filters?: InventoryMovementFilters) =>
    ["inventory-movements", "list", filters] as const,
};
