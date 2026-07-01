import { Injectable } from '@nestjs/common';

import { BusinessException, ErrorCodes } from '../common/errors';
import { getDefinedData } from '../common/helpers/object.utils';
import { ProductsService } from '../products/products.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { CreateProductSupplierDto } from './dto/create-product-supplier.dto';
import {
  NormalizedQuerySupplierProducts,
  QuerySupplierProductsDto,
} from './dto/query-supplier-products.dto';
import { UpdateProductSupplierDto } from './dto/update-product-supplier.dto';
import { ProductSupplierRepository } from './product-supplier.repository';
import type { ProductSupplierRecord } from './product-supplier.selects';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 50;

@Injectable()
export class ProductSupplierService {
  constructor(
    private readonly productSupplierRepository: ProductSupplierRepository,
    private readonly suppliersService: SuppliersService,
    private readonly productsService: ProductsService,
  ) {}

  async findPaginatedBySupplier(
    companyId: string,
    supplierId: string,
    query: QuerySupplierProductsDto,
  ) {
    await this.suppliersService.findByIdInCompany(supplierId, companyId);

    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.productSupplierRepository.findPaginatedBySupplier(
        supplierId,
        normalized,
      );

    return {
      items: items.map(mapProductSupplier),
      meta: {
        page: normalized.page,
        take: normalized.take,
        total,
        totalPages: Math.ceil(total / normalized.take) || 0,
      },
    };
  }

  async assign(
    companyId: string,
    supplierId: string,
    dto: CreateProductSupplierDto,
  ) {
    await this.suppliersService.findByIdInCompany(supplierId, companyId);
    await this.productsService.findByIdInCompany(dto.productId, companyId);

    const existing = await this.productSupplierRepository.findOne(
      supplierId,
      dto.productId,
    );
    if (existing) {
      throw new BusinessException(
        ErrorCodes.DUPLICATE_RECORD,
        'El producto ya está asignado a este proveedor',
      );
    }

    const record = await this.productSupplierRepository.create({
      productId: dto.productId,
      supplierId,
      lastCost: dto.lastCost ?? null,
      isActive: true,
    });

    return mapProductSupplier(record);
  }

  async activate(companyId: string, supplierId: string, productId: string) {
    await this.assertExists(companyId, supplierId, productId);
    const record = await this.productSupplierRepository.setActive(
      supplierId,
      productId,
      true,
    );
    return mapProductSupplier(record);
  }

  async deactivate(companyId: string, supplierId: string, productId: string) {
    await this.assertExists(companyId, supplierId, productId);
    const record = await this.productSupplierRepository.setActive(
      supplierId,
      productId,
      false,
    );
    return mapProductSupplier(record);
  }

  async update(
    companyId: string,
    supplierId: string,
    productId: string,
    dto: UpdateProductSupplierDto,
  ) {
    await this.assertExists(companyId, supplierId, productId);

    const data = getDefinedData(dto);
    if (Object.keys(data).length === 0) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_ERROR,
        'Debe enviar al menos un campo para actualizar',
      );
    }

    if (dto.isPreferred === true) {
      await this.productSupplierRepository.setPreferred(supplierId, productId);
    }

    const updateData = getDefinedData({
      ...(dto.isPreferred === false && { isPreferred: false }),
      ...(dto.lastCost !== undefined && { lastCost: dto.lastCost }),
    });

    const record = Object.keys(updateData).length
      ? await this.productSupplierRepository.update(
          supplierId,
          productId,
          updateData,
        )
      : await this.productSupplierRepository.findOne(supplierId, productId);

    return mapProductSupplier(record as ProductSupplierRecord);
  }

  async remove(companyId: string, supplierId: string, productId: string) {
    await this.assertExists(companyId, supplierId, productId);
    await this.productSupplierRepository.remove(supplierId, productId);

    return { message: 'Producto removido del catálogo del proveedor' };
  }

  private async assertExists(
    companyId: string,
    supplierId: string,
    productId: string,
  ): Promise<ProductSupplierRecord> {
    await this.suppliersService.findByIdInCompany(supplierId, companyId);
    const link = await this.productSupplierRepository.findOne(
      supplierId,
      productId,
    );
    if (!link) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El producto no está asignado a este proveedor',
      );
    }
    return link;
  }

  private normalizeQuery(
    query: QuerySupplierProductsDto,
  ): NormalizedQuerySupplierProducts {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };
  }
}

function mapProductSupplier(record: ProductSupplierRecord) {
  const { product, lastCost, ...rest } = record;

  return {
    ...rest,
    lastCost: lastCost !== null ? Number(lastCost) : null,
    product: {
      ...product,
      price: Number(product.price),
    },
  };
}
