/** Módulo users — scaffold RBAC. Implementar CRUD cuando el API esté listo. */
export const userKeys = {
  all: ["users"] as const,
  list: (filters?: Record<string, unknown>) => ["users", "list", filters] as const,
  detail: (id: string) => ["users", "detail", id] as const,
};
