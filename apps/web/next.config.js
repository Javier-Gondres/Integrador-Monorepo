import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

if (process.env.APP_ENV === "staging") {
  config({ path: ".env.staging", override: true });
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/shared"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
