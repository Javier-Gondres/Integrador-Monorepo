import type { ReturnFilters } from "./types/return.types";

export const returnKeys = {
  all: ["returns"] as const,

  list: (filters?: ReturnFilters) => ["returns", "list", filters] as const,

  detail: (id: string) => ["returns", "detail", id] as const,
};
