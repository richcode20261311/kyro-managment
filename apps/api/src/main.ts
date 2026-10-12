import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { AppModule } from './app.module';
import { RateLimitExceptionFilter } from './common/rate-limit';

config();

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  // Límites de intentos de autenticación:429 + Retry-After (sin fugas).
  app.useGlobalFilters(new RateLimitExceptionFilter());
  // El web (3000) consume la API (3001) con credenciales (cookie de refresh).
  app.enableCors({
    origin: process.env['APP_URL'] ?? 'http://localhost:3000',
    credentials: true,
  });
  // `trust proxy` NO está habilitado: req.ip es la IP del socket real y las
  // cabeceras X-Forwarded-For del cliente se ignoran (no manipulable). Si
  // detrás hay un proxy inverso, debe configurarse explícitamente allí y aquí
  // con la cantidad exacta de saltos (ver docs/OPERATIONS.md); nunca `true`.
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`AKI API escuchando en http://localhost:${port}/api`);
}

void bootstrap();
