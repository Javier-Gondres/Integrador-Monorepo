import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthException } from 'src/common/errors';

import type { CompanyContext } from '../company-context.types';

export const Company = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CompanyContext => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.company) {
      throw AuthException.unauthorizedCompanyAccess();
    }

    return request.company;
  },
);

/** Solo el `companyId` del tenant activo. */
export const CompanyId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.company) {
      throw AuthException.unauthorizedCompanyAccess();
    }

    return request.company.companyId;
  },
);
