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
  price: number;
  isActive: boolean;
}

export type InventoryFilters = Pick<
  BaseListFilters,
  "page" | "take" | "search"
> & {
  branchId?: string;
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
}

/** Payload para actualizar inventario (solo cantidad). */
export interface UpdateInventoryValues {
  quantity: number;
}
