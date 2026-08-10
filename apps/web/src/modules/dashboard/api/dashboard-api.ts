import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export interface DashboardSummary {
  kpis: {
    salesToday: number;
    salesYesterday: number;
    receivablesBalance: number;
    payablesBalance: number;
    cashOnHand: number;
    avgCollectionDays: number;
    avgPaymentDays: number;
  };
  charts: {
    comparisonHistory: Array<{
      date: string;
      sales: number;
      purchases: number;
    }>;
    categoriesDistribution: Array<{
      name: string;
      value: number;
    }>;
    topProducts: Array<{
      id: string;
      name: string;
      quantity: number;
      total: number;
      categories: string[];
    }>;
  };
  recentMovements: Array<{
    id: string;
    productName: string;
    productCode: string;
    type: string;
    quantity: number;
    referenceNumber: string | null;
    notes: string | null;
    createdAt: string;
    performedBy: string;
  }>;
}

export async function fetchDashboardSummary(
  branchId?: string,
  days: number = 7,
  month?: string,
): Promise<DashboardSummary> {
  const params = new URLSearchParams();
  if (branchId && branchId !== "todas") {
    params.append("branchId", branchId);
  }
  if (month) {
    params.append("month", month);
  } else {
    params.append("days", days.toString());
  }

  return apiFetch<DashboardSummary>(
    `${ENDPOINTS.dashboard.summary}?${params.toString()}`,
  );
}
