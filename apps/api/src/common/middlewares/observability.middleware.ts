import { randomUUID } from 'node:crypto';

import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

type CapturedBody = unknown;

/**
 * Middleware de observabilidad que corre ANTES de guards/pipes/interceptors.
 * - Genera/respeta `x-request-id`
 * - Mide duración
 * - Loguea status + errorCode (si viene en el body)
 *
 * Esto cubre incluso errores lanzados por guards (p. ej. 403 multiempresa),
 * donde los interceptores globales no llegan a ejecutarse.
 */
export function observabilityMiddleware(
  req: Request & { requestId?: string; auth?: unknown; company?: unknown },
  res: Response,
  next: NextFunction,
) {
  const logger = new Logger('Observability');
  const start = Date.now();

  const incoming = req.headers['x-request-id'];
  const incomingId =
    typeof incoming === 'string'
      ? incoming
      : Array.isArray(incoming)
        ? incoming[0]
        : undefined;

  // Genera requestId si no viene del cliente.
  const requestId =
    typeof incomingId === 'string' && incomingId.trim().length > 0
      ? incomingId
      : randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  let capturedBody: CapturedBody = undefined;

  // Capturamos el payload para extraer `error` en el log (GlobalExceptionFilter).
  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => {
    capturedBody = body;
    return originalJson(body);
  };

  const originalSend = res.send.bind(res);
  res.send = (body: unknown) => {
    capturedBody = body;
    return originalSend(body);
  };

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const statusCode = res.statusCode;

    const maybeBody =
      capturedBody && typeof capturedBody === 'object'
        ? (capturedBody as { error?: unknown })
        : undefined;
    const errorCode =
      typeof maybeBody?.error === 'string' ? maybeBody.error : undefined;

    // Contexto disponible solo si el guard ya lo seteo en el request.
    const userId = (req.auth as { userId?: string } | undefined)?.userId;
    const companyId = (req.company as { companyId?: string } | undefined)
      ?.companyId;

    const payload = {
      requestId,
      method: req.method,
      path: (req as { originalUrl?: string }).originalUrl ?? req.url,
      statusCode,
      durationMs,
      userId,
      companyId,
      errorCode,
    };

    if (statusCode >= 500) {
      logger.error(JSON.stringify(payload));
      return;
    }
    if (statusCode >= 400) {
      logger.warn(JSON.stringify(payload));
      return;
    }

    logger.log(JSON.stringify(payload));
  });

  next();
}

