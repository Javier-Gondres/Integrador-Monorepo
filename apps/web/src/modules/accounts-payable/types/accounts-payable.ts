export type PayableStatus = "OPEN" | "PARTIAL" | "PAID" | "OVERDUE";

export interface PayableSupplier {
  id: string;
  name: string;
}

export interface PayablePurchase {
  id: string;
  invoiceNumber: string | null;
}

export interface AccountPayable {
  id: string;
  originalAmount: number;
  balance: number;
  dueDate: string;
  status: PayableStatus;
  createdAt: string;
  updatedAt: string;
  supplier: PayableSupplier;
  purchase: PayablePurchase;
}

export interface PayablePayment {
  id: string;
  amount: number;
  method: string;
  notes: string | null;
  createdAt: string;
}

export interface AccountPayableDetail extends AccountPayable {
  branch: { id: string; name: string };
  purchase: PayablePurchase & {
    invoiceDate: string | null;
    total: number;
    items: {
      id: string;
      quantity: number;
      unitCost: number;
      subtotal: number;
      product: {
        id: string;
        name: string;
        code: string;
      };
    }[];
  };
  payments: PayablePayment[];
}

export interface AccountsPayableResponse {
  items: AccountPayable[];
  meta: {
    page: number;
    take: number;
    total: number;
    totalPages: number;
  };
}

export interface AccountsPayableQuery {
  page?: number;
  take?: number;
  branchId?: string;
  supplierId?: string;
  status?: PayableStatus;
  dateFrom?: string;
  dateTo?: string;
}
