import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';

import { BusinessException, ErrorCodes } from '../common/errors';
import { getDefinedData } from '../common/helpers/object.utils';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  NormalizedQueryCategories,
  QueryCategoriesDto,
} from './dto/query-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findPaginatedByCompany(companyId: string, query: QueryCategoriesDto) {
    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.categoriesRepository.findPaginatedByCompany(
        companyId,
        normalized,
      );

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
    return this.categoriesRepository.findAllActiveByCompany(companyId);
  }

  async findByIdInCompany(id: string, companyId: string) {
    const category = await this.categoriesRepository.findByIdInCompany(
      id,
      companyId,
    );

    if (!category) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'La categoría no existe',
      );
    }

    return category;
  }

  async assertAllExistInCompany(categoryIds: string[], companyId: string) {
    const count = await this.categoriesRepository.countByIdsInCompany(
      categoryIds,
      companyId,
    );

    if (count !== categoryIds.length) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'Una o más categorías no existen en esta empresa',
      );
    }
  }

  async create(companyId: string, dto: CreateCategoryDto) {
    return this.categoriesRepository.create(companyId, {
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      isActive: dto.isActive ?? true,
    });
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

    return this.categoriesRepository.update(id, updateData);
  }

  async activate(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.categoriesRepository.activate(id);
    return this.findByIdInCompany(id, companyId);
  }

  async deactivate(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.categoriesRepository.deactivate(id);
    return this.findByIdInCompany(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.categoriesRepository.softDelete(id);

    return {
      message: 'Categoría eliminada correctamente',
    };
  }

  private normalizeQuery(query: QueryCategoriesDto): NormalizedQueryCategories {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };
  }
}
