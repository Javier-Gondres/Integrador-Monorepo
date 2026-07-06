export const purchaseKeys = {
  all: ["purchases"] as const,

  list: (filters?: unknown) => ["purchases", "list", filters] as const,

  detail: (id: string) => ["purchases", "detail", id] as const,
};
