import { apiFetch } from "@/lib/api/client";
import {
  AccountsPayableQuery,
  AccountsPayableResponse,
  AccountPayable,
  AccountPayableDetail,
} from "../types/accounts-payable";

export async function fetchAccountsPayable(
  query: AccountsPayableQuery,
): Promise<AccountsPayableResponse> {
  return apiFetch<AccountsPayableResponse>("/payables", {
    params: query as Record<string, string | number | boolean | undefined>,
  });
}

export async function fetchAccountPayable(
  id: string,
): Promise<AccountPayableDetail> {
  return apiFetch<AccountPayableDetail>(`/payables/${id}`);
}

export async function updateAccountsPayable(
  id: string,
  data: { dueDate?: string },
): Promise<AccountPayable> {
  return apiFetch<AccountPayable>(`/payables/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function createPayablePayment(
  id: string,
  data: { amount: number; method: string; notes?: string },
): Promise<AccountPayable> {
  return apiFetch<AccountPayable>(`/payables/${id}/payments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
