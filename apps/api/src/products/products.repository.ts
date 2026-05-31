import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { prisma } from '@repo/db';

import type { NormalizedQueryProducts } from './dto/query-products.dto';

const categorySummarySelect = {
  id: true,
  name: true,
} as const;

export const productSelect = {
  id: true,
  companyId: true,
  name: true,
  code: true,
  description: true,
  imageUrl: true,
  price: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  categories: {
    select: categorySummarySelect,
  },
} as const;

export type ProductRecord = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;

export type PaginatedProductsResult = {
  items: ProductRecord[];
  total: number;
};

export type CreateProductData = {
  name: string;
  code: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  isActive: boolean;
  categoryIds?: string[];
};

@Injectable()
export class ProductsRepository {
  async findPaginatedByCompany(
    companyId: string,
    query: NormalizedQueryProducts,
  ): Promise<PaginatedProductsResult> {
    const where = this.buildListWhere(companyId, query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { name: 'asc' },
        select: productSelect,
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  findByIdInCompany(
    id: string,
    companyId: string,
  ): Promise<ProductRecord | null> {
    return prisma.product.findFirst({
      where: { id, companyId },
      select: productSelect,
    });
  }

  create(companyId: string, data: CreateProductData): Promise<ProductRecord> {
    return prisma.product.create({
      data: {
        companyId,
        name: data.name,
        code: data.code,
        description: data.description,
        imageUrl: data.imageUrl,
        price: data.price,
        isActive: data.isActive,
        ...(data.categoryIds?.length && {
          categories: {
            connect: data.categoryIds.map((id) => ({ id })),
          },
        }),
      },
      select: productSelect,
    });
  }

  update(id: string, data: Prisma.ProductUpdateInput): Promise<ProductRecord> {
    return prisma.product.update({
      where: { id },
      data,
      select: productSelect,
    });
  }

  activate(id: string) {
    return prisma.product.activate({ where: { id } });
  }

  deactivate(id: string) {
    return prisma.product.deactivate({ where: { id } });
  }

  softDelete(id: string) {
    return prisma.product.softDelete({ where: { id } });
  }

  countCategoriesInCompany(categoryIds: string[], companyId: string) {
    return prisma.category.count({
      where: {
        id: { in: categoryIds },
        companyId,
      },
    });
  }

  private buildListWhere(
    companyId: string,
    query: NormalizedQueryProducts,
  ): Prisma.ProductWhereInput {
    return {
      companyId,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.categoryId && {
        categories: { some: { id: query.categoryId, companyId } },
      }),
      ...(query.q && {
        OR: [
          { name: { contains: query.q, mode: 'insensitive' } },
          { code: { contains: query.q, mode: 'insensitive' } },
          { description: { contains: query.q, mode: 'insensitive' } },
        ],
      }),
    };
  }
}
