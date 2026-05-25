import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

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
    private readonly usersService: UsersService,
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
      throw new UnauthorizedException();
    }

    const userAuthContext = await this.usersService.findAuthContext(
      refreshTokenPayload.sub,
    );

    if (!userAuthContext?.isActive) {
      throw new UnauthorizedException();
    }

    return {
      refreshTokenPayload,
      refreshTokenFromCookie,
    };
  }
}
