import { HttpStatus } from '@nestjs/common';

import { ErrorCodes } from '../constants/error-codes';
import { BusinessException } from './business.exception';

/**
 * Errores del dominio de autenticación y autorización.
 * Usar factories estáticas para mensajes y códigos consistentes.
 */
export class AuthException extends BusinessException {
  static invalidCredentials(): AuthException {
    return new AuthException(
      ErrorCodes.INVALID_CREDENTIALS,
      'Credenciales inválidas',
      HttpStatus.UNAUTHORIZED,
    );
  }

  static unauthorized(message = 'No autorizado'): AuthException {
    return new AuthException(
      ErrorCodes.UNAUTHORIZED,
      message,
      HttpStatus.UNAUTHORIZED,
    );
  }

  static sessionExpired(): AuthException {
    return new AuthException(
      ErrorCodes.SESSION_EXPIRED,
      'La sesión ha expirado o no es válida',
      HttpStatus.UNAUTHORIZED,
    );
  }

  static unauthorizedCompanyAccess(
    message = 'No tienes acceso a esta empresa',
  ): AuthException {
    return new AuthException(
      ErrorCodes.UNAUTHORIZED_COMPANY_ACCESS,
      message,
      HttpStatus.FORBIDDEN,
    );
  }
}
