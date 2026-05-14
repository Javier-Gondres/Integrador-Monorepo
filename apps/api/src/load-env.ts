import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

/** Debe importarse antes que `AppModule` para que `process.env` exista al cargar `@repo/db`. */
const file =
  process.env.APP_ENV === "staging" ? ".env.staging" : ".env.development";
const path = resolve(process.cwd(), file);
if (existsSync(path)) {
  config({ path });
}
