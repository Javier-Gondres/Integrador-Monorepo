/** Módulo roles — scaffold RBAC. */
export const roleKeys = {
  all: ["roles"] as const,
  list: (filters?: Record<string, unknown>) =>
    ["roles", "list", filters] as const,
  detail: (id: string) => ["roles", "detail", id] as const,
};
