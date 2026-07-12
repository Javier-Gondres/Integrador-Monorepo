import type { AccountsReceivableQuery } from "./types/accounts-receivable";

export const accountsReceivableKeys = {
  all: ["accounts-receivable"] as const,
  customersList: () => [...accountsReceivableKeys.all, "customers"] as const,
  customers: (filters: AccountsReceivableQuery) =>
    [...accountsReceivableKeys.customersList(), filters] as const,
  customerReceivablesList: (customerId: string) =>
    [
      ...accountsReceivableKeys.all,
      "customer-receivables",
      customerId,
    ] as const,
  customerReceivables: (customerId: string, filters: AccountsReceivableQuery) =>
    [
      ...accountsReceivableKeys.customerReceivablesList(customerId),
      filters,
    ] as const,
  details: () => [...accountsReceivableKeys.all, "detail"] as const,
  detail: (id: string) => [...accountsReceivableKeys.details(), id] as const,
};
