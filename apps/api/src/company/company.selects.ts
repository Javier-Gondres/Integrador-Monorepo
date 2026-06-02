import type { Prisma } from '@repo/db';

export const companySelect = {
  id: true,
  name: true,
  slug: true,
  rnc: true,
  email: true,
  phone: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const companyWithBranchesSelect = {
  ...companySelect,
  branches: {
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      address: true,
      isActive: true,
    },
    orderBy: { name: 'asc' as const },
  },
} as const;

export type CompanyRecord = Prisma.CompanyGetPayload<{
  select: typeof companySelect;
}>;

export type CompanyWithBranchesRecord = Prisma.CompanyGetPayload<{
  select: typeof companyWithBranchesSelect;
}>;
