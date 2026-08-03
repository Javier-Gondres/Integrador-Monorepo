export const authKeys = {
  all: ["auth"] as const,
  session: () => ["auth", "session"] as const,
  user: () => ["auth", "user"] as const,
};
