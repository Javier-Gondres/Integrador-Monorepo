import { Injectable } from '@nestjs/common';
import {
  InventoryAdjustmentReason,
  InventoryMovementType,
  Prisma,
  prisma,
} from '@repo/db';
import { BusinessException, ErrorCodes } from 'src/common/errors';
import { PaginatedResult } from 'src/common/types/repository.types';

import { NormalizedQueryInventory } from './dto/query-inventory.dto';
import { InventoryRecord, inventorySelect } from './inventory.selects';

export type PaginatedInventoryResult = PaginatedResult<InventoryRecord>;

export type CreateInventoryData = {
  branchId: string;
  productId: string;
  quantity: number;
  minimumQuantity?: number;
  performedByEmployeeId?: string;
};

@Injectable()
export class InventoryRepository {
  async findPaginatedByBranch(
    companyId: string,
    branchId: string,
    query: NormalizedQueryInventory,
  ): Promise<PaginatedInventoryResult> {
    const where = this.buildListWhere(companyId, branchId, query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.inventory.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { product: { name: 'asc' } },
        select: inventorySelect,
      }),
      prisma.inventory.count({ where }),
    ]);

    return { items, total };
  }

  findByIdInCompany(
    id: string,
    companyId: string,
  ): Promise<InventoryRecord | null> {
    return prisma.inventory.findFirst({
      where: { id, branch: { companyId } },
      select: inventorySelect,
    });
  }

  /**
   * Crea el registro de inventario con cantidad 0 y, si aplica, registra el
   * stock inicial como movimiento ADJUSTMENT para mantener trazabilidad.
   */
  async create(data: CreateInventoryData): Promise<InventoryRecord> {
    try {
      return await prisma.$transaction(async (tx) => {
        const inventory = await tx.inventory.create({
          data: {
            branchId: data.branchId,
            productId: data.productId,
            quantity: new Prisma.Decimal(0),
            ...(data.minimumQuantity !== undefined && {
              minimumQuantity: new Prisma.Decimal(data.minimumQuantity),
            }),
          },
          select: { id: true },
        });

        if (data.quantity > 0) {
          const delta = new Prisma.Decimal(data.quantity);

          await tx.inventory.update({
            where: { id: inventory.id },
            data: { quantity: delta },
          });

          await tx.inventoryMovement.create({
            data: {
              branchId: data.branchId,
              productId: data.productId,
              type: InventoryMovementType.ADJUSTMENT,
              quantity: delta,
              adjustmentReason: InventoryAdjustmentReason.COUNT_DIFFERENCE,
              notes: 'Stock inicial al registrar producto en inventario',
              performedByEmployeeId: data.performedByEmployeeId,
            },
          });
        }

        return tx.inventory.findUniqueOrThrow({
          where: { id: inventory.id },
          select: inventorySelect,
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BusinessException(
          ErrorCodes.DUPLICATE_RECORD,
          'El producto ya está registrado en el inventario de esta sucursal',
        );
      }
      throw error;
    }
  }

  update(
    id: string,
    data: Prisma.InventoryUpdateInput,
  ): Promise<InventoryRecord> {
    return prisma.inventory.update({
      where: { id },
      data,
      select: inventorySelect,
    });
  }

  setActive(id: string, isActive: boolean): Promise<InventoryRecord> {
    return prisma.inventory.update({
      where: { id },
      data: { isActive },
      select: inventorySelect,
    });
  }

  private buildListWhere(
    companyId: string,
    branchId: string,
    query: NormalizedQueryInventory,
  ): Prisma.InventoryWhereInput {
    return {
      branchId,
      branch: { companyId },
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.needsRestock && {
        quantity: { lte: prisma.inventory.fields.minimumQuantity },
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
