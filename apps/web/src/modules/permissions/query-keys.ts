/** Módulo permissions — scaffold RBAC. */
export const permissionKeys = {
  all: ["permissions"] as const,
  list: () => ["permissions", "list"] as const,
  detail: (id: string) => ["permissions", "detail", id] as const,
};
