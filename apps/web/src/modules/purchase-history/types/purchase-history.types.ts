/** Fila de la tabla de historial tal como llega de GET /purchases. */
export interface PurchaseListDto {
  id: string;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  createdAt: string;
  supplier: { id: string; name: string; contactName: string | null };
  branch: { id: string; name: string };
  itemsCount: number;
  totalUnits: number;
}

export interface PurchaseFilters {
  page?: number;
  take?: number;
  branchId?: string;
  supplierId?: string;
  dateFrom?: string;
  dateTo?: string;
}
