import type { BaseListFilters } from "@/types/filters";

export interface SupplierDto {
  id: string;
  companyId: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  rnc: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  productsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  rnc: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  productsCount: number;
}

export type SupplierFilters = BaseListFilters;

export interface SupplierFormValues {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  rnc?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}
