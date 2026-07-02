import type { BaseListFilters } from "@/types/filters";

/** Producto anidado tal como llega del API dentro del inventario. */
export interface InventoryProductDto {
  id: string;
  code: string;
  name: string;
  /** Decimal serializado por Prisma (puede llegar como string). */
  price: string | number;
  isActive: boolean;
}

/** Respuesta del backend tal como llega del API. */
export interface InventoryDto {
  id: string;
  branchId: string;
  productId: string;
  /** Decimal serializado por Prisma (puede llegar como string). */
  quantity: string | number;
  /** Unidades bloqueadas por reservas `ACTIVE`. */
  reserved: number;
  /** `quantity - reserved`: existencia realmente vendible. */
  available: number;
  /** Decimal serializado por Prisma (puede llegar como string). */
  minimumQuantity: string | number;
  /** Estado propio de la fila de inventario (no del producto). */
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product: InventoryProductDto;
}

/** Modelo de UI del dominio inventories (aplanado para la tabla). */
export interface Inventory {
  id: string;
  branchId: string;
  productId: string;
  code: string;
  name: string;
  quantity: number;
  /** Unidades bloqueadas por reservas `ACTIVE`. */
  reserved: number;
  /** `quantity - reserved`: existencia realmente vendible. */
  available: number;
  minimumQuantity: number;
  price: number;
  /** Estado de la fila de inventario (toggleable). */
  isActive: boolean;
  /** Estado del producto referenciado (solo informativo en el modal). */
  productIsActive: boolean;
}

export type InventoryFilters = Pick<
  BaseListFilters,
  "page" | "take" | "search"
> & {
  branchId?: string;
  isActive?: boolean;
  needsRestock?: boolean;
};

/** Opción de producto para el selector del modal de asignación. */
export interface InventoryProductOption {
  id: string;
  code: string;
  name: string;
  price: number;
  isActive: boolean;
}

/** Payload para asignar (crear) un producto al inventario. */
export interface CreateInventoryValues {
  branchId: string;
  productId: string;
  quantity?: number;
  minimumQuantity?: number;
}

/**
 * Payload para actualizar inventario. La cantidad se mueve vía
 * InventoryMovement; aquí solo se edita la cantidad mínima de reposición.
 */
export interface UpdateInventoryValues {
  minimumQuantity: number;
}
