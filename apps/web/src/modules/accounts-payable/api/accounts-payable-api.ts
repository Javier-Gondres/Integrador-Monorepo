import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import {
  AccountPayable,
  AccountPayableDetail,
  AccountsPayableQuery,
  AccountsPayableResponse,
} from "../types/accounts-payable";

export async function fetchAccountsPayable(
  query: AccountsPayableQuery,
): Promise<AccountsPayableResponse> {
  return apiFetch<AccountsPayableResponse>(ENDPOINTS.payables.root, {
    params: query as Record<string, string | number | boolean | undefined>,
  });
}

export async function fetchAccountPayable(
  id: string,
): Promise<AccountPayableDetail> {
  return apiFetch<AccountPayableDetail>(ENDPOINTS.payables.byId(id));
}

export async function updateAccountsPayable(
  id: string,
  data: { dueDate?: string },
): Promise<AccountPayable> {
  return apiFetch<AccountPayable>(ENDPOINTS.payables.byId(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function createPayablePayment(
  id: string,
  data: { amount: number; method: string; notes?: string },
): Promise<AccountPayable> {
  return apiFetch<AccountPayable>(ENDPOINTS.payables.payments(id), {
    method: "POST",
    body: JSON.stringify(data),
  });
}
