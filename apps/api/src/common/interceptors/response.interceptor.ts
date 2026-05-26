import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type SuccessResponse<T = unknown> = {
  success: true;
  message: string;
  data: T;
};

/**
 * Estandariza respuestas exitosas para toda la API:
 * - Siempre responde: { success: true, message, data }
 * - Si el handler devuelve `{ message: string, ... }`, usamos ese message
 *   y movemos el resto a `data` para no duplicar.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse> {
    return next.handle().pipe(
      map((rawData: unknown) => {
        // Evita doble-wrapping si el handler ya devolvió el contrato.
        if (
          rawData &&
          typeof rawData === 'object' &&
          'success' in rawData &&
          (rawData as { success?: unknown }).success === true &&
          'data' in rawData
        ) {
          return rawData as SuccessResponse;
        }

        const message = this.extractMessage(rawData);
        const data = this.extractData(rawData);

        return {
          success: true,
          message,
          data,
        };
      }),
    );
  }

  private extractMessage(rawData: unknown): string {
    if (rawData === null || rawData === undefined) {
      return 'Operación exitosa';
    }

    if (
      typeof rawData === 'object' &&
      !Array.isArray(rawData) &&
      rawData !== null
    ) {
      const maybeMessage = (rawData as { message?: unknown }).message;
      if (typeof maybeMessage === 'string' && maybeMessage.trim().length > 0) {
        return maybeMessage;
      }
    }

    return 'Operación exitosa';
  }

  private extractData(rawData: unknown): unknown {
    if (rawData === null || rawData === undefined) {
      return {};
    }

    // Si el handler incluye message, removemos para que `data` contenga el resto.
    if (
      typeof rawData === 'object' &&
      !Array.isArray(rawData) &&
      rawData !== null &&
      'message' in rawData
    ) {
      const { message: _message, ...rest } = rawData as Record<string, unknown>;
      return rest;
    }

    return rawData;
  }
}

