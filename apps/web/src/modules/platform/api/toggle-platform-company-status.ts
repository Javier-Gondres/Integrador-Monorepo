import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export async function togglePlatformCompanyStatus(
  id: string,
  isActive: boolean,
) {
  const endpoint = isActive
    ? ENDPOINTS.platform.deactivateCompany(id)
    : ENDPOINTS.platform.activateCompany(id);

  return apiFetch(endpoint, { method: "PATCH" });
}
