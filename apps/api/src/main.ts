import './load-env';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/errors';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { observabilityMiddleware } from './common/middlewares/observability.middleware';
import { createGlobalValidationPipe } from './common/pipes/validation.pipe.factory';

function corsOrigin(config: ConfigService) {
  const list = (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const previews = config.get<string>('CORS_ALLOW_VERCEL_PREVIEWS') === 'true';
  return (
    origin: string | undefined,
    cb: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) {
      cb(null, true);
      return;
    }
    if (list.includes(origin)) {
      cb(null, true);
      return;
    }
    if (previews) {
      try {
        if (new URL(origin).hostname.endsWith('.vercel.app')) {
          cb(null, true);
          return;
        }
      } catch {
        /* ignore */
      }
    }
    cb(null, false);
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(cookieParser());

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(createGlobalValidationPipe());
  // Middleware corre antes que guards/pipes/interceptors para cubrir también fallos de guards.
  app.use(observabilityMiddleware);
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.enableCors({
    origin: corsOrigin(config),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
