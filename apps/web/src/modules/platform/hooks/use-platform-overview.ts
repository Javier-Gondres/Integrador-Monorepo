import { useQuery } from "@tanstack/react-query";

import { getPlatformOverview } from "../api/get-platform-overview";
import { platformKeys } from "../query-keys";

export function usePlatformOverview() {
  return useQuery({
    queryKey: platformKeys.overview(),
    queryFn: getPlatformOverview,
  });
}
