import { Prisma } from '@repo/db';

export const payableListSelect = {
  id: true,
  originalAmount: true,
  balance: true,
  dueDate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  supplier: {
    select: {
      id: true,
      name: true,
    },
  },
  purchase: {
    select: {
      id: true,
      invoiceNumber: true,
    },
  },
} satisfies Prisma.AccountPayableSelect;

export type PayableListRecord = Prisma.AccountPayableGetPayload<{
  select: typeof payableListSelect;
}>;

export const payableDetailSelect = {
  ...payableListSelect,
  branch: {
    select: {
      id: true,
      name: true,
    },
  },
  purchase: {
    select: {
      id: true,
      invoiceNumber: true,
      invoiceDate: true,
      total: true,
      items: {
        select: {
          id: true,
          quantity: true,
          unitCost: true,
          subtotal: true,
          product: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
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
  },
} satisfies Prisma.AccountPayableSelect;

export type PayableDetailRecord = Prisma.AccountPayableGetPayload<{
  select: typeof payableDetailSelect;
}>;
