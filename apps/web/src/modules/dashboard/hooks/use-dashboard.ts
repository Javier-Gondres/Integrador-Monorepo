import { useQuery } from "@tanstack/react-query";

import { fetchDashboardSummary } from "../api/dashboard-api";

export function useDashboardSummary(
  branchId?: string,
  days: number = 7,
  month?: string,
) {
  return useQuery({
    queryKey: ["dashboard", "summary", branchId, days, month],
    queryFn: () => fetchDashboardSummary(branchId, days, month),
    staleTime: 0, // Always fetch fresh data on mount
    refetchOnWindowFocus: true, // Auto-update when returning to tab
    refetchInterval: 15000, // Refresh automatically every 15 seconds
  });
}
