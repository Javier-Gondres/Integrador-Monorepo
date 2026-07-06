import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { prisma } from '@repo/db';

import type { PaginatedResult } from '../common/types/repository.types';
import type { NormalizedQuerySupplierProducts } from './dto/query-supplier-products.dto';
import {
  type ProductSupplierRecord,
  productSupplierSelect,
} from './product-supplier.selects';

export type { ProductSupplierRecord } from './product-supplier.selects';
export type PaginatedProductSuppliersResult =
  PaginatedResult<ProductSupplierRecord>;

export type CreateProductSupplierData = {
  productId: string;
  supplierId: string;
  lastCost: number | null;
  isActive: boolean;
};

@Injectable()
export class ProductSupplierRepository {
  async findPaginatedBySupplier(
    supplierId: string,
    query: NormalizedQuerySupplierProducts,
  ): Promise<PaginatedProductSuppliersResult> {
    const where = this.buildListWhere(supplierId, query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.productSupplier.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
        select: productSupplierSelect,
      }),
      prisma.productSupplier.count({ where }),
    ]);

    return { items, total };
  }

  findOne(
    supplierId: string,
    productId: string,
  ): Promise<ProductSupplierRecord | null> {
    return prisma.productSupplier.findUnique({
      where: { productId_supplierId: { productId, supplierId } },
      select: productSupplierSelect,
    });
  }

  create(data: CreateProductSupplierData): Promise<ProductSupplierRecord> {
    return prisma.productSupplier.create({
      data: {
        product: { connect: { id: data.productId } },
        supplier: { connect: { id: data.supplierId } },
        lastCost: data.lastCost,
        isActive: data.isActive,
      },
      select: productSupplierSelect,
    });
  }

  update(
    supplierId: string,
    productId: string,
    data: Prisma.ProductSupplierUpdateInput,
  ): Promise<ProductSupplierRecord> {
    return prisma.productSupplier.update({
      where: { productId_supplierId: { productId, supplierId } },
      data,
      select: productSupplierSelect,
    });
  }

  setActive(
    supplierId: string,
    productId: string,
    isActive: boolean,
  ): Promise<ProductSupplierRecord> {
    return this.update(supplierId, productId, { isActive });
  }

  /**
   * Marks this link as the preferred supplier for the product, clearing any
   * other preferred link for the same product in one transaction (honors the
   * partial unique index `product_supplier_preferred_idx`).
   */
  async setPreferred(
    supplierId: string,
    productId: string,
  ): Promise<ProductSupplierRecord> {
    const [, record] = await prisma.$transaction([
      prisma.productSupplier.updateMany({
        where: { productId, isPreferred: true, NOT: { supplierId } },
        data: { isPreferred: false },
      }),
      prisma.productSupplier.update({
        where: { productId_supplierId: { productId, supplierId } },
        data: { isPreferred: true },
        select: productSupplierSelect,
      }),
    ]);

    return record;
  }

  remove(supplierId: string, productId: string) {
    return prisma.productSupplier.delete({
      where: { productId_supplierId: { productId, supplierId } },
    });
  }

  private buildListWhere(
    supplierId: string,
    query: NormalizedQuerySupplierProducts,
  ): Prisma.ProductSupplierWhereInput {
    return {
      supplierId,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        product: {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { code: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      }),
    };
  }
}
