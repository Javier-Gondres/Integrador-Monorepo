import type { Prisma } from '@repo/db';

export const customerSelect = {
  id: true,
  companyId: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  address: true,
  cedula: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type CustomerRecord = Prisma.CustomerGetPayload<{
  select: typeof customerSelect;
}>;
