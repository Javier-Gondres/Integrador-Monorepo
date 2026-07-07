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

export type CreateWasteData = {
  branchId: string;
  productId: string;
  quantity: number;
  adjustmentReason: InventoryAdjustmentReason;
  performedByEmployeeId: string;
  notes: string | null;
  referenceNumber: string | null;
  audit: {
    companyId: string;
    userId: string;
  };
};

export type InventoryAlert = {
  type: 'RECURRING_WASTE' | 'LOW_STOCK';
  company: {
    id: string;
    name: string;
  };
  branch: {
    id: string;
    name: string;
  };
  product: {
    id: string;
    code: string;
    name: string;
  };
  latestDate: Date;
  wasteCount: number;
  periodDays: number;
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

  async findRecurringWasteAlerts(
    companyId: string,
    branchId: string,
    threshold: number,
  ): Promise<InventoryAlert[]> {
    // Tomamos la fecha de hace 7 días para filtrar los movimientos de inventario recientes
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const movements = await prisma.inventoryMovement.findMany({
      where: {
        branch: { companyId },
        type: InventoryMovementType.WASTE,
        branchId,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        branchId: true,
        productId: true,
        createdAt: true,
        branch: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        product: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const groupedAlerts = new Map<string, InventoryAlert>();
    const wasteCounts = new Map<string, number>();

    movements.forEach((movement) => {
      const key = `${movement.branchId}:${movement.productId}`;
      const existing = groupedAlerts.get(key);

      if (!existing) {
        groupedAlerts.set(key, {
          type: 'RECURRING_WASTE',
          company: {
            id: movement.branch.company.id,
            name: movement.branch.company.name,
          },
          branch: {
            id: movement.branch.id,
            name: movement.branch.name,
          },
          product: {
            id: movement.product.id,
            code: movement.product.code,
            name: movement.product.name,
          },
          latestDate: movement.createdAt,
          wasteCount: 1,
          periodDays: 7,
        });
        wasteCounts.set(key, 1);
        return;
      }

      const nextCount = (wasteCounts.get(key) ?? 0) + 1;
      wasteCounts.set(key, nextCount);

      if (movement.createdAt > existing.latestDate) {
        existing.latestDate = movement.createdAt;
      }

      existing.wasteCount = nextCount;
    });

    return Array.from(groupedAlerts.values())
      .filter((alert) => alert.wasteCount >= threshold)
      .sort(
        (left, right) => left.latestDate.getTime() - right.latestDate.getTime(),
      );
  }

  async createAdjustment(
    data: CreateAdjustmentData,
  ): Promise<InventoryMovementRecord> {
    const delta = new Prisma.Decimal(data.quantity);

    return prisma.$transaction(async (tx) => {
      if (delta.isNegative()) {
        const absDelta = delta.abs();
        const decrementResult = await tx.inventory.updateMany({
          where: {
            branchId: data.branchId,
            productId: data.productId,
            quantity: { gte: absDelta },
          },
          data: { quantity: { decrement: absDelta } },
        });

        if (decrementResult.count === 0) {
          const inventory = await tx.inventory.findUnique({
            where: {
              branchId_productId: {
                branchId: data.branchId,
                productId: data.productId,
              },
            },
            select: { id: true },
          });

          if (!inventory) {
            throw InventoryException.inventoryNotInBranch();
          }

          throw InventoryException.insufficientStock();
        }
      } else if (delta.isPositive()) {
        await tx.inventory.upsert({
          where: {
            branchId_productId: {
              branchId: data.branchId,
              productId: data.productId,
            },
          },
          update: { quantity: { increment: delta } },
          create: {
            branchId: data.branchId,
            productId: data.productId,
            quantity: delta,
          },
        });
      }

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

  async createWasteTransaction(
    data: CreateWasteData,
  ): Promise<InventoryMovementRecord> {
    const wasteQty = new Prisma.Decimal(data.quantity);

    return prisma.$transaction(async (tx) => {
      const decrementResult = await tx.inventory.updateMany({
        where: {
          branchId: data.branchId,
          productId: data.productId,
          quantity: { gte: wasteQty },
        },
        data: { quantity: { decrement: wasteQty } },
      });

      if (decrementResult.count === 0) {
        const inventory = await tx.inventory.findUnique({
          where: {
            branchId_productId: {
              branchId: data.branchId,
              productId: data.productId,
            },
          },
          select: { id: true },
        });

        if (!inventory) {
          throw InventoryException.inventoryNotInBranch();
        }

        throw InventoryException.insufficientStock();
      }

      const movement = await tx.inventoryMovement.create({
        data: {
          branchId: data.branchId,
          productId: data.productId,
          type: InventoryMovementType.WASTE,
          quantity: wasteQty,
          adjustmentReason: data.adjustmentReason,
          notes: data.notes,
          referenceNumber: data.referenceNumber,
          performedByEmployeeId: data.performedByEmployeeId,
        },
        select: inventoryMovementSelect,
      });

      await tx.auditLog.create({
        data: {
          companyId: data.audit.companyId,
          branchId: data.branchId,
          userId: data.audit.userId,
          action: 'CREATE_WASTE',
          entity: 'InventoryMovement',
          entityId: movement.id,
          metadata: {
            productId: data.productId,
            quantity: wasteQty.toString(),
            adjustmentReason: data.adjustmentReason,
            referenceNumber: data.referenceNumber,
          },
        },
      });

      return movement;
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
