import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

const pkgRoot = dirname(fileURLToPath(import.meta.url));

for (const file of [".env.development", ".env"]) {
  const path = resolve(pkgRoot, file);
  if (existsSync(path)) {
    loadEnv({ path });
    break;
  }
}

const datasourceUrl = process.env.DIRECT_URL;
if (!datasourceUrl) {
  throw new Error(
    "Define DIRECT_URL en packages/database/.env.development o en el entorno.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl,
  },
});
