import type { PaginatedResponse } from "@/types/pagination";

import type { Customer, CustomerDto } from "../types/customer.types";

export function mapCustomerDtoToUi(dto: CustomerDto): Customer {
  return {
    id: dto.id,
    companyId: dto.companyId,
    firstName: dto.firstName,
    lastName: dto.lastName,
    fullName: `${dto.firstName} ${dto.lastName}`,
    email: dto.email,
    phone: dto.phone,
    address: dto.address,
    cedula: dto.cedula,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapCustomersPageToUi(
  response: PaginatedResponse<CustomerDto>,
): PaginatedResponse<Customer> {
  return {
    items: response.items.map(mapCustomerDtoToUi),
    meta: response.meta,
  };
}

export function mapCustomerDtoListToUi(dtos: CustomerDto[]): Customer[] {
  return dtos.map(mapCustomerDtoToUi);
}
