import type { AdjustmentFilters } from "./types/inventory-adjustment.types";

export const adjustmentKeys = {
  all: ["inventory-adjustments"] as const,

  list: (filters?: AdjustmentFilters) =>
    ["inventory-adjustments", "list", filters] as const,
};
