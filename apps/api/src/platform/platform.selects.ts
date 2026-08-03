import type { Prisma } from '@repo/db';
import { RoleName } from '@repo/db';

import { companySelect } from '../company/company.selects';

export const platformOwnerSelect = {
  email: true,
  firstName: true,
  lastName: true,
} satisfies Prisma.UserSelect;

export const platformCompanyListSelect = {
  ...companySelect,
  users: {
    where: {
      role: { name: RoleName.OWNER },
    },
    take: 1,
    select: {
      user: {
        select: platformOwnerSelect,
      },
    },
  },
} satisfies Prisma.CompanySelect;

export type PlatformCompanyListRecord = Prisma.CompanyGetPayload<{
  select: typeof platformCompanyListSelect;
}>;
