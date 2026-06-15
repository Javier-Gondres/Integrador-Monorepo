import type { Prisma } from '@repo/db';

export const transferSelect = {
  id: true,
  fromBranchId: true,
  toBranchId: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  fromBranch: {
    select: {
      name: true,
      address: true,
    },
  },
  toBranch: {
    select: {
      name: true,
      address: true,
    },
  },
  items: {
    select: {
      id: true,
      quantity: true,
      product: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  },
} as const;

export type TransferRecord = Prisma.TransferGetPayload<{
  select: typeof transferSelect;
}>;
