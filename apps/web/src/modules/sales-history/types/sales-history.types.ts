import type { SaleStatus } from "@/modules/sales/types/sale.types";

/** Fila de la tabla de historial tal como llega de GET /sales. */
export interface SaleListDto {
  id: string;
  ncf: string | null;
  ncfType: string | null;
  status: SaleStatus;
  subtotal: number;
  taxAmount: number;
  total: number;
  /** Suma de las notas de crédito redimidas en la venta. */
  creditApplied: number;
  /** `total` menos las notas de crédito aplicadas (mínimo 0). */
  amountPayable: number;
  createdAt: string;
  branchName: string;
  customerName: string | null;
  cashierName: string | null;
  cashRegisterName: string | null;
  itemsCount: number;
}

export interface SaleHistoryFilters {
  page?: number;
  take?: number;
  search?: string;
  branchId?: string;
  customerId?: string;
  cashierId?: string;
  cashRegisterId?: string;
  status?: SaleStatus;
  dateFrom?: string;
  dateTo?: string;
}
