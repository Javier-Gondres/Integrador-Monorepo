import type { BaseListFilters } from "@/types/filters";

export interface DiscountProductRef {
  id: string;
  name: string;
  code: string;
}

export interface DiscountCategoryRef {
  id: string;
  name: string;
}

export interface DiscountDto {
  id: string;
  name: string;
  description: string | null;
  percentage: number;
  startDate: string | null;
  endDate: string | null;
  products: DiscountProductRef[];
  categories: DiscountCategoryRef[];
  excludedProducts: DiscountProductRef[];
  isActive: boolean;
}

export interface Discount {
  id: string;
  name: string;
  description: string | null;
  percentage: number;
  startDate: string | null;
  endDate: string | null;
  products: DiscountProductRef[];
  categories: DiscountCategoryRef[];
  excludedProducts: DiscountProductRef[];
  isActive: boolean;
}

export interface DiscountCalculation {
  precioOriginal: number;
  porcentajeDescuento: number;
  montoDescuento: number;
  precioFinal: number;
}

export interface DiscountFilters extends BaseListFilters {
  isCurrent?: boolean;
}

export interface DiscountFormValues {
  name: string;
  description: string;
  percentage: number;
  startDate: string;
  endDate: string;
  productIds: string[];
  categoryIds: string[];
  excludedProductIds: string[];
  isActive: boolean;
}

export interface DiscountFormValuesDto {
  name: string;
  description?: string;
  percentage: number;
  startDate?: string;
  endDate?: string;
  productIds?: string[];
  categoryIds?: string[];
  excludedProductIds?: string[];
  isActive?: boolean;
}
