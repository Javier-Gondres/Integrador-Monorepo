import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { CreatePlatformCompanyPayload } from "../types/platform.types";

export async function createPlatformCompany(
  data: CreatePlatformCompanyPayload,
) {
  return apiFetch(ENDPOINTS.platform.companies, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
