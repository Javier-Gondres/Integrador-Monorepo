import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createReceivablePayment,
  fetchAccountReceivable,
  fetchCustomerReceivables,
  fetchReceivableCustomers,
} from "../api/accounts-receivable-api";
import { accountsReceivableKeys } from "../query-keys";
import { AccountsReceivableQuery } from "../types/accounts-receivable";

export function useReceivableCustomers(query: AccountsReceivableQuery) {
  return useQuery({
    queryKey: accountsReceivableKeys.customers(query),
    queryFn: () => fetchReceivableCustomers(query),
  });
}

export function useCustomerReceivables(
  customerId: string,
  query: AccountsReceivableQuery,
) {
  return useQuery({
    queryKey: accountsReceivableKeys.customerReceivables(customerId, query),
    queryFn: () => fetchCustomerReceivables(customerId, query),
    enabled: !!customerId,
  });
}

export function useAccountReceivable(id: string) {
  return useQuery({
    queryKey: accountsReceivableKeys.detail(id),
    queryFn: () => fetchAccountReceivable(id),
    enabled: !!id,
  });
}

export function useCreateReceivablePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { amount: number; method: string; notes?: string };
    }) => createReceivablePayment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: accountsReceivableKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: accountsReceivableKeys.detail(variables.id),
      });
    },
  });
}
