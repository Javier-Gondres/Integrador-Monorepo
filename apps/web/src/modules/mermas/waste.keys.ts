import type { WasteFilters } from "./types/waste.types";

export const wasteKeys = {
  all: ["waste"] as const,
  lists: () => [...wasteKeys.all, "list"] as const,
  list: (filters?: WasteFilters) => [...wasteKeys.lists(), filters] as const,
};
