import type { RoleName } from '@repo/db';

export const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export const membershipRelationSelect = {
  companyId: true,
  defaultBranchId: true,
  role: { select: { name: true } },
} as const;

export const membershipRelationSelectFull = {
  id: true,
  companyId: true,
  roleId: true,
  defaultBranchId: true,
  role: { select: { id: true, name: true } },
  company: { select: { id: true, name: true, slug: true } },
} as const;

export type UserMembership = {
  id: string;
  companyId: string;
  roleId: string;
  defaultBranchId: string | null;
  role: { id: string; name: RoleName };
  company: { id: string; name: string; slug: string };
};

type UserWithMembershipsRow = {
  memberships: UserMembership[];
};

export function withMembership<T extends UserWithMembershipsRow>(
  user: T,
): Omit<T, 'memberships'> & { membership: UserMembership | null } {
  const { memberships, ...rest } = user;
  return { ...rest, membership: memberships[0] ?? null };
}
