import { Injectable } from '@nestjs/common';
import { InventoryAdjustmentReason, Prisma, prisma } from '@repo/db';
import { PaginatedResult } from 'src/common/types/repository.types';

import { NormalizedQueryInventoryMovement } from './dto/query-inventory-movement.dto';
import {
  InventoryMovementRecord,
  inventoryMovementSelect,
} from './inventory-movement.selects';

export type PaginatedInventoryMovementResult =
  PaginatedResult<InventoryMovementRecord>;

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

  private buildListWhere(
    companyId: string,
    branchId: string,
    query: NormalizedQueryInventoryMovement,
  ): Prisma.InventoryMovementWhereInput {
    return {
      branchId,
      branch: { companyId },
      ...(query.type && { type: query.type }),
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

  async createWasteTransaction(
    companyId: string,
    branchId: string,
    productId: string,
    quantity: number,
    adjustmentReason: InventoryAdjustmentReason,
    employeeId?: string,
    notes?: string,
    referenceNumber?: string,
  ): Promise<InventoryMovementRecord> {
    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: {
          branchId_productId: {
            branchId,
            productId,
          },
        },
      });

      if (!inventory) {
        throw new Error('INVENTORY_NOT_FOUND');
      }

      const newQuantity = Number(inventory.quantity) - quantity;

      if (newQuantity < 0) {
        throw new Error('INSUFFICIENT_INVENTORY');
      }

      await tx.inventory.update({
        where: { id: inventory.id },
        data: { quantity: newQuantity },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          branchId,
          productId,
          type: 'WASTE',
          quantity: quantity,
          adjustmentReason,
          notes,
          referenceNumber,
          performedByEmployeeId: employeeId,
        },
        select: inventoryMovementSelect,
      });

      return movement;
    });
  }
}
