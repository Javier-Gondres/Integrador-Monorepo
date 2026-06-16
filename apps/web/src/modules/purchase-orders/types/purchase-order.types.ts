/** Item enviado al backend al registrar una compra. */
export interface CreatePurchaseItemInput {
  productId: string;
  quantity: number;
  unitCost: number;
}

/** Cuerpo de POST /purchases. */
export interface CreatePurchaseValues {
  branchId: string;
  supplierId: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  items: CreatePurchaseItemInput[];
}

/** Producto resumido dentro de una línea de compra. */
export interface PurchaseItemProductDto {
  id: string;
  code: string;
  name: string;
}

/** Línea de compra tal como llega del API (Decimales ya convertidos a number). */
export interface PurchaseDetailItemDto {
  id: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  product: PurchaseItemProductDto;
}

export interface PurchaseSupplierDto {
  id: string;
  name: string;
  contactName: string | null;
}

export interface PurchaseBranchDto {
  id: string;
  name: string;
}

/** Respuesta de POST /purchases y GET /purchases/:id. */
export interface PurchaseDetailDto {
  id: string;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  createdAt: string;
  supplier: PurchaseSupplierDto;
  branch: PurchaseBranchDto;
  items: PurchaseDetailItemDto[];
}
