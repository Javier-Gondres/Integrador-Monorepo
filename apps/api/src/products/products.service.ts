import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';

import { CategoriesService } from '../categories/categories.service';
import { BusinessException, ErrorCodes } from '../common/errors';
import { getDefinedData } from '../common/helpers/object.utils';
import { CreateProductDto } from './dto/create-product.dto';
import {
  NormalizedQueryProducts,
  QueryProductsDto,
} from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsRepository } from './products.repository';
import type { ProductRecord } from './products.selects';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findPaginatedByCompany(companyId: string, query: QueryProductsDto) {
    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.productsRepository.findPaginatedByCompany(
        companyId,
        normalized,
      );

    return {
      items: items.map(mapProduct),
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  async findByIdInCompany(id: string, companyId: string) {
    const product = await this.productsRepository.findByIdInCompany(
      id,
      companyId,
    );

    if (!product) {
      throw BusinessException.notFound(
        ErrorCodes.PRODUCT_NOT_FOUND,
        'El producto no existe',
      );
    }

    return mapProduct(product);
  }

  async assertAllExistInCompany(productIds: string[], companyId: string) {
    const count = await this.productsRepository.countByIdsInCompany(
      productIds,
      companyId,
    );

    if (count !== productIds.length) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'Uno o más productos no existen en esta empresa',
      );
    }
  }

  async create(companyId: string, dto: CreateProductDto) {
    if (dto.categoryIds?.length) {
      await this.categoriesService.assertAllExistInCompany(
        dto.categoryIds,
        companyId,
      );
    }

    const product = await this.productsRepository.create(companyId, {
      name: dto.name.trim(),
      code: dto.code.trim(),
      description: dto.description?.trim() || null,
      imageUrl: dto.imageUrl?.trim() || null,
      price: dto.price,
      isActive: dto.isActive ?? true,
      categoryIds: dto.categoryIds,
    });

    return mapProduct(product);
  }

  async update(id: string, companyId: string, dto: UpdateProductDto) {
    await this.findByIdInCompany(id, companyId);

    const { categoryIds, ...rest } = dto;
    const data = getDefinedData(rest);
    if (data.name !== undefined) {
      data.name = data.name.trim();
    }
    if (data.code !== undefined) {
      data.code = data.code.trim();
    }

    const updateData: Prisma.ProductUpdateInput = { ...data };
    if (dto.description !== undefined) {
      updateData.description = dto.description?.trim() || null;
    }
    if (dto.imageUrl !== undefined) {
      updateData.imageUrl = dto.imageUrl?.trim() || null;
    }
    if (categoryIds !== undefined) {
      if (categoryIds.length > 0) {
        await this.categoriesService.assertAllExistInCompany(
          categoryIds,
          companyId,
        );
      }
      updateData.categories = { set: categoryIds.map((cid) => ({ id: cid })) };
    }

    if (Object.keys(updateData).length === 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Debe enviar al menos un campo para actualizar',
      );
    }

    const product = await this.productsRepository.update(id, updateData);

    return mapProduct(product);
  }

  async activate(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.productsRepository.activate(id);
    return this.findByIdInCompany(id, companyId);
  }

  async deactivate(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.productsRepository.deactivate(id);
    return this.findByIdInCompany(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.productsRepository.softDelete(id);

    return {
      message: 'Producto eliminado correctamente',
    };
  }

  private normalizeQuery(query: QueryProductsDto): NormalizedQueryProducts {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.categoryId?.trim() && { categoryId: query.categoryId.trim() }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };
  }
}

function mapProduct(product: ProductRecord) {
  const { categories, ...rest } = product;

  return {
    ...rest,
    price: Number(product.price),
    categories,
    categoryIds: categories.map((category) => category.id),
  };
}
