import type { BaseListFilters } from "@/types/filters";

export interface ProductCategoryRef {
  id: string;
  name: string;
}

/** Respuesta del backend tal como llega del API. */
export interface ProductDto {
  id: string;
  name: string;
  code: string;
  description: string | null;
  price: number;
  categories: ProductCategoryRef[];
  categoryIds: string[];
  isActive: boolean;
}

/** Modelo de UI — categorías enriquecidas para presentación. */
export interface Product {
  id: string;
  name: string;
  code: string;
  description: string | null;
  price: number;
  categories: ProductCategoryRef[];
  isActive: boolean;
}

export interface ProductFilters extends BaseListFilters {
  categoryId?: string;
}

export interface ProductFormValues {
  name: string;
  code: string;
  description?: string;
  price: number;
  categoryIds?: string[];
  isActive?: boolean;
}
