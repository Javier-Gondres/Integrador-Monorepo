import { Injectable } from '@nestjs/common';
import { PasswordResetTokenPurpose, prisma } from '@repo/db';

import {
  membershipRelationSelect,
  membershipRelationSelectFull,
  publicUserSelect,
  type UserWithPasswordHash,
  withMembership,
} from '../users/users.selects';

export type { UserWithPasswordHash } from '../users/users.selects';

export type CreateRefreshTokenData = {
  id: string;
  userId: string;
  hashedToken: string;
  expiresAt: Date;
};

export type RotateRefreshTokenData = {
  previousTokenId: string;
  newToken: CreateRefreshTokenData;
};

export type CreatePasswordResetTokenData = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  purpose?: PasswordResetTokenPurpose;
};

@Injectable()
export class AuthRepository {
  async findAuthContextRow(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isActive: true,
        isSuperAdmin: true,
        memberships: {
          where: { deletedAt: null },
          select: membershipRelationSelect,
          take: 1,
        },
      },
    });
  }

  async findActiveStatus(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });
  }

  async findBasicProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  /** Solo para auth interno (login). No exponer vía HTTP. */
  async findByEmailForAuth(
    email: string,
  ): Promise<UserWithPasswordHash | null> {
    const user = await prisma.user.findFirst({
      where: { email: this.normalizeEmail(email) },
      select: {
        ...publicUserSelect,
        passwordHash: true,
        memberships: {
          where: { deletedAt: null },
          select: membershipRelationSelectFull,
          take: 1,
        },
      },
    });
    return user ? (withMembership(user) as UserWithPasswordHash) : null;
  }

  updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
      select: publicUserSelect,
    });
  }

  revokeAllRefreshTokensForUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  revokeRefreshToken(refreshTokenId: string, userId: string) {
    return prisma.refreshToken.updateMany({
      where: {
        id: refreshTokenId,
        userId,
        revoked: false,
      },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  createRefreshToken(data: CreateRefreshTokenData) {
    return prisma.refreshToken.create({
      data: {
        id: data.id,
        userId: data.userId,
        hashedToken: data.hashedToken,
        expiresAt: data.expiresAt,
      },
    });
  }

  findRefreshTokenById(id: string) {
    return prisma.refreshToken.findUnique({
      where: { id },
    });
  }

  rotateRefreshToken({ previousTokenId, newToken }: RotateRefreshTokenData) {
    return prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: previousTokenId },
        data: {
          revoked: true,
          revokedAt: new Date(),
          replacedByTokenId: newToken.id,
        },
      }),
      prisma.refreshToken.create({
        data: {
          id: newToken.id,
          userId: newToken.userId,
          hashedToken: newToken.hashedToken,
          expiresAt: newToken.expiresAt,
        },
      }),
    ]);
  }

  createPasswordResetToken(data: CreatePasswordResetTokenData) {
    return prisma.passwordResetToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        purpose: data.purpose ?? PasswordResetTokenPurpose.RESET_PASSWORD,
      },
      select: { id: true },
    });
  }

  findPasswordResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userId: true,
        user: { select: { id: true, isActive: true } },
      },
    });
  }

  revokePasswordResetToken(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { revokedAt: new Date() },
      select: { id: true },
    });
  }

  resetPasswordWithToken(params: {
    resetTokenId: string;
    userId: string;
    passwordHash: string;
  }) {
    return prisma.$transaction([
      prisma.user.update({
        where: { id: params.userId },
        data: {
          passwordHash: params.passwordHash,
          emailVerifiedAt: new Date(),
        },
        select: { id: true },
      }),
      prisma.passwordResetToken.update({
        where: { id: params.resetTokenId },
        data: { usedAt: new Date() },
        select: { id: true },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: params.userId, revoked: false },
        data: { revoked: true, revokedAt: new Date() },
      }),
    ]);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
