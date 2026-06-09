/** Usuario OWNER del seed de desarrollo (`pnpm --filter @repo/db run db:seed:dev`). */
export const DEV_TEST_USER = {
  email: "prueba@ejemplo.com",
  password: "Password123",
} as const;

export const AUTH_ROUTES = {
  login: "/",
  dashboard: "/dashboard",
} as const;
