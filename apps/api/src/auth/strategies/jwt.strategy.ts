import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthException } from 'src/common/errors';

import { AuthService } from '../auth.service';
import { AccessTokenPayload, AuthContext } from '../auth.types';
import { toAuthContextFromPayload } from '../mappers/auth-context.mapper';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthContext> {
    const isActive = await this.authService.isUserActive(payload.sub);

    if (!isActive) {
      console.warn('User is not active', payload.sub);
      throw AuthException.unauthorized();
    }

    return toAuthContextFromPayload(payload);
  }
}
