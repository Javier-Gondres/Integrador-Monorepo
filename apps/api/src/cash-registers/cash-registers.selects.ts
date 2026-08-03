import { Prisma } from '@repo/db';

export const cashRegisterSelect = {
  id: true,
  name: true,
  isActive: true,
  branchId: true,
  shifts: {
    where: {
      closedAt: null,
    },
    take: 1,
    orderBy: {
      openedAt: 'desc',
    },
    select: {
      id: true,
      openingAmount: true,
      closingAmount: true,
      openedAt: true,
      closedAt: true,
      cashierId: true,
      cashier: {
        select: {
          id: true,
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
          id: true,
          total: true,
          payments: {
            select: {
              method: true,
              amount: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CashRegisterSelect;

export type CashRegisterRecord = Prisma.CashRegisterGetPayload<{
  select: typeof cashRegisterSelect;
}>;
