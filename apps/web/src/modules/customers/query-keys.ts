import type { CustomerFilters } from "./types/customer.types";

export const customerKeys = {
  all: ["customers"] as const,

  list: (filters?: CustomerFilters) => ["customers", "list", filters] as const,

  detail: (id: string) => ["customers", "detail", id] as const,
};
