import './load-env';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

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
  app.enableCors({
    origin: corsOrigin(config),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
