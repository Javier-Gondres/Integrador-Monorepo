import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { prisma } from '@repo/db';

import { BusinessException, ErrorCodes } from '../common/errors';
import { getDefinedData } from '../common/helpers/object.utils';
import { CreateProductDto } from './dto/create-product.dto';
import {
  NormalizedQueryProducts,
  QueryProductsDto,
} from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

const categorySummarySelect = {
  id: true,
  name: true,
} as const;

const productSelect = {
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

type ProductRecord = Prisma.ProductGetPayload<{ select: typeof productSelect }>;

@Injectable()
export class ProductsService {
  async findPaginatedByCompany(companyId: string, query: QueryProductsDto) {
    const normalized = this.normalizeQuery(query);
    const skip = (normalized.page - 1) * normalized.take;

    const where: Prisma.ProductWhereInput = {
      companyId,
      ...(normalized.isActive !== undefined && {
        isActive: normalized.isActive,
      }),
      ...(normalized.categoryId && {
        categories: { some: { id: normalized.categoryId, companyId } },
      }),
      ...(normalized.q && {
        OR: [
          { name: { contains: normalized.q, mode: 'insensitive' } },
          { code: { contains: normalized.q, mode: 'insensitive' } },
          { description: { contains: normalized.q, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: normalized.take,
        orderBy: { name: 'asc' },
        select: productSelect,
      }),
      prisma.product.count({ where }),
    ]);

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
    const product = await prisma.product.findFirst({
      where: { id, companyId },
      select: productSelect,
    });

    if (!product) {
      throw BusinessException.notFound(
        ErrorCodes.PRODUCT_NOT_FOUND,
        'El producto no existe',
      );
    }

    return mapProduct(product);
  }

  async create(companyId: string, dto: CreateProductDto) {
    if (dto.categoryIds?.length) {
      await this.assertCategoriesInCompany(dto.categoryIds, companyId);
    }

    try {
      const product = await prisma.product.create({
        data: {
          companyId,
          name: dto.name.trim(),
          code: dto.code.trim(),
          description: dto.description?.trim() || null,
          imageUrl: dto.imageUrl?.trim() || null,
          price: dto.price,
          isActive: dto.isActive ?? true,
          ...(dto.categoryIds?.length && {
            categories: {
              connect: dto.categoryIds.map((id) => ({ id })),
            },
          }),
        },
        select: productSelect,
      });

      return mapProduct(product);
    } catch (e: unknown) {
      if (isPrismaUniqueError(e)) {
        throw BusinessException.conflict(
          ErrorCodes.DUPLICATE_RECORD,
          'Ya existe un producto con ese código en esta empresa',
        );
      }
      throw e;
    }
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
        await this.assertCategoriesInCompany(categoryIds, companyId);
      }
      updateData.categories = { set: categoryIds.map((cid) => ({ id: cid })) };
    }

    if (Object.keys(updateData).length === 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Debe enviar al menos un campo para actualizar',
      );
    }

    try {
      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        select: productSelect,
      });

      return mapProduct(product);
    } catch (e: unknown) {
      if (isPrismaUniqueError(e)) {
        throw BusinessException.conflict(
          ErrorCodes.DUPLICATE_RECORD,
          'Ya existe un producto con ese código en esta empresa',
        );
      }
      throw e;
    }
  }

  async activate(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await prisma.product.activate({ where: { id } });
    return this.findByIdInCompany(id, companyId);
  }

  async deactivate(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await prisma.product.deactivate({ where: { id } });
    return this.findByIdInCompany(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findByIdInCompany(id, companyId);
    await prisma.product.softDelete({ where: { id } });

    return {
      message: 'Producto eliminado correctamente',
    };
  }

  private async assertCategoriesInCompany(
    categoryIds: string[],
    companyId: string,
  ) {
    const count = await prisma.category.count({
      where: {
        id: { in: categoryIds },
        companyId,
      },
    });

    if (count !== categoryIds.length) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'Una o más categorías no existen en esta empresa',
      );
    }
  }

  private normalizeQuery(query: QueryProductsDto): NormalizedQueryProducts {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.q?.trim() && { q: query.q.trim() }),
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

function isPrismaUniqueError(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: string }).code === 'P2002'
  );
}
