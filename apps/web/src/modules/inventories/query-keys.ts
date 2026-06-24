import type { InventoryFilters } from "./types/inventory.types";

export const inventoryKeys = {
  all: ["inventories"] as const,

  list: (filters?: InventoryFilters) =>
    ["inventories", "list", filters] as const,

  detail: (id: string) => ["inventories", "detail", id] as const,
};
