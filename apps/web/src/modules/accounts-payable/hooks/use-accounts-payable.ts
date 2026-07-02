import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAccountsPayable, updateAccountsPayable, createPayablePayment, fetchAccountPayable } from '../api/accounts-payable-api';
import { accountsPayableKeys } from '../query-keys';
import { AccountsPayableQuery } from '../types/accounts-payable';

export function useAccountsPayable(query: AccountsPayableQuery) {
  return useQuery({
    queryKey: accountsPayableKeys.list(query),
    queryFn: () => fetchAccountsPayable(query),
  });
}

export function useAccountPayable(id: string) {
  return useQuery({
    queryKey: accountsPayableKeys.detail(id),
    queryFn: () => fetchAccountPayable(id),
    enabled: !!id,
  });
}

export function useUpdateAccountPayable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { dueDate?: string } }) =>
      updateAccountsPayable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsPayableKeys.lists() });
    },
  });
}

export function useCreatePayablePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { amount: number; method: string; notes?: string };
    }) => createPayablePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsPayableKeys.lists() });
    },
  });
}
