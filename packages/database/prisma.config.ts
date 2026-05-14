import { defineConfig, env } from "prisma/config";

// Variables vienen de `dotenv-cli` en los scripts (p. ej. `.env.development`) o del entorno (CI). No cargar `.env` aquí para no duplicar criterios.
// CLI = DIRECT_URL (migrate). Runtime = DATABASE_URL en client.ts. Supabase: :6543 transaction vs :5432 session/direct; no migrate en :6543.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
