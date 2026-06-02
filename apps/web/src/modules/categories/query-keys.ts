import type { CategoryFilters } from "./types/category.types";

export const categoryKeys = {
  all: ["categories"] as const,

  list: (filters?: CategoryFilters) => ["categories", "list", filters] as const,

  detail: (id: string) => ["categories", "detail", id] as const,
};
