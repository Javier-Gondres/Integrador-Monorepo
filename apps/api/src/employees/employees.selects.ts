import type { Prisma } from '@repo/db';

export const employeeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  isActive: true,
  memberships: {
    select: {
      companyId: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

export const employeeSelect = {
  id: true,
  companyId: true,
  userId: true,
  branchId: true,
  phone: true,
  position: true,
  salary: true,
  hireDate: true,
  terminationDate: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  branch: {
    select: {
      id: true,
      name: true,
      companyId: true,
    },
  },
  user: {
    select: employeeUserSelect,
  },
} satisfies Prisma.EmployeeSelect;

export type EmployeeRecord = Prisma.EmployeeGetPayload<{
  select: typeof employeeSelect;
}>;
