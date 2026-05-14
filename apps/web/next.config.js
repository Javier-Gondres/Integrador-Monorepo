import { config } from "dotenv";

if (process.env.APP_ENV === "staging") {
  config({ path: ".env.staging", override: true });
}

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
