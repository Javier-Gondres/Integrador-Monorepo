import { Injectable } from '@nestjs/common';
import {
  InventoryAdjustmentReason,
  InventoryMovementType,
  Prisma,
  prisma,
} from '@repo/db';
import { InventoryException } from 'src/common/errors';
import { PaginatedResult } from 'src/common/types/repository.types';

import { NormalizedQueryInventoryMovement } from './dto/query-inventory-movement.dto';
import {
  InventoryMovementRecord,
  inventoryMovementSelect,
} from './inventory-movement.selects';

export type PaginatedInventoryMovementResult =
  PaginatedResult<InventoryMovementRecord>;

export type CreateAdjustmentData = {
  branchId: string;
  productId: string;
  quantity: number;
  adjustmentReason: InventoryAdjustmentReason;
  notes: string | null;
  performedByEmployeeId?: string;
};

@Injectable()
export class InventoryMovementRepository {
  async findPaginatedByBranch(
    companyId: string,
    branchId: string,
    query: NormalizedQueryInventoryMovement,
  ): Promise<PaginatedInventoryMovementResult> {
    const where = this.buildListWhere(companyId, branchId, query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.inventoryMovement.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
        select: inventoryMovementSelect,
      }),
      prisma.inventoryMovement.count({ where }),
    ]);

    return { items, total };
  }

  async createAdjustment(
    data: CreateAdjustmentData,
  ): Promise<InventoryMovementRecord> {
    const delta = new Prisma.Decimal(data.quantity);

    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: {
          branchId_productId: {
            branchId: data.branchId,
            productId: data.productId,
          },
        },
        select: { quantity: true },
      });

      const newQuantity = (inventory?.quantity ?? new Prisma.Decimal(0)).plus(
        delta,
      );
      if (newQuantity.isNegative()) {
        throw InventoryException.insufficientStock();
      }

      await tx.inventory.upsert({
        where: {
          branchId_productId: {
            branchId: data.branchId,
            productId: data.productId,
          },
        },
        update: { quantity: newQuantity },
        create: {
          branchId: data.branchId,
          productId: data.productId,
          quantity: newQuantity,
        },
      });

      return tx.inventoryMovement.create({
        data: {
          branchId: data.branchId,
          productId: data.productId,
          type: InventoryMovementType.ADJUSTMENT,
          quantity: delta,
          adjustmentReason: data.adjustmentReason,
          notes: data.notes,
          performedByEmployeeId: data.performedByEmployeeId,
        },
        select: inventoryMovementSelect,
      });
    });
  }

  private buildListWhere(
    companyId: string,
    branchId: string,
    query: NormalizedQueryInventoryMovement,
  ): Prisma.InventoryMovementWhereInput {
    return {
      branchId,
      branch: { companyId },
      ...(query.type && { type: query.type }),
      ...(query.adjustmentReason && {
        adjustmentReason: query.adjustmentReason,
      }),
      ...((query.dateFrom || query.dateTo) && {
        createdAt: {
          ...(query.dateFrom && { gte: query.dateFrom }),
          ...(query.dateTo && { lte: query.dateTo }),
        },
      }),
      ...(query.search && {
        OR: [
          {
            product: { name: { contains: query.search, mode: 'insensitive' } },
          },
          {
            product: { code: { contains: query.search, mode: 'insensitive' } },
          },
        ],
      }),
    };
  }
}
