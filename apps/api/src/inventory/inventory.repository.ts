import { Injectable } from "@nestjs/common";
import { Prisma, prisma } from "@repo/db";
import { PaginatedResult } from "src/common/types/repository.types";

import { CreateInventoryDto } from "./dto/create-inventory.dto";
import { NormalizedQueryInventory } from "./dto/query-inventory.dto";
import { InventoryRecord, inventorySelect } from "./inventory.selects";

export type PaginatedInventoryResult = PaginatedResult<InventoryRecord>;

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
        orderBy: { product: { name: "asc" } },
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

  create(createInventoryDto: CreateInventoryDto): Promise<InventoryRecord> {
    return prisma.inventory.create({
      data: {
        branchId: createInventoryDto.branchId,
        productId: createInventoryDto.productId,
        ...(createInventoryDto.quantity !== undefined && {
          quantity: new Prisma.Decimal(createInventoryDto.quantity),
        }),
        ...(createInventoryDto.minimumQuantity !== undefined && {
          minimumQuantity: new Prisma.Decimal(
            createInventoryDto.minimumQuantity,
          ),
        }),
      },
      select: inventorySelect,
    });
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
            product: { name: { contains: query.search, mode: "insensitive" } },
          },
          {
            product: { code: { contains: query.search, mode: "insensitive" } },
          },
        ],
      }),
    };
  }
}
