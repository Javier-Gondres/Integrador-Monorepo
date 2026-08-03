import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { prisma } from '@repo/db';

import type { PaginatedResult } from '../common/types/repository.types';
import { type CategoryRecord, categorySelect } from './categories.selects';
import type { NormalizedQueryCategories } from './dto/query-categories.dto';

export type { CategoryRecord } from './categories.selects';
export type PaginatedCategoriesResult = PaginatedResult<CategoryRecord>;

export type CreateCategoryData = {
  name: string;
  description: string | null;
  isActive: boolean;
};

@Injectable()
export class CategoriesRepository {
  async findPaginatedByCompany(
    companyId: string,
    query: NormalizedQueryCategories,
  ): Promise<PaginatedCategoriesResult> {
    const where = this.buildListWhere(companyId, query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.category.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { name: 'asc' },
        select: categorySelect,
      }),
      prisma.category.count({ where }),
    ]);

    return { items, total };
  }

  findAllActiveByCompany(companyId: string): Promise<CategoryRecord[]> {
    return prisma.category.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
      select: categorySelect,
    });
  }

  findByIdInCompany(
    id: string,
    companyId: string,
  ): Promise<CategoryRecord | null> {
    return prisma.category.findFirst({
      where: { id, companyId },
      select: categorySelect,
    });
  }

  create(companyId: string, data: CreateCategoryData): Promise<CategoryRecord> {
    return prisma.category.create({
      data: {
        companyId,
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      },
      select: categorySelect,
    });
  }

  update(
    id: string,
    data: Prisma.CategoryUpdateInput,
  ): Promise<CategoryRecord> {
    return prisma.category.update({
      where: { id },
      data,
      select: categorySelect,
    });
  }

  activate(id: string) {
    return prisma.category.activate({ where: { id } });
  }

  deactivate(id: string) {
    return prisma.category.deactivate({ where: { id } });
  }

  softDelete(id: string) {
    return prisma.category.softDelete({ where: { id } });
  }

  countByIdsInCompany(categoryIds: string[], companyId: string) {
    return prisma.category.count({
      where: {
        id: { in: categoryIds },
        companyId,
      },
    });
  }

  private buildListWhere(
    companyId: string,
    query: NormalizedQueryCategories,
  ): Prisma.CategoryWhereInput {
    return {
      companyId,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };
  }
}
