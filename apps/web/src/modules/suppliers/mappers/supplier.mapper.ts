import type { PaginatedResponse } from "@/types/pagination";

import type { Supplier, SupplierDto } from "../types/supplier.types";

export function mapSupplierDtoToUi(dto: SupplierDto): Supplier {
  return {
    id: dto.id,
    companyId: dto.companyId,
    name: dto.name,
    contactName: dto.contactName,
    email: dto.email,
    phone: dto.phone,
    rnc: dto.rnc,
    address: dto.address,
    notes: dto.notes,
    isActive: dto.isActive,
  };
}

export function mapSuppliersPageToUi(
  response: PaginatedResponse<SupplierDto>,
): PaginatedResponse<Supplier> {
  return {
    items: response.items.map(mapSupplierDtoToUi),
    meta: response.meta,
  };
}
