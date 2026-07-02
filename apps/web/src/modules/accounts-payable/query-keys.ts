export const accountsPayableKeys = {
  all: ['accounts-payable'] as const,
  lists: () => [...accountsPayableKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) =>
    [...accountsPayableKeys.lists(), filters] as const,
  details: () => [...accountsPayableKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountsPayableKeys.details(), id] as const,
};
