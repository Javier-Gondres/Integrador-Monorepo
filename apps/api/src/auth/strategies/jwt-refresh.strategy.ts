import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthException } from 'src/common/errors';

import { AuthService } from '../auth.service';
import { RefreshTokenPayload } from '../auth.types';
import { REFRESH_TOKEN_COOKIE } from '../refresh-token.cookie';

function readRefreshTokenCookie(req: Request): string | null {
  const cookies: unknown = req.cookies;
  if (cookies === null || typeof cookies !== 'object') {
    return null;
  }
  const value = (cookies as Record<string, unknown>)[REFRESH_TOKEN_COOKIE];
  return typeof value === 'string' ? value : null;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([readRefreshTokenCookie]),
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, refreshTokenPayload: RefreshTokenPayload) {
    const refreshTokenFromCookie = readRefreshTokenCookie(req);
    if (!refreshTokenFromCookie) {
      throw AuthException.sessionExpired();
    }

    const userAuthContext = await this.authService.findAuthContext(
      refreshTokenPayload.sub,
    );

    if (!userAuthContext?.isActive) {
      throw AuthException.sessionExpired();
    }

    return {
      refreshTokenPayload,
      refreshTokenFromCookie,
    };
  }
}
