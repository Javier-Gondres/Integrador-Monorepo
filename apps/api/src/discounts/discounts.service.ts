import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';

import { CategoriesService } from '../categories/categories.service';
import { BusinessException, ErrorCodes } from '../common/errors';
import { getDefinedData } from '../common/helpers/object.utils';
import { ProductsService } from '../products/products.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import {
  NormalizedQueryDiscounts,
  QueryDiscountsDto,
} from './dto/query-discounts.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { DiscountsRepository } from './discounts.repository';
import type { DiscountRecord } from './discounts.selects';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

type DiscountCalculation = {
  precioOriginal: number;
  porcentajeDescuento: number;
  montoDescuento: number;
  precioFinal: number;
};

@Injectable()
export class DiscountsService {
  constructor(
    private readonly discountsRepository: DiscountsRepository,
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findPaginatedByCompany(companyId: string, query: QueryDiscountsDto) {
    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.discountsRepository.findPaginatedByCompany(
        companyId,
        normalized,
      );

    return {
      items: items.map(mapDiscount),
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  async findCurrentByCompany(companyId: string) {
    const discounts = await this.discountsRepository.findCurrentByCompany(
      companyId,
    );

    return discounts.map(mapDiscount);
  }

  async findByIdInCompany(id: string, companyId: string) {
    const discount = await this.discountsRepository.findByIdInCompany(
      id,
      companyId,
    );

    if (!discount) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El descuento no existe',
      );
    }

    return mapDiscount(discount);
  }

  async create(companyId: string, dto: CreateDiscountDto) {
    const productIds = dto.productIds ?? [];
    const categoryIds = dto.categoryIds ?? [];
    const excludedProductIds = dto.excludedProductIds ?? [];

    this.assertHasScope(productIds, categoryIds);
    this.assertExclusionsRequireCategories(categoryIds, excludedProductIds);
    this.validateDateRange(dto.startDate, dto.endDate);

    if (productIds.length > 0) {
      await this.productsService.assertAllExistInCompany(productIds, companyId);
    }
    if (categoryIds.length > 0) {
      await this.categoriesService.assertAllExistInCompany(
        categoryIds,
        companyId,
      );
    }
    if (excludedProductIds.length > 0) {
      await this.productsService.assertAllExistInCompany(
        excludedProductIds,
        companyId,
      );
    }

    const discount = await this.discountsRepository.create(companyId, {
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      percentage: dto.percentage,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      isActive: dto.isActive ?? true,
      productIds,
      categoryIds,
      excludedProductIds,
    });

    return mapDiscount(discount);
  }

  async update(id: string, companyId: string, dto: UpdateDiscountDto) {
    const current = await this.findByIdInCompany(id, companyId);
    const currentDiscount = await this.discountsRepository.findByIdInCompany(
      id,
      companyId,
    );

    if (!currentDiscount) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El descuento no existe',
      );
    }

    const nextProductIds = dto.productIds ?? current.products.map((p) => p.id);
    const nextCategoryIds =
      dto.categoryIds ?? current.categories.map((category) => category.id);
    const nextExcludedProductIds =
      dto.excludedProductIds ??
      current.excludedProducts.map((item) => item.id);

    this.assertHasScope(nextProductIds, nextCategoryIds);
    this.assertExclusionsRequireCategories(
      nextCategoryIds,
      nextExcludedProductIds,
    );

    const nextStartDate =
      dto.startDate !== undefined
        ? new Date(dto.startDate)
        : currentDiscount.startDate;
    const nextEndDate =
      dto.endDate !== undefined ? new Date(dto.endDate) : currentDiscount.endDate;

    this.validateDateRange(
      nextStartDate ? nextStartDate.toISOString() : undefined,
      nextEndDate ? nextEndDate.toISOString() : undefined,
    );

    if (dto.productIds !== undefined && dto.productIds.length > 0) {
      await this.productsService.assertAllExistInCompany(dto.productIds, companyId);
    }
    if (dto.categoryIds !== undefined && dto.categoryIds.length > 0) {
      await this.categoriesService.assertAllExistInCompany(
        dto.categoryIds,
        companyId,
      );
    }
    if (dto.excludedProductIds !== undefined && dto.excludedProductIds.length > 0) {
      await this.productsService.assertAllExistInCompany(
        dto.excludedProductIds,
        companyId,
      );
    }

    const data: Prisma.DiscountUpdateInput = {
      ...getDefinedData({
        name: dto.name?.trim(),
        description: dto.description !== undefined ? dto.description?.trim() || null : undefined,
        percentage: dto.percentage,
        startDate:
          dto.startDate !== undefined ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate !== undefined ? new Date(dto.endDate) : undefined,
        isActive: dto.isActive,
      }),
      ...(dto.productIds !== undefined && {
        products: { set: dto.productIds.map((productId) => ({ id: productId })) },
      }),
      ...(dto.categoryIds !== undefined && {
        categories: {
          set: dto.categoryIds.map((categoryId) => ({ id: categoryId })),
        },
      }),
      ...(dto.excludedProductIds !== undefined && {
        excludedProducts: {
          deleteMany: {},
          create: dto.excludedProductIds.map((productId) => ({ productId })),
        },
      }),
    };

    if (Object.keys(data).length === 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Debe enviar al menos un campo para actualizar',
      );
    }

    const discount = await this.discountsRepository.update(id, data);

    return mapDiscount(discount);
  }

  async activate(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.discountsRepository.activate(id);
    return this.findByIdInCompany(id, companyId);
  }

  async deactivate(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.discountsRepository.deactivate(id);
    return this.findByIdInCompany(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await this.discountsRepository.softDelete(id);

    return {
      message: 'Descuento eliminado correctamente',
    };
  }

  async findApplicableToProduct(productId: string, companyId: string) {
    const product = await this.productsService.findByIdInCompany(
      productId,
      companyId,
    );
    const discounts = await this.discountsRepository.findApplicableByProduct(
      companyId,
      productId,
      product.categories.map((category) => category.id),
    );

    const bestDiscount = discounts.reduce<DiscountRecord | null>((best, item) => {
      if (!best) return item;
      return Number(item.percentage) > Number(best.percentage) ? item : best;
    }, null);

    const precioOriginal = Number(product.price);
    const porcentajeDescuento = bestDiscount ? Number(bestDiscount.percentage) : 0;
    const montoDescuento = roundToTwo(
      (precioOriginal * porcentajeDescuento) / 100,
    );
    const precioFinal = roundToTwo(precioOriginal - montoDescuento);

    const calculation: DiscountCalculation = {
      precioOriginal,
      porcentajeDescuento,
      montoDescuento,
      precioFinal,
    };

    return calculation;
  }

  private normalizeQuery(query: QueryDiscountsDto): NormalizedQueryDiscounts {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.isCurrent !== undefined && { isCurrent: query.isCurrent }),
    };
  }

  private assertHasScope(productIds: string[], categoryIds: string[]) {
    if (productIds.length === 0 && categoryIds.length === 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'El descuento debe aplicar al menos a un producto o categoría',
      );
    }
  }

  private assertExclusionsRequireCategories(
    categoryIds: string[],
    excludedProductIds: string[],
  ) {
    if (excludedProductIds.length > 0 && categoryIds.length === 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Las exclusiones solo se permiten cuando el descuento aplica a categorías',
      );
    }
  }

  private validateDateRange(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) {
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'La fecha de inicio no puede ser mayor que la fecha fin',
      );
    }
  }
}

function mapDiscount(discount: DiscountRecord) {
  const { excludedProducts, percentage, ...rest } = discount;

  return {
    ...rest,
    percentage: Number(percentage),
    excludedProducts: excludedProducts.map((item) => item.product),
  };
}

function roundToTwo(value: number) {
  return Number(value.toFixed(2));
}