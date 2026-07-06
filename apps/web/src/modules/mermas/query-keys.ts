import type { WasteFilters } from "./types/waste.types";

export const wasteKeys = {
  all: ["waste"] as const,

  list: (filters?: WasteFilters) => ["waste", "list", filters] as const,
};
