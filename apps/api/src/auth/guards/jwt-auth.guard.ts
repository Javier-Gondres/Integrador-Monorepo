import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthException } from 'src/common/errors';

import { AuthContext } from '../auth.types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAllowed = (await super.canActivate(context)) as boolean;
    if (!isAllowed) {
      return false;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthContext }>();

    if (!request.user) {
      throw AuthException.unauthorized();
    }

    request.auth = request.user;
    return true;
  }
}
