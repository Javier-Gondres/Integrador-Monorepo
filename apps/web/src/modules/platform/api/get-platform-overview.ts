import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { PlatformOverview } from "../types/platform.types";

export async function getPlatformOverview() {
  return apiFetch<PlatformOverview>(ENDPOINTS.platform.overview);
}
