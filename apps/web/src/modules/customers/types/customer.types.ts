import type { BaseListFilters } from "@/types/filters";

export interface CustomerDto {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  cedula: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  cedula: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CustomerFilters = BaseListFilters;

export interface CustomerFormValues {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  cedula?: string;
  isActive?: boolean;
}
