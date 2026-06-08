import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { prisma } from '@repo/db';

import type { PaginatedResult } from '../common/types/repository.types';
import type { NormalizedQueryDiscounts } from './dto/query-discounts.dto';
import { discountSelect, type DiscountRecord } from './discounts.selects';

export type { DiscountRecord } from './discounts.selects';
export type PaginatedDiscountsResult = PaginatedResult<DiscountRecord>;

export type CreateDiscountData = {
  name: string;
  description: string | null;
  percentage: number;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  productIds?: string[];
  categoryIds?: string[];
  excludedProductIds?: string[];
};

@Injectable()
export class DiscountsRepository {
  async findPaginatedByCompany(
    companyId: string,
    query: NormalizedQueryDiscounts,
  ): Promise<PaginatedDiscountsResult> {
    const where = this.buildListWhere(companyId, query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.discount.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { name: 'asc' },
        select: discountSelect,
      }),
      prisma.discount.count({ where }),
    ]);

    return { items, total };
  }

  findCurrentByCompany(companyId: string): Promise<DiscountRecord[]> {
    const now = new Date();

    return prisma.discount.findMany({
      where: {
        companyId,
        isActive: true,
        AND: this.buildCurrentConditions(now),
      },
      orderBy: { name: 'asc' },
      select: discountSelect,
    });
  }

  findApplicableByProduct(
    companyId: string,
    productId: string,
    categoryIds: string[],
  ): Promise<DiscountRecord[]> {
    const now = new Date();
    const orConditions: Prisma.DiscountWhereInput[] = [
      { products: { some: { id: productId } } },
    ];

    if (categoryIds.length > 0) {
      orConditions.push({
        categories: {
          some: { id: { in: categoryIds } },
        },
        excludedProducts: {
          none: { productId },
        },
      });
    }

    return prisma.discount.findMany({
      where: {
        companyId,
        isActive: true,
        AND: this.buildCurrentConditions(now),
        OR: orConditions,
      },
      orderBy: { percentage: 'desc' },
      select: discountSelect,
    });
  }

  findByIdInCompany(
    id: string,
    companyId: string,
  ): Promise<DiscountRecord | null> {
    return prisma.discount.findFirst({
      where: { id, companyId },
      select: discountSelect,
    });
  }

  create(
    companyId: string,
    data: CreateDiscountData,
  ): Promise<DiscountRecord> {
    return prisma.discount.create({
      data: {
        companyId,
        name: data.name,
        description: data.description,
        percentage: data.percentage,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
        ...(data.productIds?.length && {
          products: {
            connect: data.productIds.map((id) => ({ id })),
          },
        }),
        ...(data.categoryIds?.length && {
          categories: {
            connect: data.categoryIds.map((id) => ({ id })),
          },
        }),
        ...(data.excludedProductIds?.length && {
          excludedProducts: {
            create: data.excludedProductIds.map((productId) => ({ productId })),
          },
        }),
      },
      select: discountSelect,
    });
  }

  update(id: string, data: Prisma.DiscountUpdateInput): Promise<DiscountRecord> {
    return prisma.discount.update({
      where: { id },
      data,
      select: discountSelect,
    });
  }

  activate(id: string) {
    return prisma.discount.activate({ where: { id } });
  }

  deactivate(id: string) {
    return prisma.discount.deactivate({ where: { id } });
  }

  softDelete(id: string) {
    return prisma.discount.softDelete({ where: { id } });
  }

  private buildListWhere(
    companyId: string,
    query: NormalizedQueryDiscounts,
  ): Prisma.DiscountWhereInput {
    const now = new Date();
    const where: Prisma.DiscountWhereInput = {
      companyId,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    if (query.isCurrent) {
      where.AND = this.buildCurrentConditions(now);
    }

    return where;
  }

  private buildCurrentConditions(now: Date): Prisma.DiscountWhereInput[] {
    return [
      {
        OR: [{ startDate: null }, { startDate: { lte: now } }],
      },
      {
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
    ];
  }
}