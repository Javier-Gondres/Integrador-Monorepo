import { Injectable } from '@nestjs/common';
import type { Prisma, RoleName } from '@repo/db';
import { prisma, RoleName as DbRoleName, runWithDeleted } from '@repo/db';

import { ensureEmployeeForUserRole } from '../common/employees/employee-provisioning';
import type { PaginatedResult } from '../common/types/repository.types';
import type { NormalizedQueryUsers } from './dto/query-users.dto';
import {
  membershipRelationSelectFull,
  publicUserSelect,
  type PublicUserWithMembership,
  withMembership,
} from './users.selects';

const activeMembershipWhere = (
  companyId: string,
  extra?: Prisma.UserCompanyWhereInput,
): Prisma.UserCompanyWhereInput => ({
  companyId,
  deletedAt: null,
  ...extra,
});

export type { PublicUserWithMembership } from './users.selects';

export type PaginatedUsersResult = PaginatedResult<PublicUserWithMembership>;

export type CreateUserData = {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
};

export type CreateUserWithMembershipData = CreateUserData & {
  companyId: string;
  roleName: RoleName;
};

export type CreateUserPersistenceResult =
  | { status: 'ok'; user: PublicUserWithMembership }
  | { status: 'role_not_found' };

export type UpdateUserFields = {
  firstName?: string;
  lastName?: string;
};

export type UpdateUserPersistenceResult =
  | { status: 'ok' }
  | { status: 'role_not_found' }
  | { status: 'membership_not_found' }
  | { status: 'owner_requires_transfer' };

export type SoftDeletedUserPayload = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

export type SoftDeleteUserPersistenceResult =
  | { status: 'ok'; user: SoftDeletedUserPayload }
  | { status: 'membership_not_found' }
  | { status: 'owner_requires_transfer' };

export type RemoveMembershipPersistenceResult =
  | { status: 'ok'; user: SoftDeletedUserPayload }
  | { status: 'membership_not_found' }
  | { status: 'owner_requires_transfer' };

export type RestoreUserPersistenceResult =
  | { status: 'ok'; user: SoftDeletedUserPayload }
  | { status: 'membership_not_found' };

export type TransferOwnershipPersistenceResult =
  | { status: 'ok' }
  | { status: 'owner_not_found' }
  | { status: 'target_not_member' }
  | { status: 'role_not_found' };

export type RoleListItem = {
  id: string;
  name: RoleName;
  description: string | null;
};

@Injectable()
export class UsersRepository {
  async findManyByCompany(
    companyId: string,
    query: NormalizedQueryUsers,
  ): Promise<PaginatedUsersResult> {
    const where = this.buildListWhere(companyId, query);
    const skip = (query.page - 1) * query.take;

    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
        select: {
          ...publicUserSelect,
          memberships: {
            where: activeMembershipWhere(companyId),
            select: membershipRelationSelectFull,
            take: 1,
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: rows.map((row) => withMembership(row) as PublicUserWithMembership),
      total,
    };
  }

  async findPublicByIdInCompany(
    id: string,
    companyId: string,
  ): Promise<PublicUserWithMembership | null> {
    const user = await prisma.user.findFirst({
      where: {
        id,
        memberships: { some: activeMembershipWhere(companyId) },
      },
      select: {
        ...publicUserSelect,
        memberships: {
          where: activeMembershipWhere(companyId),
          select: membershipRelationSelectFull,
          take: 1,
        },
      },
    });
    return user ? (withMembership(user) as PublicUserWithMembership) : null;
  }

  findAllRoles(): Promise<RoleListItem[]> {
    return prisma.role.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { name: 'asc' },
    });
  }

  findRoleById(id: string): Promise<RoleListItem | null> {
    return prisma.role.findUnique({
      where: { id },
      select: { id: true, name: true, description: true },
    });
  }

  findPasswordHashById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true, isActive: true },
    });
  }

  updatePasswordHash(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: { id: true },
    });
  }

  async isUserSoftDeletedInCompany(
    userId: string,
    companyId: string,
  ): Promise<boolean> {
    return runWithDeleted(async () => {
      const row = await prisma.user.findFirst({
        where: {
          id: userId,
          deletedAt: { not: null },
          memberships: {
            some: { companyId, deletedAt: { not: null } },
          },
        },
        select: { id: true },
      });
      return row !== null;
    });
  }

  async findSoftDeletedUserInCompany(
    userId: string,
    companyId: string,
  ): Promise<PublicUserWithMembership | null> {
    return runWithDeleted(async () => {
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          deletedAt: { not: null },
          memberships: {
            some: { companyId, deletedAt: { not: null } },
          },
        },
        select: {
          ...publicUserSelect,
          memberships: {
            where: activeMembershipWhere(companyId),
            select: membershipRelationSelectFull,
            take: 1,
          },
        },
      });
      return user ? (withMembership(user) as PublicUserWithMembership) : null;
    });
  }

  async createWithMembership(
    data: CreateUserWithMembershipData,
  ): Promise<CreateUserPersistenceResult> {
    return prisma.$transaction(async (tx) => {
      const roleRecord = await tx.role.findFirst({
        where: { name: data.roleName },
        select: { id: true },
      });
      if (!roleRecord) {
        return { status: 'role_not_found' };
      }

      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
        },
        select: publicUserSelect,
      });

      await tx.userCompany.create({
        data: {
          userId: user.id,
          companyId: data.companyId,
          roleId: roleRecord.id,
        },
      });

      await ensureEmployeeForUserRole(tx, {
        userId: user.id,
        companyId: data.companyId,
        roleName: data.roleName,
      });

      const row = await tx.user.findUnique({
        where: { id: user.id },
        select: {
          ...publicUserSelect,
          memberships: {
            where: activeMembershipWhere(data.companyId),
            select: membershipRelationSelectFull,
            take: 1,
          },
        },
      });

      return {
        status: 'ok',
        user: withMembership(row!) as PublicUserWithMembership,
      };
    });
  }

  activateUser(userId: string) {
    return prisma.user.activate({
      where: { id: userId },
      select: publicUserSelect,
    });
  }

  deactivateUser(userId: string) {
    return prisma.user.deactivate({
      where: { id: userId },
      select: publicUserSelect,
    });
  }

  async restoreInCompany(
    userId: string,
    companyId: string,
  ): Promise<RestoreUserPersistenceResult> {
    return prisma.withDeleted(() =>
      prisma.$transaction(async (tx) => {
        const membershipRestore = await tx.userCompany.restoreMany({
          where: { userId, companyId },
        });

        if (membershipRestore.count === 0) {
          return { status: 'membership_not_found' as const };
        }

        const user = await tx.user.restore({
          where: { id: userId },
          select: publicUserSelect,
        });

        return { status: 'ok' as const, user };
      }),
    );
  }

  async softDeleteInCompany(
    userId: string,
    companyId: string,
  ): Promise<SoftDeleteUserPersistenceResult> {
    return prisma.$transaction(async (tx) => {
      const membership = await tx.userCompany.findFirst({
        where: { userId, companyId },
        select: { id: true, role: { select: { name: true } } },
      });

      if (!membership) {
        return { status: 'membership_not_found' as const };
      }
      if (membership.role.name === DbRoleName.OWNER) {
        return { status: 'owner_requires_transfer' as const };
      }

      await tx.userCompany.softDelete({ where: { id: membership.id } });

      const user = await tx.user.softDelete({
        where: { id: userId },
        select: publicUserSelect,
      });

      return { status: 'ok' as const, user };
    });
  }

  async removeMembershipInCompany(
    userId: string,
    companyId: string,
  ): Promise<RemoveMembershipPersistenceResult> {
    return prisma.$transaction(async (tx) => {
      const membership = await tx.userCompany.findFirst({
        where: { userId, companyId },
        select: { id: true, role: { select: { name: true } } },
      });

      if (!membership) {
        return { status: 'membership_not_found' as const };
      }
      if (membership.role.name === DbRoleName.OWNER) {
        return { status: 'owner_requires_transfer' as const };
      }

      await tx.userCompany.softDelete({ where: { id: membership.id } });
      await tx.employee.softDeleteMany({
        where: { userId, companyId },
      });

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: publicUserSelect,
      });

      if (!user) {
        return { status: 'membership_not_found' as const };
      }

      return { status: 'ok' as const, user };
    });
  }

  async applyUserUpdate(
    userId: string,
    companyId: string,
    userData: UpdateUserFields,
    roleName?: RoleName,
  ): Promise<UpdateUserPersistenceResult> {
    const hasUserFields = Object.keys(userData).length > 0;
    const hasRole = roleName !== undefined;

    if (!hasUserFields && !hasRole) {
      return { status: 'ok' };
    }

    return prisma.$transaction(async (tx) => {
      if (hasUserFields) {
        await tx.user.update({ where: { id: userId }, data: userData });
      }

      if (hasRole) {
        if (roleName === DbRoleName.OWNER) {
          return { status: 'owner_requires_transfer' };
        }

        const membership = await tx.userCompany.findFirst({
          where: { userId, companyId },
          select: {
            id: true,
            role: { select: { name: true } },
          },
        });

        if (!membership) {
          return { status: 'membership_not_found' };
        }
        if (membership.role.name === DbRoleName.OWNER) {
          return { status: 'owner_requires_transfer' };
        }

        const roleRecord = await tx.role.findFirst({
          where: { name: roleName },
          select: { id: true },
        });
        if (!roleRecord) {
          return { status: 'role_not_found' };
        }

        await tx.userCompany.update({
          where: { id: membership.id },
          data: { roleId: roleRecord.id },
        });

        await ensureEmployeeForUserRole(tx, {
          userId,
          companyId,
          roleName,
        });
      }

      return { status: 'ok' };
    });
  }

  transferOwnershipInCompany(
    companyId: string,
    newOwnerUserId: string,
    actorUserId: string,
  ): Promise<TransferOwnershipPersistenceResult> {
    return prisma.$transaction(async (tx) => {
      const roles = await tx.role.findMany({
        where: { name: { in: [DbRoleName.OWNER, DbRoleName.ADMIN] } },
        select: { id: true, name: true },
      });
      const ownerRole = roles.find((role) => role.name === DbRoleName.OWNER);
      const adminRole = roles.find((role) => role.name === DbRoleName.ADMIN);
      if (!ownerRole || !adminRole) {
        return { status: 'role_not_found' };
      }

      const currentOwner = await tx.userCompany.findFirst({
        where: { companyId, role: { name: DbRoleName.OWNER } },
        select: { id: true, userId: true },
      });
      if (!currentOwner) {
        return { status: 'owner_not_found' };
      }

      if (currentOwner.userId === newOwnerUserId) {
        return { status: 'ok' };
      }

      const newOwnerMembership = await tx.userCompany.findFirst({
        where: { companyId, userId: newOwnerUserId },
        select: { id: true },
      });
      if (!newOwnerMembership) {
        return { status: 'target_not_member' };
      }

      await tx.userCompany.update({
        where: { id: currentOwner.id },
        data: { roleId: adminRole.id },
      });
      await ensureEmployeeForUserRole(tx, {
        userId: currentOwner.userId,
        companyId,
        roleName: DbRoleName.ADMIN,
      });

      await tx.userCompany.update({
        where: { id: newOwnerMembership.id },
        data: { roleId: ownerRole.id },
      });
      await ensureEmployeeForUserRole(tx, {
        userId: newOwnerUserId,
        companyId,
        roleName: DbRoleName.OWNER,
      });

      await tx.auditLog.create({
        data: {
          companyId,
          userId: actorUserId,
          action: 'TENANT_COMPANY_OWNERSHIP_TRANSFERRED',
          entity: 'UserCompany',
          entityId: newOwnerMembership.id,
          metadata: {
            previousOwnerId: currentOwner.userId,
            newOwnerId: newOwnerUserId,
          },
        },
      });

      return { status: 'ok' };
    });
  }

  private buildListWhere(
    companyId: string,
    query: NormalizedQueryUsers,
  ): Prisma.UserWhereInput {
    const { search, role, isActive } = query;

    return {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      memberships: {
        some: activeMembershipWhere(
          companyId,
          role ? { role: { name: role } } : undefined,
        ),
      },
    };
  }
}
