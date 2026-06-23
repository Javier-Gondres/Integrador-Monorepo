import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type {
  PlatformCompaniesApiPage,
  PlatformCompanyFilters,
} from "../types/platform.types";

export async function getPlatformCompanies(filters?: PlatformCompanyFilters) {
  return apiFetch<PlatformCompaniesApiPage>(ENDPOINTS.platform.companies, {
    params: {
      page: filters?.page,
      take: filters?.take,
      search: filters?.search,
      isActive: filters?.isActive,
    },
  });
}
