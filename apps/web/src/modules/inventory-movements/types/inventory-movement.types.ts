export type MovementType =
  | "PURCHASE"
  | "SALE"
  | "RETURN"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "ADJUSTMENT"
  | "WASTE";

export type AdjustmentReason =
  | "DAMAGE"
  | "THEFT"
  | "EXPIRED"
  | "COUNT_DIFFERENCE"
  | "INTERNAL_USE"
  | "OTHER";

interface InventoryMovementProductDto {
  id: string;
  code: string;
  name: string;
}

interface InventoryMovementPerformerDto {
  id: string;
  user: { firstName: string; lastName: string };
}

/** Respuesta del backend tal como llega del API. */
export interface InventoryMovementDto {
  id: string;
  branchId: string;
  productId: string;
  type: MovementType;
  /** Decimal serializado por Prisma (puede llegar como string). */
  quantity: string | number;
  adjustmentReason: AdjustmentReason | null;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
  product: InventoryMovementProductDto;
  performedBy: InventoryMovementPerformerDto | null;
}

/** Modelo de UI del dominio inventory-movements (aplanado para la tabla). */
export interface InventoryMovement {
  id: string;
  productCode: string;
  productName: string;
  type: MovementType;
  quantity: number;
  adjustmentReason: AdjustmentReason | null;
  referenceNumber: string | null;
  notes: string | null;
  /** Nombre del empleado, o `null` si lo generó el sistema. */
  performedBy: string | null;
  createdAt: string;
}

export interface InventoryMovementFilters {
  page?: number;
  take?: number;
  search?: string;
  branchId?: string;
  type?: MovementType;
  dateFrom?: string;
  dateTo?: string;
}
