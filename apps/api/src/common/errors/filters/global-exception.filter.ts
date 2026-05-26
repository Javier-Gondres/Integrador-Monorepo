import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@repo/db';
import type { Request, Response } from 'express';

import { ErrorCode, ErrorCodes } from '../constants/error-codes';
import { BusinessException } from '../exceptions/business.exception';
import type {
  ApiErrorResponse,
  AppExceptionPayload,
} from '../interfaces/api-error-response.interface';

type ResolvedError = Pick<
  ApiErrorResponse,
  'statusCode' | 'message' | 'error' | 'details'
>;

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const resolved = this.resolveException(exception);
    const isProduction = this.isProduction();

    if (resolved.statusCode >= 500) {
      this.logger.error(
        resolved.message,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ApiErrorResponse = {
      success: false,
      statusCode: resolved.statusCode,
      message: resolved.message,
      error: resolved.error,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(!isProduction && resolved.details !== undefined
        ? { details: resolved.details }
        : {}),
    };

    response.status(resolved.statusCode).json(body);
  }

  private resolveException(exception: unknown): ResolvedError {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.mapPrismaError(exception);
    }

    if (exception instanceof HttpException) {
      return this.mapHttpException(exception);
    }

    return this.mapUnknownError(exception);
  }

  /**
   * P2002 → conflicto (unique constraint)
   * P2025 → no encontrado (record required for operation)
   */
  private mapPrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): ResolvedError {
    switch (exception.code) {
      case 'P2002': {
        const mapped = this.mapUniqueConstraint(exception);
        const httpException = new ConflictException({
          message: mapped.message,
          error: mapped.error,
        });
        return this.mapHttpException(httpException);
      }
      case 'P2025': {
        const httpException = new NotFoundException({
          message: 'El registro solicitado no existe',
          error: ErrorCodes.RECORD_NOT_FOUND,
        });
        return this.mapHttpException(httpException);
      }
      default:
        this.logger.warn(
          `Prisma error no mapeado: ${exception.code}`,
          exception.message,
        );
        return this.mapUnknownError(exception);
    }
  }

  private mapUniqueConstraint(
    exception: Prisma.PrismaClientKnownRequestError,
  ): { message: string; error: ErrorCode } {
    const target = exception.meta?.target;
    const fields = this.extractConstraintFields(target);

    if (fields.some((f) => f.toLowerCase().includes('email'))) {
      return {
        message: 'Ese email ya está registrado',
        error: ErrorCodes.EMAIL_ALREADY_EXISTS,
      };
    }

    return {
      message: 'Ya existe un registro con esos datos',
      error: ErrorCodes.DUPLICATE_RECORD,
    };
  }

  private extractConstraintFields(target: unknown): string[] {
    if (Array.isArray(target)) {
      return target.map(String);
    }
    if (typeof target === 'string') {
      return [target];
    }
    return [];
  }

  private mapHttpException(exception: HttpException): ResolvedError {
    const statusCode = exception.getStatus();
    const raw = exception.getResponse();

    if (typeof raw === 'string') {
      return {
        statusCode,
        message: raw,
        error: this.defaultErrorCodeForStatus(statusCode),
      };
    }

    const payload = raw as AppExceptionPayload & {
      message?: string | string[];
      error?: string;
      statusCode?: number;
    };

    const message = this.normalizeMessage(payload.message, statusCode);
    const error =
      typeof payload.error === 'string' && payload.error.length > 0
        ? payload.error
        : exception instanceof BusinessException
          ? exception.errorCode
          : this.defaultErrorCodeForStatus(statusCode);

    const details = Array.isArray(payload.details)
      ? payload.details
      : exception instanceof BadRequestException &&
          Array.isArray(payload.message)
        ? payload.message
        : payload.details;

    return {
      statusCode,
      message,
      error,
      details,
    };
  }

  private mapUnknownError(exception: unknown): ResolvedError {
    const isProduction = this.isProduction();

    if (!isProduction && exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
        error: ErrorCodes.INTERNAL_SERVER_ERROR,
        details: { name: exception.name, stack: exception.stack },
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
    };
  }

  private normalizeMessage(
    message: string | string[] | undefined,
    statusCode: number,
  ): string {
    if (Array.isArray(message)) {
      return message.join('; ');
    }
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
    if (statusCode === 400) {
      return 'Solicitud inválida';
    }
    return 'Ha ocurrido un error';
  }

  private defaultErrorCodeForStatus(statusCode: number): ErrorCode {
    switch (statusCode) {
      case 401:
        return ErrorCodes.UNAUTHORIZED;
      case 403:
        return ErrorCodes.UNAUTHORIZED_COMPANY_ACCESS;
      case 404:
        return ErrorCodes.RECORD_NOT_FOUND;
      case 409:
        return ErrorCodes.DUPLICATE_RECORD;
      case 400:
        return ErrorCodes.VALIDATION_ERROR;
      default:
        return ErrorCodes.INTERNAL_SERVER_ERROR;
    }
  }

  private isProduction(): boolean {
    return (
      process.env.NODE_ENV === 'production' ||
      process.env.APP_ENV === 'production'
    );
  }
}
