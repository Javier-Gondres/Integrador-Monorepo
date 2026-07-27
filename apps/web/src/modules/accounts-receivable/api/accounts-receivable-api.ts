import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import {
  AccountReceivableDetail,
  AccountsReceivableQuery,
  AccountsReceivableResponse,
  ReceivableCustomerResponse,
} from "../types/accounts-receivable";

export async function fetchReceivableCustomers(
  query: AccountsReceivableQuery,
): Promise<ReceivableCustomerResponse> {
  return apiFetch<ReceivableCustomerResponse>(ENDPOINTS.receivables.root, {
    params: query as Record<string, string | number | boolean | undefined>,
  });
}

export async function fetchCustomerReceivables(
  customerId: string,
  query: AccountsReceivableQuery,
): Promise<AccountsReceivableResponse> {
  return apiFetch<AccountsReceivableResponse>(
    ENDPOINTS.receivables.byCustomer(customerId),
    {
      params: query as Record<string, string | number | boolean | undefined>,
    },
  );
}

export async function fetchAccountReceivable(
  id: string,
): Promise<AccountReceivableDetail> {
  return apiFetch<AccountReceivableDetail>(ENDPOINTS.receivables.byId(id));
}

export async function createReceivablePayment(
  id: string,
  data: { amount: number; method: string; notes?: string },
): Promise<AccountReceivableDetail> {
  return apiFetch<AccountReceivableDetail>(
    ENDPOINTS.receivables.payments(id),
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}
