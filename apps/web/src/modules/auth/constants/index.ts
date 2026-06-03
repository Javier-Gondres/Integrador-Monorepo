/** Constantes del módulo auth — endpoints, storage keys, etc. */
export const AUTH_STORAGE_KEY = "erp_auth_session";

/** Usuario OWNER del seed de desarrollo (`pnpm --filter @repo/db run db:seed:dev`). */
export const DEV_TEST_USER = {
  email: "prueba@ejemplo.com",
  password: "Password123",
} as const;
