import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { prisma } from '@repo/db';

import type { PaginatedResult } from '../common/types/repository.types';
import {
  CashRegisterRecord,
  cashRegisterSelect,
} from './cash-registers.selects';
import type { NormalizedQueryShifts } from './dto/query-shifts.dto';

const shiftSelect = {
  id: true,
  openingAmount: true,
  closingAmount: true,
  openedAt: true,
  closedAt: true,
  cashier: {
    select: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  sales: {
    select: {
      total: true,
      payments: {
        select: {
          method: true,
          amount: true,
        },
      },
    },
  },
} as const;

export type ShiftRecord = Prisma.CashShiftGetPayload<{
  select: typeof shiftSelect;
}>;

@Injectable()
export class CashRegistersRepository {
  findAllByBranch(branchId: string): Promise<CashRegisterRecord[]> {
    return prisma.cashRegister.findMany({
      where: {
        branchId,
        deletedAt: null,
      },
      select: cashRegisterSelect,
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string): Promise<CashRegisterRecord | null> {
    return prisma.cashRegister.findFirst({
      where: { id, deletedAt: null },
      select: cashRegisterSelect,
    });
  }

  create(branchId: string, name: string): Promise<CashRegisterRecord> {
    return prisma.cashRegister.create({
      data: {
        name,
        branchId,
      },
      select: cashRegisterSelect,
    });
  }

  openShift(cashRegisterId: string, cashierId: string, openingAmount: number) {
    return prisma.cashShift.create({
      data: {
        cashRegisterId,
        cashierId,
        openingAmount,
      },
    });
  }

  closeShift(shiftId: string, closingAmount: number) {
    return prisma.cashShift.update({
      where: { id: shiftId },
      data: {
        closingAmount,
        closedAt: new Date(),
      },
    });
  }

  findShiftsByRegisterPaginated(
    cashRegisterId: string,
    query: NormalizedQueryShifts,
  ): Promise<PaginatedResult<ShiftRecord>> {
    const skip = (query.page - 1) * query.take;

    return prisma
      .$transaction([
        prisma.cashShift.findMany({
          where: { cashRegisterId },
          orderBy: { openedAt: 'desc' },
          skip,
          take: query.take,
          select: shiftSelect,
        }),
        prisma.cashShift.count({ where: { cashRegisterId } }),
      ])
      .then(([items, total]) => ({ items, total }));
  }
}
