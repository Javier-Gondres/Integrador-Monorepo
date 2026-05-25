import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthContext } from '../auth.types';

export const Auth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthContext => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.auth) {
      throw new UnauthorizedException();
    }

    return request.auth;
  },
);
