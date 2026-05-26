import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

type RequestWithObservability = Request & {
  requestId?: string;
  auth?: { userId: string; companyId: string | null } | undefined;
  company?: { companyId: string } | undefined;
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest<RequestWithObservability>();
    const response = httpCtx.getResponse<Response>();

    const start = Date.now();
    const requestId = request.requestId;

    const logPayloadBase = {
      requestId,
      method: request.method,
      path: request.originalUrl ?? request.url,
      userId: request.auth?.userId ?? undefined,
      companyId:
        request.company?.companyId ??
        request.auth?.companyId ??
        undefined,
    };

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - start;
        const statusCode = response.statusCode;

        const payload = {
          ...logPayloadBase,
          statusCode,
          durationMs,
        };

        // Nivel según severidad HTTP para facilitar lectura.
        if (statusCode >= 500) {
          this.logger.error(JSON.stringify(payload));
        } else if (statusCode >= 400) {
          this.logger.warn(JSON.stringify(payload));
        } else {
          this.logger.log(JSON.stringify(payload));
        }
      }),
      catchError((err: unknown) => {
        const durationMs = Date.now() - start;

        const statusCode =
          err instanceof HttpException ? err.getStatus() : 500;

        const errorCode =
          err instanceof HttpException
            ? this.extractErrorCodeFromHttpException(err)
            : undefined;

        const payload = {
          ...logPayloadBase,
          statusCode,
          durationMs,
          errorCode,
        };

        if (statusCode >= 500) {
          this.logger.error(JSON.stringify(payload));
        } else {
          this.logger.warn(JSON.stringify(payload));
        }

        return throwError(() => err);
      }),
    );
  }

  private extractErrorCodeFromHttpException(exception: HttpException) {
    const raw = exception.getResponse();
    if (typeof raw !== 'object' || raw === null) {return undefined;}

    const maybeError = (raw as { error?: unknown }).error;
    return typeof maybeError === 'string' ? maybeError : undefined;
  }
}

