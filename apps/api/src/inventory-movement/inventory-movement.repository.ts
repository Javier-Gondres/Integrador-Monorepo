import { Injectable } from '@nestjs/common';
import {
  InventoryAdjustmentReason,
  InventoryMovementType,
  Prisma,
  prisma,
} from '@repo/db';
import { subDays } from 'date-fns';
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
  // For both alert types the latest relevant date (optional)
  latestDate?: Date;

  // RECURRING_WASTE specific
  wasteCount?: number;
  periodDays?: number;

  // LOW_STOCK specific
  currentStock?: string;
  minimumStock?: string;
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
    branchId: string | undefined,
    threshold: number,
  ): Promise<InventoryAlert[]> {
    const sevenDaysAgo = subDays(new Date(), 7);

    const movements = await prisma.inventoryMovement.findMany({
      where: {
        branch: { companyId },
        type: InventoryMovementType.WASTE,
        ...(branchId && { branchId }),
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

      if (movement.createdAt > (existing.latestDate ?? new Date(0))) {
        existing.latestDate = movement.createdAt;
      }

      existing.wasteCount = nextCount;
    });

    const recurringAlerts = Array.from(groupedAlerts.values()).filter(
      (alert) => (alert.wasteCount ?? 0) >= threshold,
    );

    // Find low stock inventories for the company (and optional branch)
    const inventories = await prisma.inventory.findMany({
      where: {
        branch: { companyId },
        ...(branchId && { branchId }),
      },
      select: {
        branchId: true,
        productId: true,
        quantity: true,
        minimumQuantity: true,
        updatedAt: true,
        branch: {
          select: {
            id: true,
            name: true,
            company: { select: { id: true, name: true } },
          },
        },
        product: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    const lowStockAlerts: InventoryAlert[] = inventories
      .filter((inv) => Number(inv.quantity) <= Number(inv.minimumQuantity))
      .map((inv) => ({
        type: 'LOW_STOCK',
        company: {
          id: inv.branch.company.id,
          name: inv.branch.company.name,
        },
        branch: {
          id: inv.branch.id,
          name: inv.branch.name,
        },
        product: {
          id: inv.product.id,
          code: inv.product.code,
          name: inv.product.name,
        },
        latestDate: inv.updatedAt,
        currentStock: inv.quantity.toString(),
        minimumStock: inv.minimumQuantity.toString(),
      }));

    const combined = [...recurringAlerts, ...lowStockAlerts];

    return combined.sort((left, right) => {
      const lTime = left.latestDate ? left.latestDate.getTime() : 0;
      const rTime = right.latestDate ? right.latestDate.getTime() : 0;
      return lTime - rTime;
    });
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
