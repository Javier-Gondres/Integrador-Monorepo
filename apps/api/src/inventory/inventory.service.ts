import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { BranchAccessService } from 'src/branch/branch-access.service';
import type { CompanyContext } from 'src/common/company';
import {
  BusinessException,
  ErrorCodes,
  InventoryException,
} from 'src/common/errors';
import { ProductsRepository } from 'src/products/products.repository';

import { CreateInventoryDto } from './dto/create-inventory.dto';
import {
  NormalizedQueryInventory,
  QueryInventoryDto,
} from './dto/query-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryRepository } from './inventory.repository';

const DEFAULT_PAGE = 1;
const DEFAULT_TAKE = 10;

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly branchAccessService: BranchAccessService,
    private readonly productRepository: ProductsRepository,
  ) {}

  async findAllByBranch(company: CompanyContext, query: QueryInventoryDto) {
    const branchId = await this.branchAccessService.resolveBranchId(
      company.companyId,
      query.branchId,
      company.branchId,
    );

    const normalized = this.normalizeQuery(query);
    const { items, total } =
      await this.inventoryRepository.findPaginatedByBranch(
        company.companyId,
        branchId,
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

  async findById(id: string, companyId: string) {
    const inventory = await this.inventoryRepository.findByIdInCompany(
      id,
      companyId,
    );

    if (!inventory) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'El producto no esta en el inventario',
      );
    }

    return inventory;
  }

  async create(createInventoryDto: CreateInventoryDto, companyId: string) {
    await this.branchAccessService.assertBranchInCompany(
      createInventoryDto.branchId,
      companyId,
    );

    const product = await this.productRepository.findByIdInCompany(
      createInventoryDto.productId,
      companyId,
    );
    if (!product) {
      throw InventoryException.productNotFound(createInventoryDto.productId);
    }

    return await this.inventoryRepository.create({
      branchId: createInventoryDto.branchId,
      productId: product.id,
      quantity: createInventoryDto.quantity,
      minimumQuantity: createInventoryDto.minimumQuantity,
    });
  }

  async update(id: string, companyId: string, data: UpdateInventoryDto) {
    const inventory = await this.findById(id, companyId);
    await this.branchAccessService.assertBranchInCompany(
      inventory.branchId,
      companyId,
    );

    const updateData: Prisma.InventoryUpdateInput = {
      ...(data.minimumQuantity !== undefined && {
        minimumQuantity: new Prisma.Decimal(data.minimumQuantity),
      }),
    };

    return await this.inventoryRepository.update(id, updateData);
  }

  async activate(id: string, companyId: string) {
    const inventory = await this.findById(id, companyId);
    await this.branchAccessService.assertBranchInCompany(
      inventory.branchId,
      companyId,
    );
    return await this.inventoryRepository.setActive(id, true);
  }

  async deactivate(id: string, companyId: string) {
    const inventory = await this.findById(id, companyId);
    await this.branchAccessService.assertBranchInCompany(
      inventory.branchId,
      companyId,
    );
    return await this.inventoryRepository.setActive(id, false);
  }

  async increaseQuantity(id: string, companyId: string, quantity: number) {
    const inventory = await this.inventoryRepository.findByIdInCompany(
      id,
      companyId,
    );

    if (!inventory) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'el producto no esta en el inventario',
      );
    }

    const newQty = inventory.quantity.plus(new Prisma.Decimal(quantity));
    const data: Prisma.InventoryUpdateInput = { quantity: newQty };

    return await this.inventoryRepository.update(id, data);
  }

  async decreaseQuantity(id: string, companyId: string, quantity: number) {
    const inventory = await this.inventoryRepository.findByIdInCompany(
      id,
      companyId,
    );

    if (!inventory) {
      throw BusinessException.notFound(
        ErrorCodes.RECORD_NOT_FOUND,
        'el producto no esta en el inventario',
      );
    }

    const newQty = inventory.quantity.minus(new Prisma.Decimal(quantity));
    if (newQty.lessThan(0)) {
      throw InventoryException.insufficientStock(inventory.productId);
    }
    const data: Prisma.InventoryUpdateInput = { quantity: newQty };

    return await this.inventoryRepository.update(id, data);
  }

  private normalizeQuery(query: QueryInventoryDto): NormalizedQueryInventory {
    return {
      page: query.page ?? DEFAULT_PAGE,
      take: query.take ?? DEFAULT_TAKE,
      ...(query.search?.trim() && { search: query.search.trim() }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.needsRestock !== undefined && {
        needsRestock: query.needsRestock,
      }),
    };
  }
}
