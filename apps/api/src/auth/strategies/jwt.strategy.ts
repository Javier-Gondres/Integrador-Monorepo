import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

import { AccessTokenPayload, JwtGuardRequestUser } from '../auth.types';

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

  async validate(payload: AccessTokenPayload): Promise<JwtGuardRequestUser> {
    const authenticatedUser = await this.usersService.findByIdForAccessToken(
      payload.sub,
      payload.companyId,
    );

    if (!authenticatedUser?.membership) {
      throw new UnauthorizedException();
    }

    const { membership } = authenticatedUser;

    if (
      membership.role.name !== payload.role ||
      membership.defaultBranchId !== payload.branchId
    ) {
      throw new UnauthorizedException();
    }

    return {
      userId: authenticatedUser.id,
      companyId: membership.companyId,
      role: membership.role.name,
      branchId: membership.defaultBranchId,
    };
  }
}
