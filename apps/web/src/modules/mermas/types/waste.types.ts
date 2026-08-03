export type InventoryAdjustmentReason =
  | "DAMAGE"
  | "THEFT"
  | "EXPIRED"
  | "COUNT_DIFFERENCE"
  | "INTERNAL_USE"
  | "OTHER";

export interface WasteListItem {
  id: string;
  branchId: string;
  productId: string;
  type: string;
  quantity: string | number;
  adjustmentReason: InventoryAdjustmentReason;
  notes: string | null;
  referenceNumber: string | null;
  performedByEmployeeId: string | null;
  createdAt: string;
  product: {
    name: string;
    code: string;
  };
  performedBy: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  } | null;
}

export interface PaginatedWasteResult {
  items: WasteListItem[];
  meta: {
    page: number;
    take: number;
    total: number;
    totalPages: number;
  };
}

export interface WasteFilters {
  page: number;
  take: number;
  search?: string;
  branchId?: string;
}

export interface CreateWastePayload {
  branchId: string;
  productId: string;
  quantity: number;
  adjustmentReason: InventoryAdjustmentReason;
  notes?: string;
  referenceNumber?: string;
}
