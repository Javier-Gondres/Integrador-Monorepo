import type { BaseListFilters } from "@/types/filters";

/** Resumen del producto incrustado en cada vínculo producto↔proveedor. */
export interface SupplierProductProductDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
}

/** Vínculo producto↔proveedor tal como llega del API. */
export interface SupplierProductDto {
  productId: string;
  supplierId: string;
  isActive: boolean;
  isPreferred: boolean;
  lastCost: number | null;
  createdAt: string;
  updatedAt: string;
  product: SupplierProductProductDto;
}

/** Modelo de UI aplanado para la tabla del catálogo. */
export interface SupplierProduct {
  productId: string;
  supplierId: string;
  /** Estado del vínculo (activable/desactivable), no del producto. */
  isActive: boolean;
  isPreferred: boolean;
  lastCost: number | null;
  code: string;
  name: string;
  description: string | null;
  price: number;
  productIsActive: boolean;
}

export type SupplierProductFilters = BaseListFilters;

/** Opción de producto para el combobox de "Asignar producto". */
export interface ProductOption {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
}
