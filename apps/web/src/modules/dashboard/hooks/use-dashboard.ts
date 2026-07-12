import { useQuery } from "@tanstack/react-query";

import { fetchDashboardSummary } from "../api/dashboard-api";

export function useDashboardSummary(branchId?: string, days: number = 7) {
  return useQuery({
    queryKey: ["dashboard", "summary", branchId, days],
    queryFn: () => fetchDashboardSummary(branchId, days),
    staleTime: 60 * 1000, // 1 minute stale time
    refetchOnWindowFocus: false,
  });
}
