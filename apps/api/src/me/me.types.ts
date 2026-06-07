import type { Company, RoleName, UserCompany } from '@repo/db';

export type MyCompanyMembership = Pick<
  UserCompany & Company,
  'id' | 'name' | 'slug' | 'isActive' | 'defaultBranchId'
> & {
  role: RoleName;
};
