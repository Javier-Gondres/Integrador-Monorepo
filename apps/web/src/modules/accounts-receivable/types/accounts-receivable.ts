export type ReceivableStatus = "OPEN" | "PARTIAL" | "PAID" | "OVERDUE";

export interface ReceivableCustomerSummary {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  totalOriginalAmount: number;
  totalBalance: number;
  receivablesCount: number;
}

export interface ReceivableCustomerResponse {
  items: ReceivableCustomerSummary[];
  meta: {
    page: number;
    take: number;
    total: number;
    totalPages: number;
  };
}

export interface AccountReceivable {
  id: string;
  originalAmount: number;
  balance: number;
  dueDate: string;
  status: ReceivableStatus;
  createdAt: string;
  sale: {
    id: string;
    ncf: string;
    createdAt: string;
    total: number;
    branchName: string;
  };
}

export interface AccountsReceivableResponse {
  items: AccountReceivable[];
  meta: {
    page: number;
    take: number;
    total: number;
    totalPages: number;
  };
}

export interface ReceivablePayment {
  id: string;
  amount: number;
  method: string;
  notes: string | null;
  createdAt: string;
}

export interface AccountReceivableDetail extends AccountReceivable {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  payments: ReceivablePayment[];
}

export interface AccountsReceivableQuery {
  page?: number;
  take?: number;
  search?: string;
  branchId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}
