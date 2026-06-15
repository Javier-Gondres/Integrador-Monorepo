import { Injectable } from '@nestjs/common';
import { Prisma, prisma, TransferStatus } from '@repo/db';
import type { PaginatedResult } from 'src/common/types/repository.types';

import { NormalizedQueryTransfers } from './dto/query-transfers.dto';
import { TransferRecord, transferSelect } from './transfers.selects';

export type PaginatedTransfersResult = PaginatedResult<TransferRecord>;

@Injectable()
export class TransfersRepository {
  async findPaginatedByCompany(
    companyId: string,
    query: NormalizedQueryTransfers,
  ): Promise<PaginatedTransfersResult> {
    const where = this.buildListWhere(companyId, query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.transfer.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
        select: transferSelect,
      }),
      prisma.transfer.count({ where }),
    ]);

    return { items, total };
  }

  findById(id: string): Promise<TransferRecord | null> {
    return prisma.transfer.findUnique({
      where: { id },
      select: transferSelect,
    });
  }

  create(
    fromBranchId: string,
    toBranchId: string,
    notes: string | undefined,
    items: { productId: string; quantity: number }[],
  ): Promise<TransferRecord> {
    return prisma.transfer.create({
      data: {
        fromBranchId,
        toBranchId,
        notes,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: new Prisma.Decimal(item.quantity),
          })),
        },
      },
      select: transferSelect,
    });
  }

  updateStatus(id: string, status: TransferStatus): Promise<TransferRecord> {
    return prisma.transfer.update({
      where: { id },
      data: { status },
      select: transferSelect,
    });
  }

  async getStockForProduct(
    branchId: string,
    productId: string,
  ): Promise<number> {
    const inventory = await prisma.inventory.findFirst({
      where: { branchId, productId },
      select: { quantity: true },
    });
    return inventory ? Number(inventory.quantity) : 0;
  }

  private buildListWhere(
    companyId: string,
    query: NormalizedQueryTransfers,
  ): Prisma.TransferWhereInput {
    return {
      fromBranch: { companyId },
      toBranch: { companyId },
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          {
            items: {
              some: {
                product: {
                  OR: [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { code: { contains: query.search, mode: 'insensitive' } },
                  ],
                },
              },
            },
          },
        ],
      }),
    };
  }
}
