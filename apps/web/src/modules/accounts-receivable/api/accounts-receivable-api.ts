import { apiFetch } from "@/lib/api/client";

import {
  AccountReceivableDetail,
  AccountsReceivableQuery,
  AccountsReceivableResponse,
  ReceivableCustomerResponse,
} from "../types/accounts-receivable";

export async function fetchReceivableCustomers(
  query: AccountsReceivableQuery,
): Promise<ReceivableCustomerResponse> {
  return apiFetch<ReceivableCustomerResponse>("/receivables", {
    params: query as Record<string, string | number | boolean | undefined>,
  });
}

export async function fetchCustomerReceivables(
  customerId: string,
  query: AccountsReceivableQuery,
): Promise<AccountsReceivableResponse> {
  return apiFetch<AccountsReceivableResponse>(`/receivables/customers/${customerId}`, {
    params: query as Record<string, string | number | boolean | undefined>,
  });
}

export async function fetchAccountReceivable(
  id: string,
): Promise<AccountReceivableDetail> {
  return apiFetch<AccountReceivableDetail>(`/receivables/${id}`);
}

export async function createReceivablePayment(
  id: string,
  data: { amount: number; method: string; notes?: string },
): Promise<AccountReceivableDetail> {
  return apiFetch<AccountReceivableDetail>(`/receivables/${id}/payments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
