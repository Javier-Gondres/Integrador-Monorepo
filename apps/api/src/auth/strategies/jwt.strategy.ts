import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

import { AccessTokenPayload, AuthContext } from '../auth.types';
import { toAuthContext } from '../mappers/auth-context.mapper';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthContext> {
    const userAuthContext = await this.usersService.findAuthContext(
      payload.sub,
    );

    if (!userAuthContext?.isActive) {
      throw new UnauthorizedException();
    }

    // TODO: cargar permisos dinámicos aquí antes de devolver el contexto
    return toAuthContext(userAuthContext);
  }
}
