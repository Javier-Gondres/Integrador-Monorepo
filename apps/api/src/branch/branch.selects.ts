import type { Prisma } from '@repo/db';

export const branchSelect = {
  id: true,
  companyId: true,
  name: true,
  address: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type BranchRecord = Prisma.BranchGetPayload<{
  select: typeof branchSelect;
}>;
