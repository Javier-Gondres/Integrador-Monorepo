import { Injectable } from '@nestjs/common';
import type { Prisma, RoleName } from '@repo/db';
import { prisma } from '@repo/db';

import type { NormalizedQueryUsers } from './dto/query-users.dto';
import {
  membershipRelationSelect,
  membershipRelationSelectFull,
  publicUserSelect,
  type PublicUserWithMembership,
  type UserWithPasswordHash,
  withMembership,
} from './users.selects';

export type { PublicUserWithMembership, UserWithPasswordHash } from './users.selects';

export type PaginatedUsersResult = {
  items: PublicUserWithMembership[];
  total: number;
};

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
  isActive?: boolean;
};

export type UpdateUserPersistenceResult =
  | { status: 'ok' }
  | { status: 'role_not_found' }
  | { status: 'membership_not_found' };

@Injectable()
export class UsersRepository {
  async findAuthContextRow(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isActive: true,
        memberships: {
          select: membershipRelationSelect,
          take: 1,
        },
      },
    });
  }

  async findManyByCompany(
    companyId: string,
    query: NormalizedQueryUsers,
  ): Promise<PaginatedUsersResult> {
    const where = this.buildListWhere(companyId, query);
    const skip = (query.page - 1) * query.limit;

    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          ...publicUserSelect,
          memberships: {
            where: { companyId },
            select: membershipRelationSelectFull,
            take: 1,
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: rows.map(
        (row) => withMembership(row) as PublicUserWithMembership,
      ),
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
        memberships: { some: { companyId } },
      },
      select: {
        ...publicUserSelect,
        memberships: {
          where: { companyId },
          select: membershipRelationSelectFull,
          take: 1,
        },
      },
    });
    return user ? (withMembership(user) as PublicUserWithMembership) : null;
  }

  async findByEmail(email: string): Promise<UserWithPasswordHash | null> {
    const user = await prisma.user.findFirst({
      where: { email: this.normalizeEmail(email) },
      select: {
        ...publicUserSelect,
        passwordHash: true,
        memberships: { select: membershipRelationSelectFull, take: 1 },
      },
    });
    return user ? (withMembership(user) as UserWithPasswordHash) : null;
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

      const row = await tx.user.findUnique({
        where: { id: user.id },
        select: {
          ...publicUserSelect,
          memberships: {
            where: { companyId: data.companyId },
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

  updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
      select: publicUserSelect,
    });
  }

  async applyUserUpdate(
    userId: string,
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
        const roleRecord = await tx.role.findFirst({
          where: { name: roleName },
          select: { id: true },
        });
        if (!roleRecord) {
          return { status: 'role_not_found' };
        }

        const { count } = await tx.userCompany.updateMany({
          where: { userId },
          data: { roleId: roleRecord.id },
        });

        if (count === 0) {
          return { status: 'membership_not_found' };
        }
      }

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
        some: {
          companyId,
          ...(role && { role: { name: role } }),
        },
      },
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
