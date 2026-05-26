import { HttpException, HttpStatus } from '@nestjs/common';

import { ErrorCode, ErrorCodes } from '../constants/error-codes';
import type { AppExceptionPayload } from '../interfaces/api-error-response.interface';

/**
 * Excepción base para reglas de negocio explícitas.
 * No envuelve errores de infraestructura: esas suben al GlobalExceptionFilter.
 */
export class BusinessException extends HttpException {
  readonly errorCode: ErrorCode;

  constructor(
    errorCode: ErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: unknown,
  ) {
    const payload: AppExceptionPayload = {
      message,
      error: errorCode,
      ...(details !== undefined ? { details } : {}),
    };

    super(payload, statusCode);
    this.errorCode = errorCode;
  }

  static notFound(
    errorCode: ErrorCode = ErrorCodes.RECORD_NOT_FOUND,
    message = 'Recurso no encontrado',
  ): BusinessException {
    return new BusinessException(errorCode, message, HttpStatus.NOT_FOUND);
  }

  static conflict(
    errorCode: ErrorCode,
    message: string,
  ): BusinessException {
    return new BusinessException(errorCode, message, HttpStatus.CONFLICT);
  }

  static forbidden(
    errorCode: ErrorCode,
    message: string,
  ): BusinessException {
    return new BusinessException(errorCode, message, HttpStatus.FORBIDDEN);
  }
}
