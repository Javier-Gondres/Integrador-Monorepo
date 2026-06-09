import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { prisma } from '@repo/db';

import type { PaginatedResult } from '../common/types/repository.types';
import type { CustomerRecord } from './customers.selects';
import { customerSelect } from './customers.selects';
import type { NormalizedQueryCustomers } from './dto/query-customers.dto';

export type { CustomerRecord } from './customers.selects';
export type PaginatedCustomersResult = PaginatedResult<CustomerRecord>;

export type CreateCustomerData = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  cedula: string | null;
  isActive: boolean;
};

@Injectable()
export class CustomersRepository {
  async findPaginatedByCompany(
    companyId: string,
    query: NormalizedQueryCustomers,
  ): Promise<PaginatedCustomersResult> {
    const where = this.buildListWhere(companyId, query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { lastName: 'asc' },
        select: customerSelect,
      }),
      prisma.customer.count({ where }),
    ]);

    return { items, total };
  }

  findByIdInCompany(
    id: string,
    companyId: string,
  ): Promise<CustomerRecord | null> {
    return prisma.customer.findFirst({
      where: { id, companyId },
      select: customerSelect,
    });
  }

  create(companyId: string, data: CreateCustomerData): Promise<CustomerRecord> {
    return prisma.customer.create({
      data: {
        companyId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        cedula: data.cedula,
        isActive: data.isActive,
      },
      select: customerSelect,
    });
  }

  update(
    id: string,
    data: Prisma.CustomerUpdateInput,
  ): Promise<CustomerRecord> {
    return prisma.customer.update({
      where: { id },
      data,
      select: customerSelect,
    });
  }

  activate(id: string) {
    return prisma.customer.activate({ where: { id } });
  }

  deactivate(id: string) {
    return prisma.customer.deactivate({ where: { id } });
  }

  softDelete(id: string) {
    return prisma.customer.softDelete({ where: { id } });
  }

  private buildListWhere(
    companyId: string,
    query: NormalizedQueryCustomers,
  ): Prisma.CustomerWhereInput {
    return {
      companyId,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { cedula: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };
  }
}
