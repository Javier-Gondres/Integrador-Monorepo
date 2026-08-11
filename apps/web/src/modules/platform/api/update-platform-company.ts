import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { UpdatePlatformCompanyPayload } from "../types/platform.types";

export async function updatePlatformCompany(
  id: string,
  data: UpdatePlatformCompanyPayload,
) {
  return apiFetch(ENDPOINTS.platform.companyById(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
