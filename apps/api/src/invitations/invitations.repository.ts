import { Injectable } from '@nestjs/common';
import { InvitationStatus, type Prisma, prisma, RoleName } from '@repo/db';

import { ensureEmployeeForUserRole } from '../common/employees/employee-provisioning';

const invitationSelect = {
  id: true,
  email: true,
  expiresAt: true,
  acceptedAt: true,
  revokedAt: true,
  status: true,
  createdAt: true,
  company: { select: { id: true, name: true, isActive: true } },
  role: { select: { id: true, name: true } },
  invitedBy: {
    select: { id: true, email: true, firstName: true, lastName: true },
  },
} as const;

const invitationWithTokenSelect = {
  ...invitationSelect,
  tokenHash: true,
} as const;

export type InvitationRecord = Prisma.InvitationGetPayload<{
  select: typeof invitationSelect;
}>;

export type InvitationWithTokenRecord = Prisma.InvitationGetPayload<{
  select: typeof invitationWithTokenSelect;
}>;

export type CreateInvitationData = {
  companyId: string;
  email: string;
  roleName: RoleName;
  invitedById: string;
  tokenHash: string;
  expiresAt: Date;
};

export type AcceptInvitationForExistingUserData = {
  invitationId: string;
  userId: string;
  companyId: string;
  roleId: string;
  roleName: RoleName;
  defaultBranchId: string | null;
};

export type RegisterFromInvitationData = {
  invitationId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  companyId: string;
  roleId: string;
  roleName: RoleName;
  defaultBranchId: string | null;
};

export type PlatformInvitationsQuery = {
  page: number;
  take: number;
  search?: string;
  companyId?: string;
  status?: InvitationStatus;
};

export type PaginatedPlatformInvitationsResult = {
  items: InvitationRecord[];
  total: number;
};

@Injectable()
export class InvitationsRepository {
  findManyByCompany(companyId: string): Promise<InvitationRecord[]> {
    return prisma.invitation.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      select: invitationSelect,
    });
  }

  async findManyForPlatform(
    query: PlatformInvitationsQuery,
  ): Promise<PaginatedPlatformInvitationsResult> {
    const where = this.buildPlatformWhere(query);
    const skip = (query.page - 1) * query.take;

    const [items, total] = await prisma.$transaction([
      prisma.invitation.findMany({
        where,
        skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
        select: invitationSelect,
      }),
      prisma.invitation.count({ where }),
    ]);

    return { items, total };
  }

  findByIdForPlatform(id: string) {
    return prisma.invitation.findFirst({
      where: { id },
      select: invitationWithTokenSelect,
    });
  }

  findByIdInCompany(id: string, companyId: string) {
    return prisma.invitation.findFirst({
      where: { id, companyId },
      select: invitationWithTokenSelect,
    });
  }

  findByTokenHash(tokenHash: string) {
    return prisma.invitation.findUnique({
      where: { tokenHash },
      select: invitationWithTokenSelect,
    });
  }

  findPendingByCompanyAndEmail(companyId: string, email: string) {
    return prisma.invitation.findFirst({
      where: { companyId, email, status: InvitationStatus.PENDING },
      select: invitationWithTokenSelect,
    });
  }

  findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        isActive: true,
        memberships: {
          where: { deletedAt: null },
          select: { id: true, companyId: true },
          take: 1,
        },
      },
    });
  }

  findActiveMembership(userId: string) {
    return prisma.userCompany.findFirst({
      where: { userId },
      select: { id: true, companyId: true },
    });
  }

  async create(data: CreateInvitationData): Promise<InvitationRecord | null> {
    const role = await prisma.role.findFirst({
      where: { name: data.roleName },
      select: { id: true },
    });

    if (!role) {
      return null;
    }

    return prisma.invitation.create({
      data: {
        companyId: data.companyId,
        email: data.email,
        roleId: role.id,
        invitedById: data.invitedById,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
      select: invitationSelect,
    });
  }

  markExpired(id: string) {
    return prisma.invitation.update({
      where: { id },
      data: { status: InvitationStatus.EXPIRED },
      select: invitationSelect,
    });
  }

  revoke(id: string) {
    return prisma.invitation.update({
      where: { id },
      data: {
        status: InvitationStatus.REVOKED,
        revokedAt: new Date(),
      },
      select: invitationSelect,
    });
  }

  resend(id: string, tokenHash: string, expiresAt: Date) {
    return prisma.invitation.update({
      where: { id },
      data: {
        tokenHash,
        expiresAt,
        status: InvitationStatus.PENDING,
        revokedAt: null,
      },
      select: invitationSelect,
    });
  }

  acceptForExistingUser(data: AcceptInvitationForExistingUserData) {
    return prisma.$transaction(async (tx) => {
      const membership = await tx.userCompany.findFirst({
        where: { userId: data.userId, deletedAt: null },
        select: { id: true },
      });

      if (membership) {
        return { status: 'user_has_membership' as const };
      }

      await tx.userCompany.create({
        data: {
          userId: data.userId,
          companyId: data.companyId,
          roleId: data.roleId,
          defaultBranchId: data.defaultBranchId,
        },
      });

      await ensureEmployeeForUserRole(tx, {
        userId: data.userId,
        companyId: data.companyId,
        branchId: data.defaultBranchId,
        roleName: data.roleName,
      });

      const invitation = await tx.invitation.update({
        where: { id: data.invitationId },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
        select: invitationSelect,
      });

      return { status: 'ok' as const, invitation };
    });
  }

  registerFromInvitation(data: RegisterFromInvitationData) {
    return prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: { email: data.email },
        select: { id: true },
      });

      if (existingUser) {
        return { status: 'user_exists' as const };
      }

      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          emailVerifiedAt: new Date(),
        },
        select: { id: true },
      });

      await tx.userCompany.create({
        data: {
          userId: user.id,
          companyId: data.companyId,
          roleId: data.roleId,
          defaultBranchId: data.defaultBranchId,
        },
      });

      await ensureEmployeeForUserRole(tx, {
        userId: user.id,
        companyId: data.companyId,
        branchId: data.defaultBranchId,
        roleName: data.roleName,
      });

      const invitation = await tx.invitation.update({
        where: { id: data.invitationId },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
        select: invitationSelect,
      });

      return { status: 'ok' as const, userId: user.id, invitation };
    });
  }

  findDefaultBranch(companyId: string) {
    return prisma.branch.findFirst({
      where: { companyId, isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
  }

  auditPlatformAction(data: {
    actorId: string;
    invitationId: string;
    companyId: string;
    action: 'PLATFORM_INVITATION_RESENT' | 'PLATFORM_INVITATION_REVOKED';
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.auditLog.create({
      data: {
        companyId: data.companyId,
        userId: data.actorId,
        action: data.action,
        entity: 'Invitation',
        entityId: data.invitationId,
        metadata: data.metadata,
      },
    });
  }

  private buildPlatformWhere(
    query: PlatformInvitationsQuery,
  ): Prisma.InvitationWhereInput {
    return {
      ...(query.companyId && { companyId: query.companyId }),
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { email: { contains: query.search, mode: 'insensitive' } },
          { id: { contains: query.search, mode: 'insensitive' } },
          {
            invitedBy: {
              email: { contains: query.search, mode: 'insensitive' },
            },
          },
          {
            company: {
              name: { contains: query.search, mode: 'insensitive' },
            },
          },
        ],
      }),
    };
  }
}
