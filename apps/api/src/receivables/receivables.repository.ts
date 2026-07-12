import { Injectable } from '@nestjs/common';
import { PaymentMethod, Prisma, prisma, ReceivableStatus } from '@repo/db';
import { PaginatedResult } from 'src/common/types/repository.types';

import { NormalizedQueryReceivables } from './dto/query-receivables.dto';
import {
  ReceivableCustomerRecord,
  receivableCustomerSelect,
  ReceivableDetailRecord,
  receivableDetailSelect,
  ReceivableListRecord,
  receivableListSelect,
} from './receivables.selects';

type ReceivableBalance = {
  originalAmount: Prisma.Decimal;
  balance: Prisma.Decimal;
};

export type ReceivableCustomerSummaryItem = ReceivableCustomerRecord & {
  totalOriginalAmount: number;
  totalBalance: number;
  receivablesCount: number;
};

export type PaginatedReceivableCustomersResult =
  PaginatedResult<ReceivableCustomerSummaryItem>;

export type PaginatedReceivablesResult = PaginatedResult<ReceivableListRecord>;

@Injectable()
export class ReceivablesRepository {
  async findCustomersPaginatedByCompany(
    companyId: string,
    query: NormalizedQueryReceivables,
  ): Promise<PaginatedReceivableCustomersResult> {
    const receivableWhere = this.buildReceivableWhere(query);
    if (!query.status) {
      receivableWhere.status = { not: ReceivableStatus.PAID };
    }

    const where: Prisma.CustomerWhereInput = {
      companyId,
      accountsReceivable: { some: receivableWhere },
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };
    const skip = (query.page - 1) * query.take;

    const [rawItems, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { firstName: 'asc' },
        select: {
          ...receivableCustomerSelect,
          accountsReceivable: {
            where: receivableWhere,
            select: {
              originalAmount: true,
              balance: true,
            },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    const items: ReceivableCustomerSummaryItem[] = rawItems.map((customer) => {
      const receivables = customer.accountsReceivable as ReceivableBalance[];
      const totalOriginalAmount = receivables.reduce(
        (sum, rec) => sum + Number(rec.originalAmount),
        0,
      );
      const totalBalance = receivables.reduce(
        (sum, rec) => sum + Number(rec.balance),
        0,
      );

      const { accountsReceivable: _, ...rest } = customer;
      return {
        ...rest,
        totalOriginalAmount,
        totalBalance,
        receivablesCount: receivables.length,
      };
    });

    return { items, total };
  }

  async findReceivablesByCustomer(
    customerId: string,
    companyId: string,
    query: NormalizedQueryReceivables,
  ): Promise<PaginatedReceivablesResult> {
    const where: Prisma.AccountReceivableWhereInput = {
      customerId,
      customer: { companyId },
      ...this.buildReceivableWhere(query),
    };
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.accountReceivable.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
        select: receivableListSelect,
      }),
      prisma.accountReceivable.count({ where }),
    ]);

    return { items, total };
  }

  findByIdInCompany(
    id: string,
    companyId: string,
  ): Promise<ReceivableDetailRecord | null> {
    return prisma.accountReceivable.findFirst({
      where: { id, customer: { companyId } },
      select: receivableDetailSelect,
    });
  }

  private buildReceivableWhere(
    query: NormalizedQueryReceivables,
  ): Prisma.AccountReceivableWhereInput {
    return {
      ...(query.branchId && { sale: { branchId: query.branchId } }),
      ...(query.status && { status: query.status }),
      ...((query.dateFrom || query.dateTo) && {
        dueDate: {
          ...(query.dateFrom && { gte: query.dateFrom }),
          ...(query.dateTo && { lte: query.dateTo }),
        },
      }),
    };
  }

  async addPayment(
    id: string,
    data: { amount: Prisma.Decimal; method: PaymentMethod; notes?: string },
    newBalance: Prisma.Decimal,
    newStatus: ReceivableStatus,
  ): Promise<ReceivableDetailRecord> {
    return prisma.$transaction(async (tx) => {
      await tx.receivablePayment.create({
        data: {
          accountReceivableId: id,
          amount: data.amount,
          method: data.method,
          notes: data.notes,
        },
      });

      return tx.accountReceivable.update({
        where: { id },
        data: {
          balance: newBalance,
          status: newStatus,
        },
        select: receivableDetailSelect,
      });
    });
  }
}
