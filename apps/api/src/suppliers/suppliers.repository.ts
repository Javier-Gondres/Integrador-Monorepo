import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { prisma, runWithDeleted } from '@repo/db';

import type { PaginatedResult } from '../common/types/repository.types';
import type { NormalizedQuerySuppliers } from './dto/query-suppliers.dto';
import { type SupplierRecord, supplierSelect } from './suppliers.selects';

export type { SupplierRecord } from './suppliers.selects';
export type PaginatedSuppliersResult = PaginatedResult<SupplierRecord>;

export type CreateSupplierData = {
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  rnc: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
};

@Injectable()
export class SuppliersRepository {
  async findPaginatedByCompany(
    companyId: string,
    query: NormalizedQuerySuppliers,
  ): Promise<PaginatedSuppliersResult> {
    const where = this.buildListWhere(companyId, query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.supplier.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { name: 'asc' },
        select: supplierSelect,
      }),
      prisma.supplier.count({ where }),
    ]);

    return { items, total };
  }

  findByIdInCompany(
    id: string,
    companyId: string,
  ): Promise<SupplierRecord | null> {
    return prisma.supplier.findFirst({
      where: { id, companyId },
      select: supplierSelect,
    });
  }

  create(companyId: string, data: CreateSupplierData): Promise<SupplierRecord> {
    return prisma.supplier.create({
      data: {
        companyId,
        name: data.name,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        rnc: data.rnc,
        address: data.address,
        notes: data.notes,
        isActive: data.isActive,
      },
      select: supplierSelect,
    });
  }

  update(
    id: string,
    data: Prisma.SupplierUpdateInput,
  ): Promise<SupplierRecord> {
    return prisma.supplier.update({
      where: { id },
      data,
      select: supplierSelect,
    });
  }

  softDelete(id: string) {
    return prisma.supplier.softDelete({ where: { id } });
  }

  async restore(id: string, companyId: string): Promise<SupplierRecord | null> {
    return runWithDeleted(async () => {
      const existing = await prisma.supplier.findFirst({
        where: {
          id,
          companyId,
          deletedAt: { not: null },
        },
        select: { id: true },
      });
      if (!existing) {
        return null;
      }

      await prisma.supplier.restore({ where: { id } });
      return this.findByIdInCompany(id, companyId);
    });
  }

  private buildListWhere(
    companyId: string,
    query: NormalizedQuerySuppliers,
  ): Prisma.SupplierWhereInput {
    return {
      companyId,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { contactName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { rnc: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };
  }
}
