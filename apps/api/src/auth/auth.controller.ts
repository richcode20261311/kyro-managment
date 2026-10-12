import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { KioskQuery, LoginInput, PinLoginInput, TenantSelectionChallenge } from '@aki/shared';
import {
  kioskQuerySchema,
  loginSchema,
  pinLoginSchema,
  recoveryRequestSchema,
  recoveryResetSchema,
  recoveryVerifySchema,
  tenantSelectSchema,
  type RecoveryRequestInput,
  type RecoveryResetInput,
  type RecoveryVerifyInput,
  type TenantSelectInput,
} from '@aki/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthService, REFRESH_COOKIE, REFRESH_COOKIE_PATH, type IssuedSession } from './auth.service';
import type { RequestMeta } from './token.types';

function metaOf(req: Request): RequestMeta {
  return { ip: req.ip, userAgent: req.headers['user-agent'] };
}

function setRefreshCookie(res: Response, token: string, maxAgeMs: number): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env['NODE_ENV'] === 'production',
    path: REFRESH_COOKIE_PATH,
    maxAge: maxAgeMs,
  });
}

/** Todo el cuerpo de respuesta excepto el refresh token (va en cookie httpOnly). */
function toBody(session: IssuedSession): Omit<IssuedSession, 'refreshToken' | 'refreshMaxAgeMs'> {
  const { accessToken, user, tenant } = session;
  return { accessToken, user, tenant };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /**
   * A1. Si el correo+contraseña corresponde a un solo restaurante, crea la
   * sesión como siempre. Si corresponde a varios, responde con el reto de
   * selección (sin cookie) y el cliente continúa en `login/select`.
   */
  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) input: LoginInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Omit<IssuedSession, 'refreshToken' | 'refreshMaxAgeMs'> | TenantSelectionChallenge> {
    const result = await this.auth.login(input, metaOf(req));
    if ('requiresTenantSelection' in result) return result;
    setRefreshCookie(res, result.refreshToken, result.refreshMaxAgeMs);
    return toBody(result);
  }

  /**
   * Segundo paso de A1 solo cuando hubo selección: el token atestigua la
   * contraseña verificada y el servidor valida que el tenant elegido esté
   * entre los permitidos antes de abrir la sesión.
   */
  @Post('login/select')
  @HttpCode(200)
  async loginSelect(
    @Body(new ZodValidationPipe(tenantSelectSchema)) input: TenantSelectInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Omit<IssuedSession, 'refreshToken' | 'refreshMaxAgeMs'>> {
    const session = await this.auth.loginSelect(input, metaOf(req));
    setRefreshCookie(res, session.refreshToken, session.refreshMaxAgeMs);
    return toBody(session);
  }

  @Get('employees')
  employees(
    @Query(new ZodValidationPipe(kioskQuerySchema)) query: KioskQuery,
  ): Promise<{ id: string; name: string; role: string }[]> {
    return this.auth.kioskEmployees(query.tenant);
  }

  @Post('pin-login')
  @HttpCode(200)
  async pinLogin(
    @Body(new ZodValidationPipe(pinLoginSchema)) input: PinLoginInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Omit<IssuedSession, 'refreshToken' | 'refreshMaxAgeMs'>> {
    const session = await this.auth.pinLogin(input, metaOf(req));
    setRefreshCookie(res, session.refreshToken, session.refreshMaxAgeMs);
    return toBody(session);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Omit<IssuedSession, 'refreshToken' | 'refreshMaxAgeMs'>> {
    const session = await this.auth.refresh(req.cookies?.[REFRESH_COOKIE], metaOf(req));
    setRefreshCookie(res, session.refreshToken, session.refreshMaxAgeMs);
    return toBody(session);
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.auth.logout(req.cookies?.[REFRESH_COOKIE]);
    res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
  }

  @Post('recovery/request')
  @HttpCode(202)
  async recoveryRequest(
    @Body(new ZodValidationPipe(recoveryRequestSchema)) input: RecoveryRequestInput,
    @Req() req: Request,
  ): Promise<void> {
    await this.auth.requestRecovery(input, metaOf(req));
  }

  @Post('recovery/verify')
  @HttpCode(200)
  async recoveryVerify(
    @Body(new ZodValidationPipe(recoveryVerifySchema)) input: RecoveryVerifyInput,
    @Req() req: Request,
  ): Promise<{ ok: true }> {
    await this.auth.verifyRecovery(input, metaOf(req));
    return { ok: true };
  }

  @Post('recovery/reset')
  @HttpCode(200)
  async recoveryReset(
    @Body(new ZodValidationPipe(recoveryResetSchema)) input: RecoveryResetInput,
    @Req() req: Request,
  ): Promise<{ ok: true }> {
    await this.auth.resetRecovery(input, metaOf(req));
    return { ok: true };
  }
}
