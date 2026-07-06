import { useQuery } from "@tanstack/react-query";

import { getPlatformCompanies } from "../api/get-platform-companies";
import { mapPlatformCompaniesPageToUi } from "../mappers/platform-company.mapper";
import { platformKeys } from "../query-keys";
import type { PlatformCompanyFilters } from "../types/platform.types";

export function usePlatformCompanies(filters?: PlatformCompanyFilters) {
  return useQuery({
    queryKey: platformKeys.companies(filters),
    queryFn: async () =>
      mapPlatformCompaniesPageToUi(await getPlatformCompanies(filters)),
  });
}
