import type { UserFilters } from "./types/user.types";

export const userKeys = {
  all: ["users"] as const,
  list: (filters?: UserFilters) => ["users", "list", filters] as const,
  detail: (id: string) => ["users", "detail", id] as const,
  roles: ["users", "roles"] as const,
};
