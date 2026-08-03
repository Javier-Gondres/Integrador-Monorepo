export const branchKeys = {
  all: ["branches"] as const,

  list: () => ["branches", "list"] as const,
};
