import type { BaseListFilters } from "@/types/filters";

export type ReturnReason = "DEFECTIVE" | "SALES_ERROR" | "EXPIRED" | "OTHER";

export interface ReturnBranchDto {
  id: string;
  name: string;
}

/** Fila del listado tal como llega del API. */
export interface ReturnListItemDto {
  id: string;
  reason: ReturnReason;
  createdAt: string;
  subtotal: number;
  total: number;
  branch: ReturnBranchDto;
  ncf: string | null;
  saleNcf: string | null;
  customerName: string | null;
  itemsCount: number;
}

/** Modelo de UI para la tabla de devoluciones. */
export interface ReturnListItem {
  id: string;
  reason: ReturnReason;
  reasonLabel: string;
  createdAt: string;
  total: number;
  branchName: string;
  ncf: string | null;
  saleNcf: string | null;
  customerName: string | null;
  itemsCount: number;
}

export interface ReturnDetailItemDto {
  id: string;
  productId: string;
  code: string;
  name: string;
  quantity: number;
  subtotal: number;
}

export interface ReturnCreditNoteDto {
  id: string;
  ncf: string | null;
  ncfType: string | null;
  amount: number;
}

export interface ReturnDetailDto {
  id: string;
  reason: ReturnReason;
  notes: string | null;
  createdAt: string;
  subtotal: number;
  total: number;
  branch: ReturnBranchDto;
  ncf: string | null;
  saleNcf: string | null;
  customerName: string | null;
  creditNote: ReturnCreditNoteDto | null;
  items: ReturnDetailItemDto[];
}

export interface ReturnDetail {
  id: string;
  reason: ReturnReason;
  reasonLabel: string;
  notes: string | null;
  createdAt: string;
  subtotal: number;
  total: number;
  branchName: string;
  ncf: string | null;
  saleNcf: string | null;
  customerName: string | null;
  creditNote: ReturnCreditNoteDto | null;
  items: ReturnDetailItemDto[];
}

/** Producto vendido disponible para devolución (lookup por NCF). */
export interface SaleLookupItem {
  productId: string;
  code: string;
  name: string;
  unitPrice: number;
  quantitySold: number;
  quantityAlreadyReturned: number;
  quantityReturnable: number;
}

export interface SaleLookup {
  saleId: string;
  ncf: string | null;
  ncfType: string | null;
  createdAt: string;
  total: number;
  branch: ReturnBranchDto;
  customerName: string | null;
  items: SaleLookupItem[];
}

export type ReturnFilters = BaseListFilters & {
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export interface CreateReturnPayload {
  saleId: string;
  reason: ReturnReason;
  notes?: string;
  items: { productId: string; quantity: number }[];
}
