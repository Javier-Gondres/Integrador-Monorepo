/** Métodos de pago del API (NestJS). */
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "CREDIT";

/** Opción de método de pago en la UI (mockup de facturación). */
export type SalePaymentOption = "contado" | "tarjeta" | "credito";

export type SaleStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export interface SaleCategorySummary {
  id: string;
  name: string;
}

/** Producto disponible para facturar (con disponibilidad y descuento vigente). */
export interface SaleProductDto {
  id: string;
  code: string;
  name: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  available: number;
  categories: SaleCategorySummary[];
}

export interface SaleProductsResponse {
  items: SaleProductDto[];
}

/** Turno de caja abierto del cajero actual. */
export interface CurrentShiftDto {
  id: string;
  cashRegisterId: string;
  cashRegisterName: string;
  openingAmount: number;
  openedAt: string;
}

export interface CurrentShiftResponse {
  shift: CurrentShiftDto | null;
}

/** Nota de crédito activa disponible para redimir. */
export interface CreditNoteDto {
  id: string;
  ncf: string | null;
  ncfType: string | null;
  amount: number;
  createdAt: string;
}

export interface CreditNotesResponse {
  items: CreditNoteDto[];
}

export interface SaleItemDetailDto {
  id: string;
  productId: string;
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  subtotal: number;
}

export interface SalePaymentDetailDto {
  id: string;
  method: PaymentMethod;
  amount: number;
}

export interface SaleDetailDto {
  id: string;
  ncf: string | null;
  ncfType: string | null;
  status: SaleStatus;
  subtotal: number;
  taxAmount: number;
  total: number;
  createdAt: string;
  reservationId: string | null;
  company: {
    name: string;
    rnc: string | null;
    address: string | null;
    phone: string | null;
  };
  branch: { id: string; name: string; address: string | null };
  customerName: string | null;
  customer: {
    name: string;
    rnc: string | null;
    cedula: string | null;
    address: string | null;
    phone: string | null;
  } | null;
  cashierName: string | null;
  items: SaleItemDetailDto[];
  payments: SalePaymentDetailDto[];
  creditNotesApplied: { id: string; ncf: string | null; amount: number }[];
  accountReceivable: {
    id: string;
    balance: number;
    dueDate: string;
    status: string;
  } | null;
}

export interface SaleListItemDto {
  id: string;
  ncf: string | null;
  ncfType: string | null;
  status: SaleStatus;
  subtotal: number;
  taxAmount: number;
  total: number;
  createdAt: string;
  branchName: string;
  customerName: string | null;
  itemsCount: number;
}

export interface SaleFilters {
  page?: number;
  take?: number;
  search?: string;
  branchId?: string;
  status?: SaleStatus;
}

/** Payload para registrar una venta. */
export interface CreateSalePayload {
  branchId: string;
  customerId?: string;
  reservationId?: string;
  items: { productId: string; quantity: number }[];
  payments?: { method: PaymentMethod; amount: number }[];
  creditNoteIds?: string[];
  /**
   * Fecha en que ocurrió la venta (instante ISO), para registrar ventas
   * pasadas. Solo la usan OWNER/ADMIN; si se omite, el backend usa la fecha
   * actual.
   */
  soldAt?: string;
}
