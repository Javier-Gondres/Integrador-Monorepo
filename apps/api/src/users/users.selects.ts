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
  role: {
    select: {
      name: true,
      permissions: {
        select: { permission: { select: { code: true } } },
      },
    },
  },
} as const;

export const membershipRelationSelectFull = {
  id: true,
  companyId: true,
  roleId: true,
  defaultBranchId: true,
  role: {
    select: {
      id: true,
      name: true,
      permissions: {
        select: { permission: { select: { code: true } } },
      },
    },
  },
  company: { select: { id: true, name: true, slug: true } },
} as const;

export type UserMembership = {
  id: string;
  companyId: string;
  roleId: string;
  defaultBranchId: string | null;
  role: {
    id: string;
    name: RoleName;
    permissions?: { permission: { code: string } }[];
  };
  company: { id: string; name: string; slug: string };
};

export type PublicUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

export type PublicUserWithMembership = PublicUser & {
  membership: UserMembership | null;
};

export type UserWithPasswordHash = PublicUserWithMembership & {
  passwordHash: string;
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
