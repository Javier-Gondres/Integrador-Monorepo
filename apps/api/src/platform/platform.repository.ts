import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import {
  PasswordResetTokenPurpose,
  prisma,
  RoleName,
  runWithDeleted,
} from '@repo/db';

import { ensureEmployeeForUserRole } from '../common/employees/employee-provisioning';
import type { PaginatedResult } from '../common/types/repository.types';
import { companyWithBranchesSelect } from '../company/company.selects';
import type { NormalizedQueryPlatformActivations } from './dto/query-platform-activations.dto';
import type { NormalizedQueryPlatformCompanies } from './dto/query-platform-companies.dto';
import type { NormalizedQueryPlatformUsers } from './dto/query-platform-users.dto';
import {
  type PlatformCompanyListRecord,
  platformCompanyListSelect,
} from './platform.selects';

export type PaginatedPlatformCompaniesResult =
  PaginatedResult<PlatformCompanyListRecord>;

export type PlatformUserListRecord = Prisma.UserGetPayload<{
  select: typeof platformUserListSelect;
}>;

export type PlatformUserDetailRecord = Prisma.UserGetPayload<{
  select: typeof platformUserDetailSelect;
}>;

export type PaginatedPlatformUsersResult =
  PaginatedResult<PlatformUserListRecord>;

const platformActivationSelect = {
  id: true,
  purpose: true,
  expiresAt: true,
  usedAt: true,
  revokedAt: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      emailVerifiedAt: true,
    },
  },
} as const;

export type PlatformActivationRecord = Prisma.PasswordResetTokenGetPayload<{
  select: typeof platformActivationSelect;
}>;

export type PaginatedPlatformActivationsResult =
  PaginatedResult<PlatformActivationRecord>;

type AuditTx = {
  auditLog: {
    create(args: Prisma.AuditLogCreateArgs): Promise<unknown>;
  };
};

export type CreatePlatformCompanyData = {
  name: string;
  slug: string;
  rnc: string | null;
  defaultBranchName: string;
  owner: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  };
};

export type CreatePlatformCompanyResult =
  | {
      status: 'ok';
      company: Prisma.CompanyGetPayload<{
        select: typeof companyWithBranchesSelect;
      }>;
    }
  | { status: 'duplicate_company' }
  | { status: 'duplicate_email' }
  | { status: 'role_not_found' };

export type CreatePlatformUserData = {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  actorId: string;
};

export type UpdatePlatformUserData = {
  firstName: string;
  lastName: string;
  actorId: string;
};

export type AssignPlatformUserCompanyData = {
  userId: string;
  companyId: string;
  roleName: RoleName;
  defaultBranchId?: string | null;
  actorId: string;
};

export type PlatformUserMutationData = {
  userId: string;
  actorId: string;
};

export type TransferCompanyOwnershipData = {
  companyId: string;
  newOwnerUserId: string;
  actorId: string;
};

export type UpdatePlatformUserRoleData = {
  userId: string;
  roleName: RoleName;
  actorId: string;
};

const platformUserMembershipSelect = {
  id: true,
  companyId: true,
  defaultBranchId: true,
  company: { select: { id: true, name: true, slug: true, isActive: true } },
  role: {
    select: {
      id: true,
      name: true,
      permissions: {
        select: { permission: { select: { code: true, description: true } } },
      },
    },
  },
} as const;

const platformUserListSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  isActive: true,
  isSuperAdmin: true,
  deletedAt: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  createdAt: true,
  memberships: {
    where: { deletedAt: null },
    select: platformUserMembershipSelect,
    take: 1,
  },
} as const;

const platformUserDetailSelect = {
  ...platformUserListSelect,
  updatedAt: true,
  passwordResetTokens: {
    where: { purpose: PasswordResetTokenPurpose.PLATFORM_ACTIVATION },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      purpose: true,
      expiresAt: true,
      usedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  },
  sentInvitations: {
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      email: true,
      status: true,
      createdAt: true,
      acceptedAt: true,
      revokedAt: true,
      expiresAt: true,
      company: { select: { id: true, name: true } },
      role: { select: { name: true } },
    },
  },
} as const;

const platformUserDeletedDetailSelect = {
  ...platformUserDetailSelect,
  memberships: {
    select: platformUserMembershipSelect,
    orderBy: { deletedAt: 'desc' as const },
    take: 1,
  },
} as const;

@Injectable()
export class PlatformRepository {
  async findOverview() {
    const [totalCompanies, activeCompanies] = await prisma.$transaction([
      prisma.company.count(),
      prisma.company.count({ where: { isActive: true } }),
    ]);

    return {
      totalCompanies,
      activeCompanies,
      inactiveCompanies: totalCompanies - activeCompanies,
    };
  }

  async findPaginated(
    query: NormalizedQueryPlatformCompanies,
  ): Promise<PaginatedPlatformCompaniesResult> {
    const where = this.buildListWhere(query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.company.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { name: 'asc' },
        select: platformCompanyListSelect,
      }),
      prisma.company.count({ where }),
    ]);

    return { items, total };
  }

  findById(id: string) {
    return prisma.company.findFirst({
      where: { id },
      select: companyWithBranchesSelect,
    });
  }

  async findUsersPaginated(
    query: NormalizedQueryPlatformUsers,
  ): Promise<PaginatedPlatformUsersResult> {
    const where = this.buildUsersWhere(query);
    const skip = (query.page - 1) * query.take;
    const run = () =>
      prisma.$transaction([
        prisma.user.findMany({
          where,
          skip,
          take: query.take,
          orderBy: { createdAt: 'desc' },
          select: platformUserListSelect,
        }),
        prisma.user.count({ where }),
      ]);

    const [items, total] =
      query.status === 'DELETED' ? await prisma.withDeleted(run) : await run();

    return { items, total };
  }

  async findPlatformUserById(
    id: string,
  ): Promise<PlatformUserDetailRecord | null> {
    const activeUser = await prisma.user.findFirst({
      where: { id },
      select: platformUserDetailSelect,
    });

    if (activeUser) {
      return activeUser;
    }

    return runWithDeleted(async () =>
      prisma.user.findFirst({
        where: { id, deletedAt: { not: null } },
        select: platformUserDeletedDetailSelect,
      }),
    );
  }

  async findActivationsPaginated(
    query: NormalizedQueryPlatformActivations,
  ): Promise<PaginatedPlatformActivationsResult> {
    const where = this.buildActivationsWhere(query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.passwordResetToken.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
        select: platformActivationSelect,
      }),
      prisma.passwordResetToken.count({ where }),
    ]);

    return { items, total };
  }

  findActivationById(id: string) {
    return prisma.passwordResetToken.findFirst({
      where: { id, purpose: PasswordResetTokenPurpose.PLATFORM_ACTIVATION },
      select: platformActivationSelect,
    });
  }

  cancelActivation(id: string, actorId: string) {
    return prisma.$transaction(async (tx) => {
      const activation = await tx.passwordResetToken.findFirst({
        where: {
          id,
          purpose: PasswordResetTokenPurpose.PLATFORM_ACTIVATION,
        },
        select: platformActivationSelect,
      });

      if (!activation) {
        return { status: 'not_found' as const };
      }
      if (activation.usedAt) {
        return { status: 'already_used' as const };
      }
      if (activation.revokedAt) {
        return { status: 'already_cancelled' as const };
      }

      const updated = await tx.passwordResetToken.update({
        where: { id },
        data: { revokedAt: new Date() },
        select: platformActivationSelect,
      });

      await this.createAuditLog(tx, {
        actorId,
        action: 'PLATFORM_ACTIVATION_CANCELLED',
        entity: 'PasswordResetToken',
        entityId: id,
        metadata: { userId: activation.user.id, email: activation.user.email },
      });

      return { status: 'ok' as const, activation: updated };
    });
  }

  async revokePendingActivationsForUser(userId: string) {
    return prisma.passwordResetToken.updateMany({
      where: {
        userId,
        purpose: PasswordResetTokenPurpose.PLATFORM_ACTIVATION,
        usedAt: null,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  auditActivationResent(params: {
    actorId: string;
    activationId: string;
    userId: string;
    email: string;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: params.actorId,
        action: 'PLATFORM_ACTIVATION_RESENT',
        entity: 'PasswordResetToken',
        entityId: params.activationId,
        metadata: { userId: params.userId, email: params.email },
      },
    });
  }

  findDuplicateBySlugOrRnc(slug: string, rnc: string | null) {
    return prisma.company.findFirst({
      where: {
        OR: [{ slug }, ...(rnc ? [{ rnc }] : [])],
      },
      select: { id: true },
    });
  }

  findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });
  }

  createPlatformUser(data: CreatePlatformUserData) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
        },
        select: platformUserListSelect,
      });

      await this.createAuditLog(tx, {
        actorId: data.actorId,
        action: 'PLATFORM_USER_CREATED',
        entityId: user.id,
        metadata: { email: user.email },
      });

      return user;
    });
  }

  updatePlatformUser(id: string, data: UpdatePlatformUserData) {
    return prisma.$transaction(async (tx) => {
      const previous = await tx.user.findUnique({
        where: { id },
        select: { firstName: true, lastName: true },
      });

      const user = await tx.user.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
        select: platformUserListSelect,
      });

      await this.createAuditLog(tx, {
        actorId: data.actorId,
        action: 'PLATFORM_USER_UPDATED',
        entityId: id,
        metadata: {
          previous,
          next: { firstName: data.firstName, lastName: data.lastName },
        },
      });

      return user;
    });
  }

  setUserActive(id: string, isActive: boolean, actorId: string) {
    return prisma.$transaction(async (tx) => {
      const previous = await tx.user.findUnique({
        where: { id },
        select: { isActive: true },
      });

      const user = isActive
        ? await tx.user.activate({
            where: { id },
            select: platformUserListSelect,
          })
        : await tx.user.deactivate({
            where: { id },
            select: platformUserListSelect,
          });

      await this.createAuditLog(tx, {
        actorId,
        action: isActive ? 'PLATFORM_USER_ACTIVATED' : 'PLATFORM_USER_BLOCKED',
        entityId: id,
        metadata: { previousStatus: previous?.isActive, nextStatus: isActive },
      });

      return user;
    });
  }

  forceLogoutUser(data: PlatformUserMutationData) {
    return prisma.$transaction(async (tx) => {
      const result = await tx.refreshToken.updateMany({
        where: { userId: data.userId, revoked: false },
        data: { revoked: true, revokedAt: new Date() },
      });

      await this.createAuditLog(tx, {
        actorId: data.actorId,
        action: 'PLATFORM_USER_FORCE_LOGOUT',
        entityId: data.userId,
        metadata: { revokedTokens: result.count },
      });

      return result;
    });
  }

  softDeleteUser(data: PlatformUserMutationData) {
    return prisma.$transaction(async (tx) => {
      await tx.userCompany.softDeleteMany({ where: { userId: data.userId } });
      await tx.employee.softDeleteMany({ where: { userId: data.userId } });
      const user = await tx.user.softDelete({
        where: { id: data.userId },
        select: platformUserListSelect,
      });

      await this.createAuditLog(tx, {
        actorId: data.actorId,
        action: 'PLATFORM_USER_SOFT_DELETED',
        entityId: data.userId,
      });

      return user;
    });
  }

  restoreUser(data: PlatformUserMutationData) {
    return prisma.withDeleted(() =>
      prisma.$transaction(async (tx) => {
        const user = await tx.user.restore({
          where: { id: data.userId },
          select: platformUserListSelect,
        });

        await this.createAuditLog(tx, {
          actorId: data.actorId,
          action: 'PLATFORM_USER_RESTORED',
          entityId: data.userId,
        });

        return user;
      }),
    );
  }

  removeUserMembership(data: PlatformUserMutationData) {
    return prisma.$transaction(async (tx) => {
      const membership = await tx.userCompany.findFirst({
        where: { userId: data.userId },
        select: {
          id: true,
          companyId: true,
          role: { select: { name: true } },
        },
      });

      if (!membership) {
        return { status: 'membership_not_found' as const };
      }

      await tx.userCompany.softDelete({ where: { id: membership.id } });
      await tx.employee.softDeleteMany({
        where: { userId: data.userId, companyId: membership.companyId },
      });

      await this.createAuditLog(tx, {
        actorId: data.actorId,
        action: 'PLATFORM_USER_REMOVED_FROM_COMPANY',
        entityId: data.userId,
        companyId: membership.companyId,
        metadata: { role: membership.role.name },
      });

      return { status: 'ok' as const };
    });
  }

  updateUserMembershipRole(data: UpdatePlatformUserRoleData) {
    return prisma.$transaction(async (tx) => {
      if (data.roleName === RoleName.OWNER) {
        return { status: 'owner_requires_transfer' as const };
      }

      const membership = await tx.userCompany.findFirst({
        where: { userId: data.userId },
        select: {
          id: true,
          companyId: true,
          role: { select: { name: true } },
        },
      });

      if (!membership) {
        return { status: 'membership_not_found' as const };
      }
      if (membership.role.name === RoleName.OWNER) {
        return { status: 'owner_requires_transfer' as const };
      }

      const role = await tx.role.findFirst({
        where: { name: data.roleName },
        select: { id: true },
      });
      if (!role) {
        return { status: 'role_not_found' as const };
      }

      await tx.userCompany.update({
        where: { id: membership.id },
        data: { roleId: role.id },
      });

      await ensureEmployeeForUserRole(tx, {
        userId: data.userId,
        companyId: membership.companyId,
        roleName: data.roleName,
      });

      await this.createAuditLog(tx, {
        actorId: data.actorId,
        action: 'PLATFORM_USER_ROLE_UPDATED',
        entityId: data.userId,
        companyId: membership.companyId,
        metadata: {
          previousRole: membership.role.name,
          nextRole: data.roleName,
        },
      });

      return { status: 'ok' as const };
    });
  }

  assignUserToCompany(data: AssignPlatformUserCompanyData) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: data.userId },
        select: { id: true, isSuperAdmin: true },
      });

      if (!user) {
        return { status: 'user_not_found' as const };
      }
      if (user.isSuperAdmin) {
        return { status: 'super_admin_cannot_join_tenant' as const };
      }

      const activeMembership = await tx.userCompany.findFirst({
        where: { userId: data.userId },
        select: { id: true },
      });

      if (activeMembership) {
        return { status: 'user_has_membership' as const };
      }

      const deletedMembership = await runWithDeleted(() =>
        tx.userCompany.findFirst({
          where: { userId: data.userId, deletedAt: { not: null } },
          orderBy: { updatedAt: 'desc' },
          select: { id: true },
        }),
      );

      const roles = await this.findOwnerAndAdminRoles(tx);
      if (!roles) {
        return { status: 'role_not_found' as const };
      }

      const role =
        data.roleName === RoleName.OWNER
          ? roles.ownerRole
          : await tx.role.findFirst({
              where: { name: data.roleName },
              select: { id: true },
            });
      if (!role) {
        return { status: 'role_not_found' as const };
      }

      const branch = data.defaultBranchId
        ? await tx.branch.findFirst({
            where: {
              id: data.defaultBranchId,
              companyId: data.companyId,
              isActive: true,
            },
            select: { id: true },
          })
        : await tx.branch.findFirst({
            where: { companyId: data.companyId, isActive: true },
            orderBy: { createdAt: 'asc' },
            select: { id: true },
          });

      if (!branch) {
        return { status: 'branch_not_found' as const };
      }

      const company = await tx.company.findFirst({
        where: { id: data.companyId, isActive: true },
        select: { id: true },
      });
      if (!company) {
        return { status: 'company_not_found' as const };
      }

      let previousOwnerId: string | null = null;
      if (data.roleName === RoleName.OWNER) {
        const currentOwner = await tx.userCompany.findFirst({
          where: { companyId: data.companyId, role: { name: RoleName.OWNER } },
          select: { id: true, userId: true },
        });

        if (!currentOwner) {
          return { status: 'owner_not_found' as const };
        }

        previousOwnerId = currentOwner.userId;
        await tx.userCompany.update({
          where: { id: currentOwner.id },
          data: { roleId: roles.adminRole.id },
        });
        await ensureEmployeeForUserRole(tx, {
          userId: currentOwner.userId,
          companyId: data.companyId,
          roleName: RoleName.ADMIN,
        });
      }

      if (deletedMembership) {
        await runWithDeleted(() =>
          tx.userCompany.update({
            where: { id: deletedMembership.id },
            data: {
              companyId: data.companyId,
              roleId: role.id,
              defaultBranchId: branch.id,
              deletedAt: null,
            },
          }),
        );
      } else {
        await tx.userCompany.create({
          data: {
            userId: data.userId,
            companyId: data.companyId,
            roleId: role.id,
            defaultBranchId: branch.id,
          },
        });
      }

      await ensureEmployeeForUserRole(tx, {
        userId: data.userId,
        companyId: data.companyId,
        branchId: branch.id,
        roleName: data.roleName,
      });

      await this.createAuditLog(tx, {
        actorId: data.actorId,
        action: 'PLATFORM_USER_ASSIGNED_TO_COMPANY',
        entityId: data.userId,
        companyId: data.companyId,
        metadata: { role: data.roleName, branchId: branch.id },
      });

      if (previousOwnerId) {
        await this.createAuditLog(tx, {
          actorId: data.actorId,
          action: 'PLATFORM_COMPANY_OWNERSHIP_TRANSFERRED',
          entityId: data.userId,
          companyId: data.companyId,
          metadata: {
            previousOwnerId,
            newOwnerId: data.userId,
            trigger: 'ASSIGN_USER_TO_COMPANY',
          },
        });
      }

      return { status: 'ok' as const };
    });
  }

  transferCompanyOwnership(data: TransferCompanyOwnershipData) {
    return prisma.$transaction(async (tx) => {
      const roles = await this.findOwnerAndAdminRoles(tx);
      if (!roles) {
        return { status: 'role_not_found' as const };
      }

      const currentOwner = await tx.userCompany.findFirst({
        where: { companyId: data.companyId, role: { name: RoleName.OWNER } },
        select: { id: true, userId: true },
      });

      if (!currentOwner) {
        return { status: 'owner_not_found' as const };
      }

      if (currentOwner.userId === data.newOwnerUserId) {
        return { status: 'ok' as const };
      }

      const newOwnerMembership = await tx.userCompany.findFirst({
        where: {
          companyId: data.companyId,
          userId: data.newOwnerUserId,
        },
        select: {
          id: true,
          user: { select: { isSuperAdmin: true } },
        },
      });

      if (!newOwnerMembership) {
        return { status: 'target_not_member' as const };
      }
      if (newOwnerMembership.user.isSuperAdmin) {
        return { status: 'super_admin_cannot_join_tenant' as const };
      }

      await tx.userCompany.update({
        where: { id: currentOwner.id },
        data: { roleId: roles.adminRole.id },
      });
      await ensureEmployeeForUserRole(tx, {
        userId: currentOwner.userId,
        companyId: data.companyId,
        roleName: RoleName.ADMIN,
      });
      await tx.userCompany.update({
        where: { id: newOwnerMembership.id },
        data: { roleId: roles.ownerRole.id },
      });

      await ensureEmployeeForUserRole(tx, {
        userId: data.newOwnerUserId,
        companyId: data.companyId,
        roleName: RoleName.OWNER,
      });

      await this.createAuditLog(tx, {
        actorId: data.actorId,
        action: 'PLATFORM_COMPANY_OWNERSHIP_TRANSFERRED',
        entity: 'UserCompany',
        entityId: newOwnerMembership.id,
        companyId: data.companyId,
        metadata: {
          previousOwnerId: currentOwner.userId,
          newOwnerId: data.newOwnerUserId,
          trigger: 'TRANSFER_OWNERSHIP',
        },
      });

      return { status: 'ok' as const };
    });
  }

  verifyUserEmail(id: string) {
    return prisma.user.update({
      where: { id },
      data: { emailVerifiedAt: new Date() },
      select: platformUserListSelect,
    });
  }

  createCompanyWithOwner(
    data: CreatePlatformCompanyData,
  ): Promise<CreatePlatformCompanyResult> {
    return prisma.$transaction(async (tx) => {
      const ownerRole = await tx.role.findFirst({
        where: { name: RoleName.OWNER },
        select: { id: true },
      });

      if (!ownerRole) {
        return { status: 'role_not_found' };
      }

      const user = await tx.user.create({
        data: {
          email: data.owner.email,
          passwordHash: data.owner.passwordHash,
          firstName: data.owner.firstName,
          lastName: data.owner.lastName,
        },
        select: { id: true },
      });

      const company = await tx.company.create({
        data: {
          name: data.name,
          slug: data.slug,
          rnc: data.rnc,
          branches: {
            create: {
              name: data.defaultBranchName,
            },
          },
        },
        select: companyWithBranchesSelect,
      });

      const defaultBranch = company.branches[0];
      if (!defaultBranch) {
        throw new Error('Default branch was not created');
      }

      await tx.userCompany.create({
        data: {
          userId: user.id,
          companyId: company.id,
          roleId: ownerRole.id,
          defaultBranchId: defaultBranch.id,
        },
      });

      await ensureEmployeeForUserRole(tx, {
        userId: user.id,
        companyId: company.id,
        branchId: defaultBranch.id,
        roleName: RoleName.OWNER,
      });

      return { status: 'ok', company };
    });
  }

  activate(id: string) {
    return prisma.company.activate({ where: { id } });
  }

  deactivate(id: string) {
    return prisma.company.deactivate({ where: { id } });
  }

  private async findOwnerAndAdminRoles(tx: {
    role: {
      findMany(
        args: Prisma.RoleFindManyArgs,
      ): Promise<Array<{ id: string; name: RoleName }>>;
    };
  }) {
    const roles = await tx.role.findMany({
      where: { name: { in: [RoleName.OWNER, RoleName.ADMIN] } },
      select: { id: true, name: true },
    });
    const ownerRole = roles.find((role) => role.name === RoleName.OWNER);
    const adminRole = roles.find((role) => role.name === RoleName.ADMIN);
    return ownerRole && adminRole ? { ownerRole, adminRole } : null;
  }

  findActiveMembershipForUser(userId: string) {
    return prisma.userCompany.findFirst({
      where: { userId },
      select: {
        id: true,
        companyId: true,
        role: { select: { name: true } },
      },
    });
  }

  private createAuditLog(
    tx: AuditTx,
    data: {
      actorId: string;
      action: string;
      entity?: string;
      entityId: string;
      companyId?: string | null;
      metadata?: Prisma.InputJsonValue;
    },
  ) {
    return tx.auditLog.create({
      data: {
        companyId: data.companyId ?? null,
        userId: data.actorId,
        action: data.action,
        entity: data.entity ?? 'User',
        entityId: data.entityId,
        metadata: data.metadata,
      },
    });
  }

  private buildListWhere(
    query: NormalizedQueryPlatformCompanies,
  ): Prisma.CompanyWhereInput {
    const { search, isActive } = query;

    return {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          ...(search.trim()
            ? [
                {
                  rnc: {
                    contains: search.trim(),
                    mode: 'insensitive' as const,
                  },
                },
              ]
            : []),
        ],
      }),
    };
  }

  private buildUsersWhere(
    query: NormalizedQueryPlatformUsers,
  ): Prisma.UserWhereInput {
    const {
      search,
      isActive,
      status,
      type,
      companyId,
      membership,
      createdFrom,
      createdTo,
    } = query;

    const deletedAt =
      status === 'DELETED'
        ? { not: null }
        : status === 'ACTIVE' || status === 'BLOCKED'
          ? null
          : undefined;

    const effectiveIsActive =
      status === 'ACTIVE'
        ? true
        : status === 'BLOCKED'
          ? false
          : status === 'DELETED'
            ? undefined
            : isActive;

    const membershipWhere = companyId ? { companyId } : {};
    const membershipFilter =
      companyId || membership === 'WITH_COMPANY'
        ? { some: membershipWhere }
        : membership === 'WITHOUT_COMPANY'
          ? { none: {} }
          : undefined;

    return {
      ...(deletedAt !== undefined && { deletedAt }),
      ...(effectiveIsActive !== undefined && { isActive: effectiveIsActive }),
      ...(type && { isSuperAdmin: type === 'SUPER_ADMIN' }),
      ...((createdFrom || createdTo) && {
        createdAt: {
          ...(createdFrom && { gte: createdFrom }),
          ...(createdTo && { lte: createdTo }),
        },
      }),
      ...(membershipFilter && { memberships: membershipFilter }),
      ...(search && {
        OR: [
          { id: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
  }

  private buildActivationsWhere(
    query: NormalizedQueryPlatformActivations,
  ): Prisma.PasswordResetTokenWhereInput {
    const now = new Date();
    const statusWhere =
      query.status === 'PENDING'
        ? { usedAt: null, revokedAt: null, expiresAt: { gt: now } }
        : query.status === 'ACTIVATED'
          ? { usedAt: { not: null } }
          : query.status === 'EXPIRED'
            ? { usedAt: null, revokedAt: null, expiresAt: { lte: now } }
            : query.status === 'CANCELLED'
              ? { revokedAt: { not: null } }
              : {};

    return {
      purpose: PasswordResetTokenPurpose.PLATFORM_ACTIVATION,
      ...statusWhere,
      ...(query.search && {
        OR: [
          { id: { contains: query.search, mode: 'insensitive' } },
          { user: { id: { contains: query.search, mode: 'insensitive' } } },
          {
            user: {
              email: { contains: query.search, mode: 'insensitive' },
            },
          },
          {
            user: {
              firstName: { contains: query.search, mode: 'insensitive' },
            },
          },
          {
            user: {
              lastName: { contains: query.search, mode: 'insensitive' },
            },
          },
        ],
      }),
    };
  }
}
