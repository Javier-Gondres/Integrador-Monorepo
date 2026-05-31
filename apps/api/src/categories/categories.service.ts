import { Injectable } from '@nestjs/common';
import { Prisma, prisma } from '@repo/db';

import { BusinessException, ErrorCodes } from '../common/errors';
import { getDefinedData } from '../common/helpers/object.utils';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  NormalizedQueryCategories,
  QueryCategoriesDto,
} from './dto/query-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

const categorySelect = {
  id: true,
  companyId: true,
  name: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class CategoriesService {
  async findPaginatedByCompany(companyId: string, query: QueryCategoriesDto) {
    const normalized = this.normalizeQuery(query);
    const skip = (normalized.page - 1) * normalized.take;

    const where: Prisma.CategoryWhereInput = {
      companyId,
      ...(normalized.isActive !== undefined && {
        isActive: normalized.isActive,
      }),
      ...(normalized.q && {
        OR: [
          { name: { contains: normalized.q, mode: 'insensitive' } },
          { description: { contains: normalized.q, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.category.findMany({
        where,
        skip,
        take: normalized.take,
        orderBy: { name: 'asc' },
        select: categorySelect,
      }),
      prisma.category.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  findAllByCompany(companyId: string) {
    return prisma.category.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
      select: categorySelect,
    });
  }

  async findByIdInCompany(id: string, companyId: string) {
    const category = await prisma.category.findFirst({
      where: { id, companyId },
      select: categorySelect,
    });

    if (!category) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La categoría no existe',
      );
    }

    return category;
  }

  async create(companyId: string, dto: CreateCategoryDto) {
    try {
      return await prisma.category.create({
        data: {
          companyId,
          name: dto.name.trim(),
          description: dto.description?.trim() || null,
          isActive: dto.isActive ?? true,
        },
        select: categorySelect,
      });
    } catch (e: unknown) {
      if (isPrismaUniqueError(e)) {
        throw BusinessException.conflict(
          ErrorCodes.DUPLICATE_RECORD,
          'Ya existe una categoría con ese nombre en esta empresa',
        );
      }
      throw e;
    }
  }

  async update(id: string, companyId: string, dto: UpdateCategoryDto) {
    await this.findByIdInCompany(id, companyId);

    const data = getDefinedData(dto);
    if (data.name !== undefined) {
      data.name = data.name.trim();
    }

    const updateData: Prisma.CategoryUpdateInput = { ...data };
    if (dto.description !== undefined) {
      updateData.description = dto.description?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Debe enviar al menos un campo para actualizar',
      );
    }

    try {
      return await prisma.category.update({
        where: { id },
        data: updateData,
        select: categorySelect,
      });
    } catch (e: unknown) {
      if (isPrismaUniqueError(e)) {
        throw BusinessException.conflict(
          ErrorCodes.DUPLICATE_RECORD,
          'Ya existe una categoría con ese nombre en esta empresa',
        );
      }
      throw e;
    }
  }

  async activate(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await prisma.category.activate({ where: { id } });
    return this.findByIdInCompany(id, companyId);
  }

  async deactivate(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await prisma.category.deactivate({ where: { id } });
    return this.findByIdInCompany(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await prisma.category.softDelete({ where: { id } });

    return {
      message: 'Categoría eliminada correctamente',
    };
  }

  private normalizeQuery(query: QueryCategoriesDto): NormalizedQueryCategories {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.q?.trim() && { q: query.q.trim() }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };
  }
}

function isPrismaUniqueError(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: string }).code === 'P2002'
  );
}
