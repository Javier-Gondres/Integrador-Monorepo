import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

import { ErrorCodes } from '../errors/constants/error-codes';

function formatValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }
    if (error.children?.length) {
      messages.push(...formatValidationErrors(error.children));
    }
  }

  return messages;
}

/**
 * ValidationPipe global con respuesta alineada al contrato ApiErrorResponse.
 */
export function createGlobalValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) => {
      const details = formatValidationErrors(errors);
      return new BadRequestException({
        message: details.length > 0 ? details[0] : 'Error de validación',
        error: ErrorCodes.VALIDATION_ERROR,
        details,
      });
    },
  });
}
