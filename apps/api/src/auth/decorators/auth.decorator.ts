import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthException } from 'src/common/errors';

import { AuthContext } from '../auth.types';

export const Auth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthContext => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.auth) {
      throw AuthException.unauthorized();
    }

    return request.auth;
  },
);
