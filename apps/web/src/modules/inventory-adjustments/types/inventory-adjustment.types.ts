export type AdjustmentReason = "COUNT_DIFFERENCE" | "OTHER";

interface AdjustmentProductDto {
  id: string;
  code: string;
  name: string;
}

/** Respuesta del backend (fila de InventoryMovement tipo ADJUSTMENT). */
export interface AdjustmentDto {
  id: string;
  branchId: string;
  productId: string;
  /** Decimal serializado por Prisma (puede llegar como string). */
  quantity: string | number;
  adjustmentReason: AdjustmentReason;
  notes: string | null;
  createdAt: string;
  product: AdjustmentProductDto;
}

/** Modelo de UI del dominio inventory-adjustments (aplanado para la tabla). */
export interface Adjustment {
  id: string;
  productName: string;
  /** Cantidad firmada: positiva = incremento, negativa = decremento. */
  quantity: number;
  adjustmentReason: AdjustmentReason;
  notes: string | null;
  createdAt: string;
}

export interface AdjustmentFilters {
  page?: number;
  take?: number;
  search?: string;
  branchId?: string;
  adjustmentReason?: AdjustmentReason;
}

/** Payload para registrar un ajuste de inventario. */
export interface CreateAdjustmentValues {
  branchId: string;
  productId: string;
  quantity: number;
  adjustmentReason: AdjustmentReason;
  notes?: string;
}
