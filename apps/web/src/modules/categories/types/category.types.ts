import type { BaseListFilters } from "@/types/filters";

/** Respuesta del backend tal como llega del API. */
export interface CategoryDto {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

/** Modelo de UI del dominio categories. */
export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export type CategoryFilters = BaseListFilters;

export interface CategoryFormValues {
  name: string;
  description?: string;
  isActive?: boolean;
}
