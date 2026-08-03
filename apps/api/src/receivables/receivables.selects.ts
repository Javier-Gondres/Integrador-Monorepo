import type { Prisma } from '@repo/db';

export const receivableCustomerSelect = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
  email: true,
} as const satisfies Prisma.CustomerSelect;

export const receivableListSelect = {
  id: true,
  originalAmount: true,
  balance: true,
  dueDate: true,
  status: true,
  createdAt: true,
  sale: {
    select: {
      id: true,
      ncf: true,
      createdAt: true,
      total: true,
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const satisfies Prisma.AccountReceivableSelect;

export const receivableDetailSelect = {
  id: true,
  originalAmount: true,
  balance: true,
  dueDate: true,
  status: true,
  createdAt: true,
  sale: {
    select: {
      id: true,
      ncf: true,
      createdAt: true,
      total: true,
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  payments: {
    select: {
      id: true,
      amount: true,
      method: true,
      notes: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
} as const satisfies Prisma.AccountReceivableSelect;

export type ReceivableCustomerRecord = Prisma.CustomerGetPayload<{
  select: typeof receivableCustomerSelect;
}>;

export type ReceivableListRecord = Prisma.AccountReceivableGetPayload<{
  select: typeof receivableListSelect;
}>;

export type ReceivableDetailRecord = Prisma.AccountReceivableGetPayload<{
  select: typeof receivableDetailSelect;
}>;
