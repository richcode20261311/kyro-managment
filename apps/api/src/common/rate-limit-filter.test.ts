import 'reflect-metadata';
import {
  BadRequestException,
  Controller,
  Get,
  Module,
  UnauthorizedException,
  type INestApplication,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  RATE_LIMIT_MESSAGE,
  RateLimitException,
  RateLimitExceptionFilter,
} from './rate-limit';

/**
 * Regresión del registro global del filtro (ver `main.ts`).
 *
 * Un filtro global sin `@Catch()` tiene `exceptionMetatypes = []` y Nest lo
 * selecciona para TODA excepción (`!exceptionMetatypes.length`), de modo que
 * cada400/401 se reescribía como 429 con `Retry-After: undefined`. Este test
 * levanta una app real con el mismo registro que `main.ts` y exige que solo
 * el limitador produzca429.
 */

@Controller('demo')
class DemoController {
  @Get('validacion')
  validacion(): never {
    throw new BadRequestException('Correo o contraseña incorrectos');
  }

  @Get('no-autorizado')
  noAutorizado(): never {
    throw new UnauthorizedException('No autorizado');
  }

  @Get('limite')
  limite(): never {
    throw new RateLimitException(7);
  }

  @Get('inesperado')
  inesperado(): never {
    throw new Error('fallo interno no previsto');
  }
}

@Module({ controllers: [DemoController] })
class DemoModule {}

describe('RateLimitExceptionFilter como filtro global', () => {
  let app: INestApplication;
  let base: string;

  beforeAll(async () => {
    app = await NestFactory.create(DemoModule, { logger: false });
    app.useGlobalFilters(new RateLimitExceptionFilter());
    await app.listen(0);
    base = await app.getUrl();
  }, 20_000);

  afterAll(async () => {
    await app.close();
  });

  it('un error de validación sigue siendo400 y no lleva Retry-After', async () => {
    const res = await fetch(`${base}/demo/validacion`);
    expect(res.status).toBe(400);
    expect(res.headers.get('retry-after')).toBeNull();
    const body = (await res.json()) as { message?: unknown };
    expect(String(body.message)).toContain('incorrectos');
  });

  it('un401 sigue siendo401 y no lleva Retry-After', async () => {
    const res = await fetch(`${base}/demo/no-autorizado`);
    expect(res.status).toBe(401);
    expect(res.headers.get('retry-after')).toBeNull();
    const body = (await res.json()) as { message?: unknown };
    expect(body.message).toBe('No autorizado');
  });

  it('solo el limitador produce429, con Retry-After numérico y mensaje genérico', async () => {
    const res = await fetch(`${base}/demo/limite`);
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('7');
    const body = (await res.json()) as { statusCode?: number; message?: unknown };
    expect(body.statusCode).toBe(429);
    expect(body.message).toBe(RATE_LIMIT_MESSAGE);
    // El cuerpo genérico solo expone código y mensaje: ni la clave de límite
    // alcanzada, ni el máximo ni la ventana (nada que ayude a un atacante).
    expect(Object.keys(body).sort()).toEqual(['message', 'statusCode']);
  });

  it('una excepción inesperada NO se convierte en429 ni lleva Retry-After', async () => {
    // Un `Error` común no es una excepción HTTP: debe caer al filtro por
    // defecto de Nest (500 genérico), jamás al de rate limit.
    const res = await fetch(`${base}/demo/inesperado`);
    expect(res.status).toBe(500);
    expect(res.headers.get('retry-after')).toBeNull();
    const body = (await res.json()) as { statusCode?: number; message?: unknown };
    expect(body.statusCode).toBe(500);
    // Nest responde con mensaje genérico: el detalle del error no se filtra.
    expect(body.message).not.toContain('fallo interno no previsto');
  });
});
