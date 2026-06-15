import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import {
  endOfDay,
  isBefore,
  parseISO,
  startOfDay,
  startOfToday,
} from 'date-fns';

import { CategoriesService } from '../categories/categories.service';
import { BusinessException, ErrorCodes } from '../common/errors';
import { getDefinedData } from '../common/helpers/object.utils';
import { ProductsService } from '../products/products.service';
import { DiscountsRepository } from './discounts.repository';
import type { DiscountRecord } from './discounts.selects';
import { CreateDiscountDto } from './dto/create-discount.dto';
import {
  NormalizedQueryDiscounts,
  QueryDiscountsDto,
} from './dto/query-discounts.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

type DiscountCalculation = {
  originalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
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
    const discounts =
      await this.discountsRepository.findCurrentByCompany(companyId);

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
    this.assertNoProductScopeOverlap(productIds, excludedProductIds);

    const startDate = parseStartDate(dto.startDate);
    const endDate = parseEndDate(dto.endDate);
    this.assertDatesNotPast(startDate, endDate);
    this.validateDateRange(startDate, endDate);

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
      startDate,
      endDate,
      isActive: dto.isActive ?? true,
      productIds,
      categoryIds,
      excludedProductIds,
    });

    return mapDiscount(discount);
  }

  async update(id: string, companyId: string, dto: UpdateDiscountDto) {
    const current = await this.discountsRepository.findByIdInCompany(
      id,
      companyId,
    );

    if (!current) {
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
      current.excludedProducts.map((item) => item.product.id);

    this.assertHasScope(nextProductIds, nextCategoryIds);
    this.assertExclusionsRequireCategories(
      nextCategoryIds,
      nextExcludedProductIds,
    );
    this.assertNoProductScopeOverlap(nextProductIds, nextExcludedProductIds);

    const nextStartDate =
      dto.startDate !== undefined
        ? parseStartDate(dto.startDate)
        : current.startDate;
    const nextEndDate =
      dto.endDate !== undefined ? parseEndDate(dto.endDate) : current.endDate;

    // Solo validar fechas futuras cuando el cliente las envía explícitamente
    this.assertDatesNotPast(
      dto.startDate !== undefined ? nextStartDate : null,
      dto.endDate !== undefined ? nextEndDate : null,
    );
    this.validateDateRange(nextStartDate, nextEndDate);

    if (dto.productIds !== undefined && dto.productIds.length > 0) {
      await this.productsService.assertAllExistInCompany(
        dto.productIds,
        companyId,
      );
    }
    if (dto.categoryIds !== undefined && dto.categoryIds.length > 0) {
      await this.categoriesService.assertAllExistInCompany(
        dto.categoryIds,
        companyId,
      );
    }
    if (
      dto.excludedProductIds !== undefined &&
      dto.excludedProductIds.length > 0
    ) {
      await this.productsService.assertAllExistInCompany(
        dto.excludedProductIds,
        companyId,
      );
    }

    const data: Prisma.DiscountUpdateInput = {
      ...getDefinedData({
        name: dto.name?.trim(),
        description:
          dto.description !== undefined
            ? dto.description?.trim() || null
            : undefined,
        percentage: dto.percentage,
        startDate: dto.startDate !== undefined ? nextStartDate : undefined,
        endDate: dto.endDate !== undefined ? nextEndDate : undefined,
        isActive: dto.isActive,
      }),
      ...(dto.productIds !== undefined && {
        products: {
          set: dto.productIds.map((productId) => ({ id: productId })),
        },
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

    const bestDiscount = discounts.reduce<DiscountRecord | null>(
      (best, item) => {
        if (!best) {return item;}
        return Number(item.percentage) > Number(best.percentage) ? item : best;
      },
      null,
    );

    const originalPrice = Number(product.price);
    const discountPercentage = bestDiscount
      ? Number(bestDiscount.percentage)
      : 0;
    const discountAmount = roundToTwo(
      (originalPrice * discountPercentage) / 100,
    );
    const finalPrice = roundToTwo(originalPrice - discountAmount);

    const calculation: DiscountCalculation = {
      originalPrice,
      discountPercentage,
      discountAmount,
      finalPrice,
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

  private validateDateRange(startDate: Date | null, endDate: Date | null) {
    if (!startDate || !endDate) {
      return;
    }

    if (startDate > endDate) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'La fecha de inicio no puede ser mayor que la fecha fin',
      );
    }
  }

  private assertDatesNotPast(startDate: Date | null, endDate: Date | null) {
    const today = startOfToday();
    if (startDate && isBefore(startDate, today)) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'La fecha de inicio no puede estar en el pasado',
      );
    }
    if (endDate && isBefore(endDate, today)) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'La fecha de cierre no puede estar en el pasado',
      );
    }
  }

  private assertNoProductScopeOverlap(
    productIds: string[],
    excludedProductIds: string[],
  ) {
    const applicableSet = new Set(productIds);
    const overlap = excludedProductIds.filter((id) => applicableSet.has(id));
    if (overlap.length > 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Un producto no puede estar a la vez en el alcance y en las exclusiones',
      );
    }
  }
}

/**
 * Parsea una fecha de inicio: inicio de día UTC.
 * Acepta tanto ISO completo como date-only (YYYY-MM-DD).
 */
function parseStartDate(value: string | null | undefined): Date | null {
  if (!value) {return null;}
  return startOfDay(parseISO(value));
}

/**
 * Parsea una fecha de fin: fin de día UTC, para cubrir el día completo.
 * Acepta tanto ISO completo como date-only (YYYY-MM-DD).
 */
function parseEndDate(value: string | null | undefined): Date | null {
  if (!value) {return null;}
  return endOfDay(parseISO(value));
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
