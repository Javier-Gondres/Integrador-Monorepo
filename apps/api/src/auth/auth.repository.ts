import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

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
        memberships: { select: membershipRelationSelectFull, take: 1 },
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

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
