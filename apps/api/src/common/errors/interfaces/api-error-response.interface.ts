/**
 * Contrato único de respuestas de error para toda la API.
 * El GlobalExceptionFilter siempre serializa errores con esta forma.
 */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  /** Código interno estable para el frontend (i18n, analytics, retry). */
  error: string;
  timestamp: string;
  path: string;
  /**
   * Detalle adicional (p. ej. errores de validación).
   * Solo se incluye fuera de producción.
   */
  details?: unknown;
}

/**
 * Payload opcional que pueden llevar las HttpException personalizadas.
 */
export interface AppExceptionPayload {
  message: string;
  error: string;
  details?: unknown;
}
