import { createHash, randomBytes, randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordResetTokenPurpose } from '@repo/db';
import type { PermissionCode } from '@repo/shared';
import * as bcrypt from 'bcrypt';
import { AuthException } from 'src/common/errors';

import { stripTenantMembershipForSuperAdmin } from '../common/platform';
import { AuthRepository } from './auth.repository';
import {
  AccessTokenPayload,
  AuthTokens,
  AuthUser,
  BasicUserProfile,
  RefreshTokenPayload,
  UserAuthContext,
} from './auth.types';
import { REFRESH_TOKEN_MAX_AGE_MS } from './refresh-token.cookie';

const ACCESS_TOKEN_DURATION = '15m' as const;
const REFRESH_TOKEN_DURATION = '7d' as const;
const PASSWORD_HASH_ROUNDS = 10;
const PASSWORD_RESET_TOKEN_BYTES = 32;
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async findAuthContext(userId: string): Promise<UserAuthContext | null> {
    const user = await this.authRepository.findAuthContextRow(userId);

    if (!user) {
      return null;
    }

    // Un usuario tiene como máximo una membresía activa (restricción intencional).
    // Ver comentario en UserCompany en auth.prisma para el razonamiento completo.
    const membership = user.memberships[0] ?? null;

    return stripTenantMembershipForSuperAdmin({
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      isSuperAdmin: user.isSuperAdmin,
      membership: membership
        ? {
            companyId: membership.companyId,
            defaultBranchId: membership.defaultBranchId,
            role: {
              name: membership.role.name,
              permissions: (membership.role.permissions ?? []).map(
                (rp) => rp.permission.code as PermissionCode,
              ),
            },
          }
        : null,
    });
  }

  async isUserActive(userId: string): Promise<boolean> {
    const result = await this.authRepository.findActiveStatus(userId);
    return result?.isActive ?? false;
  }

  async getBasicProfile(userId: string): Promise<BasicUserProfile> {
    const user = await this.authRepository.findBasicProfile(userId);

    if (!user) {
      throw AuthException.unauthorized();
    }

    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async validateUser(email: string, password: string): Promise<AuthUser> {
    const userFromDatabase =
      await this.authRepository.findByEmailForAuth(email);
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
    await this.authRepository.updateLastLogin(authenticatedUser.id);
    const userContext = await this.findAuthContext(authenticatedUser.id);
    return this.generateAccessAndRefreshTokens(
      authenticatedUser.id,
      userContext,
    );
  }

  async refreshSession(
    refreshTokenPayload: RefreshTokenPayload,
    refreshTokenFromCookie: string,
  ): Promise<AuthTokens> {
    const userAuthContext = await this.findAuthContext(refreshTokenPayload.sub);

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
      userAuthContext,
    );
  }

  async logoutSession(refreshTokenPayload: RefreshTokenPayload): Promise<void> {
    await this.authRepository.revokeRefreshToken(
      refreshTokenPayload.jti,
      refreshTokenPayload.sub,
    );
  }

  async logoutAllSessions(userId: string): Promise<void> {
    await this.authRepository.revokeAllRefreshTokensForUser(userId);
  }

  async createPasswordResetToken(
    userId: string,
    purpose: PasswordResetTokenPurpose = PasswordResetTokenPurpose.RESET_PASSWORD,
  ): Promise<string> {
    const token = randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('base64url');
    await this.authRepository.createPasswordResetToken({
      userId,
      tokenHash: this.hashOpaqueToken(token),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
      purpose,
    });
    return token;
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.authRepository.findPasswordResetToken(
      this.hashOpaqueToken(token),
    );

    if (!resetToken?.user.isActive) {
      throw AuthException.invalidCredentials();
    }

    const passwordHash = await bcrypt.hash(newPassword, PASSWORD_HASH_ROUNDS);
    await this.authRepository.resetPasswordWithToken({
      resetTokenId: resetToken.id,
      userId: resetToken.userId,
      passwordHash,
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  /**
   * Emite un nuevo access token con el contexto actual de BD (sin rotar refresh token).
   * Usado tras cambios que afectan claims del JWT, p. ej. switchBranch.
   */
  async issueAccessToken(userId: string): Promise<string> {
    const userContext = await this.findAuthContext(userId);

    if (!userContext?.isActive) {
      throw AuthException.unauthorized();
    }

    return this.generateAccessToken(
      this.buildAccessTokenClaims(userId, userContext),
    );
  }

  private buildAccessTokenClaims(
    userId: string,
    userContext: UserAuthContext | null,
  ): AccessTokenPayload {
    const isSuperAdmin = userContext?.isSuperAdmin ?? false;
    const membership = isSuperAdmin ? null : (userContext?.membership ?? null);

    return {
      sub: userId,
      email: userContext?.email ?? '',
      companyId: membership?.companyId ?? null,
      branchId: membership?.defaultBranchId ?? null,
      role: membership?.role.name ?? null,
      permissions: membership?.role.permissions ?? [],
      isSuperAdmin,
    };
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

  private hashOpaqueToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getRefreshTokenExpiryDate(): Date {
    return new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);
  }

  private async storeRefreshTokenInDatabase(
    refreshTokenId: string,
    userId: string,
    plainRefreshToken: string,
  ): Promise<void> {
    await this.authRepository.createRefreshToken({
      id: refreshTokenId,
      userId,
      hashedToken: await this.hashTokenForStorage(plainRefreshToken),
      expiresAt: this.getRefreshTokenExpiryDate(),
    });
  }

  private async generateAccessAndRefreshTokens(
    userId: string,
    userContext: UserAuthContext | null = null,
  ): Promise<AuthTokens> {
    const newRefreshTokenId = randomUUID();
    const accessToken = this.generateAccessToken(
      this.buildAccessTokenClaims(userId, userContext),
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
    const refreshTokenRecord = await this.authRepository.findRefreshTokenById(
      refreshTokenPayload.jti,
    );

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
    userContext: UserAuthContext | null = null,
  ): Promise<AuthTokens> {
    const newRefreshTokenId = randomUUID();
    const accessToken = this.generateAccessToken(
      this.buildAccessTokenClaims(userId, userContext),
    );
    const refreshToken = this.generateRefreshToken({
      sub: userId,
      jti: newRefreshTokenId,
    });
    const hashedNewRefreshToken = await this.hashTokenForStorage(refreshToken);

    await this.authRepository.rotateRefreshToken({
      previousTokenId: previousRefreshTokenId,
      newToken: {
        id: newRefreshTokenId,
        userId,
        hashedToken: hashedNewRefreshToken,
        expiresAt: this.getRefreshTokenExpiryDate(),
      },
    });

    return { accessToken, refreshToken };
  }
}
