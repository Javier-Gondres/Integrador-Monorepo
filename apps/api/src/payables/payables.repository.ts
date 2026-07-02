import { Injectable } from '@nestjs/common';
import { Prisma, prisma } from '@repo/db';
import { PaginatedResult } from 'src/common/types/repository.types';

import { NormalizedQueryPayables } from './dto/query-payables.dto';
import {
  PayableDetailRecord,
  payableDetailSelect,
  PayableListRecord,
  payableListSelect,
} from './payables.selects';

export type PaginatedPayablesResult = PaginatedResult<PayableListRecord>;

@Injectable()
export class PayablesRepository {
  async findPaginatedByCompany(
    companyId: string,
    query: NormalizedQueryPayables,
  ): Promise<PaginatedPayablesResult> {
    const where = this.buildListWhere(companyId, query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.accountPayable.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
        select: payableListSelect,
      }),
      prisma.accountPayable.count({ where }),
    ]);

    return { items, total };
  }

  findByIdInCompany(
    id: string,
    companyId: string,
  ): Promise<PayableDetailRecord | null> {
    return prisma.accountPayable.findFirst({
      where: { id, branch: { companyId } },
      select: payableDetailSelect,
    });
  }

  private buildListWhere(
    companyId: string,
    query: NormalizedQueryPayables,
  ): Prisma.AccountPayableWhereInput {
    return {
      branch: { companyId },
      ...(query.branchId && { branchId: query.branchId }),
      ...(query.supplierId && { supplierId: query.supplierId }),
      ...(query.status && { status: query.status }),
      ...((query.dateFrom || query.dateTo) && {
        dueDate: {
          ...(query.dateFrom && { gte: query.dateFrom }),
          ...(query.dateTo && { lte: query.dateTo }),
        },
      }),
    };
  }

  update(
    id: string,
    companyId: string,
    data: { dueDate?: Date },
  ): Promise<PayableDetailRecord> {
    return prisma.accountPayable.update({
      where: {
        id,
      },
      data,
      select: payableDetailSelect,
    });
  }

  async addPayment(
    id: string,
    data: { amount: Prisma.Decimal; method: any; notes?: string },
    newBalance: Prisma.Decimal,
    newStatus: any,
  ): Promise<PayableDetailRecord> {
    return prisma.$transaction(async (tx) => {
      await tx.payablePayment.create({
        data: {
          accountPayableId: id,
          amount: data.amount,
          method: data.method,
          notes: data.notes,
        },
      });

      return tx.accountPayable.update({
        where: { id },
        data: {
          balance: newBalance,
          status: newStatus,
        },
        select: payableDetailSelect,
      });
    });
  }
}
