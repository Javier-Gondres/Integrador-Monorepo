import { randomUUID } from 'node:crypto';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';

type RequestWithRequestId = Request & { requestId?: string };

/**
 * Interceptor simple para trazabilidad:
 * - Si el cliente manda `x-request-id`, lo respeta.
 * - Si no, genera un `requestId` y lo propaga en:
 *   - `request.requestId`
 *   - header de respuesta `x-request-id`
 */
@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest<RequestWithRequestId>();
    const response = httpCtx.getResponse<Response>();

    const incoming = request.headers['x-request-id'];
    const incomingId =
      typeof incoming === 'string'
        ? incoming
        : Array.isArray(incoming)
          ? incoming[0]
          : undefined;

    const requestId =
      typeof incomingId === 'string' && incomingId.trim().length > 0
        ? incomingId
        : randomUUID();

    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);

    return next.handle();
  }
}

