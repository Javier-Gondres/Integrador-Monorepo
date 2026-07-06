export const platformKeys = {
  all: ["platform"] as const,
  overview: () => ["platform", "overview"] as const,
  companies: (filters?: unknown) => ["platform", "companies", filters] as const,
};
