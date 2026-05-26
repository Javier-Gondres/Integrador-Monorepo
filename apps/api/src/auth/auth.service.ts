import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@repo/db';
import * as bcrypt from 'bcrypt';
import { AuthException } from 'src/common/errors';
import { UsersService } from 'src/users/users.service';

import {
  AccessTokenPayload,
  AuthTokens,
  AuthUser,
  RefreshTokenPayload,
} from './auth.types';
import { REFRESH_TOKEN_MAX_AGE_MS } from './refresh-token.cookie';

const ACCESS_TOKEN_DURATION = '15m' as const;
const REFRESH_TOKEN_DURATION = '7d' as const;
const PASSWORD_HASH_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<AuthUser> {
    const userFromDatabase = await this.usersService.findByEmail(email);
    if (!userFromDatabase?.isActive) {
      throw AuthException.invalidCredentials();
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userFromDatabase.passwordHash,
    );
    if (!isPasswordValid) {
      throw AuthException.invalidCredentials();
    }

    const { passwordHash: _passwordHash, ...userWithoutPassword } =
      userFromDatabase;
    return userWithoutPassword;
  }

  async login(authenticatedUser: AuthUser): Promise<AuthTokens> {
    await this.usersService.updateLastLogin(authenticatedUser.id);
    return this.generateAccessAndRefreshTokens(authenticatedUser.id);
  }

  async refreshSession(
    refreshTokenPayload: RefreshTokenPayload,
    refreshTokenFromCookie: string,
  ): Promise<AuthTokens> {
    const userAuthContext = await this.usersService.findAuthContext(
      refreshTokenPayload.sub,
    );

    if (!userAuthContext?.isActive) {
      throw AuthException.invalidCredentials();
    }

    const refreshTokenRecord = await this.verifyRefreshTokenInDatabase(
      refreshTokenPayload,
      refreshTokenFromCookie,
    );

    return this.revokeOldRefreshTokenAndCreateNew(
      refreshTokenRecord.id,
      refreshTokenPayload.sub,
    );
  }

  async logoutSession(refreshTokenPayload: RefreshTokenPayload): Promise<void> {
    await this.revokeRefreshTokenInDatabase(
      refreshTokenPayload.jti,
      refreshTokenPayload.sub,
    );
  }

  async logoutAllSessions(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  private async revokeRefreshTokenInDatabase(
    refreshTokenId: string,
    userId: string,
  ): Promise<void> {
    await prisma.refreshToken.updateMany({
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

  private buildAccessTokenClaims(userId: string): AccessTokenPayload {
    return { sub: userId };
  }

  private generateAccessToken(claims: AccessTokenPayload): string {
    return this.jwtService.sign(claims, {
      expiresIn: ACCESS_TOKEN_DURATION,
    });
  }

  private generateRefreshToken(claims: RefreshTokenPayload): string {
    return this.jwtService.sign(claims, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: REFRESH_TOKEN_DURATION,
    });
  }

  private hashTokenForStorage(plainToken: string): Promise<string> {
    return bcrypt.hash(plainToken, PASSWORD_HASH_ROUNDS);
  }

  private getRefreshTokenExpiryDate(): Date {
    return new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
  }

  private async storeRefreshTokenInDatabase(
    refreshTokenId: string,
    userId: string,
    plainRefreshToken: string,
  ): Promise<void> {
    await prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        userId,
        hashedToken: await this.hashTokenForStorage(plainRefreshToken),
        expiresAt: this.getRefreshTokenExpiryDate(),
      },
    });
  }

  private async generateAccessAndRefreshTokens(
    userId: string,
  ): Promise<AuthTokens> {
    const newRefreshTokenId = randomUUID();
    const accessToken = this.generateAccessToken(
      this.buildAccessTokenClaims(userId),
    );
    const refreshToken = this.generateRefreshToken({
      sub: userId,
      jti: newRefreshTokenId,
    });

    await this.storeRefreshTokenInDatabase(
      newRefreshTokenId,
      userId,
      refreshToken,
    );

    return { accessToken, refreshToken };
  }

  private async verifyRefreshTokenInDatabase(
    refreshTokenPayload: RefreshTokenPayload,
    refreshTokenFromCookie: string,
  ) {
    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { id: refreshTokenPayload.jti },
    });

    const isExpired =
      refreshTokenRecord && refreshTokenRecord.expiresAt < new Date();
    const belongsToAnotherUser =
      refreshTokenRecord &&
      refreshTokenRecord.userId !== refreshTokenPayload.sub;

    if (
      !refreshTokenRecord ||
      refreshTokenRecord.revoked ||
      isExpired ||
      belongsToAnotherUser
    ) {
      throw AuthException.invalidCredentials();
    }

    const doesCookieMatchDatabase = await bcrypt.compare(
      refreshTokenFromCookie,
      refreshTokenRecord.hashedToken,
    );
    if (!doesCookieMatchDatabase) {
      throw AuthException.invalidCredentials();
    }

    return refreshTokenRecord;
  }

  private async revokeOldRefreshTokenAndCreateNew(
    previousRefreshTokenId: string,
    userId: string,
  ): Promise<AuthTokens> {
    const newRefreshTokenId = randomUUID();
    const accessToken = this.generateAccessToken(
      this.buildAccessTokenClaims(userId),
    );
    const refreshToken = this.generateRefreshToken({
      sub: userId,
      jti: newRefreshTokenId,
    });
    const hashedNewRefreshToken = await this.hashTokenForStorage(refreshToken);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: previousRefreshTokenId },
        data: {
          revoked: true,
          revokedAt: new Date(),
          replacedByTokenId: newRefreshTokenId,
        },
      }),
      prisma.refreshToken.create({
        data: {
          id: newRefreshTokenId,
          userId,
          hashedToken: hashedNewRefreshToken,
          expiresAt: this.getRefreshTokenExpiryDate(),
        },
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
