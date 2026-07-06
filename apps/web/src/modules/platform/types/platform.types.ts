import type { BaseListFilters } from "@/types/filters";

export interface PlatformOwnerDto {
  email: string;
  firstName: string;
  lastName: string;
}

export interface PlatformCompanyDto {
  id: string;
  name: string;
  slug: string;
  rnc: string | null;
  isActive: boolean;
  createdAt: string;
  owner: PlatformOwnerDto | null;
}

export interface PlatformCompany {
  id: string;
  name: string;
  slug: string;
  rnc: string | null;
  isActive: boolean;
  createdAt: string;
  ownerEmail: string | null;
  ownerName: string | null;
}

export interface PlatformOverview {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
}

export type PlatformCompanyFilters = BaseListFilters;

export interface CreatePlatformCompanyPayload {
  name: string;
  rnc?: string;
  owner: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
}

export interface PlatformCompaniesApiPage {
  items: PlatformCompanyDto[];
  meta: {
    page: number;
    take: number;
    total: number;
    totalPages: number;
  };
}
