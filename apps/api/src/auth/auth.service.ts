import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Prisma, Tenant, User } from '@prisma/client';
import type {
  LoginInput,
  PinLoginInput,
  RecoveryResetInput,
  RecoveryRequestInput,
  RecoveryVerifyInput,
} from '@aki/shared';
import { AuditService } from '../audit/audit.service';
import { parseDuration, readDuration, type Duration } from '../common/duration';
import { hashSecret, verifySecret } from '../common/password.util';
import { EMAIL_PROVIDER, type EmailProvider } from '../email/email.provider';
import { PrismaService } from '../prisma.module';
import { withTenant } from '../prisma.with-tenant';
import type { AccessTokenPayload, RefreshTokenPayload, RequestMeta } from './token.types';

export const REFRESH_COOKIE = 'aki_refresh';
export const REFRESH_COOKIE_PATH = '/api/auth';

const RECOVERY_TTL_MINUTES = 15;
const INVALID_CREDENTIALS = 'Correo o contraseña incorrectos';

export interface AuthResult {
  accessToken: string;
  user: { id: string; name: string; email: string; role: User['role'] };
  tenant: { id: string; name: string; slug: string };
}

export interface IssuedSession extends AuthResult {
  refreshToken: string;
  refreshMaxAgeMs: number;
}

type UserWithTenant = User & { tenant: Tenant };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessTtl: Duration;
  private readonly refreshTtl: Duration;
  private readonly refreshMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    @Inject(EMAIL_PROVIDER) private readonly email: EmailProvider,
    private readonly audit: AuditService,
  ) {
    const accessSecret = process.env['JWT_ACCESS_SECRET'];
    const refreshSecret = process.env['JWT_REFRESH_SECRET'];
    if (!accessSecret || !refreshSecret) {
      throw new Error('Faltan JWT_ACCESS_SECRET y JWT_REFRESH_SECRET en el entorno');
    }
    this.accessSecret = accessSecret;
    this.refreshSecret = refreshSecret;
    this.accessTtl = readDuration('ACCESS_TOKEN_TTL', '15m');
    this.refreshTtl = readDuration('REFRESH_TOKEN_TTL', '30d');
    this.refreshMs = parseDuration(this.refreshTtl);
  }

  // ── Login ────────────────────────────────────────────────────────────────

  async login(input: LoginInput, meta: RequestMeta): Promise<IssuedSession> {
    const identity = await this.identityByEmail(input.email);
    if (!identity) throw new UnauthorizedException(INVALID_CREDENTIALS);

    return withTenant(this.prisma, identity.tenantId, async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: identity.userId },
        include: { tenant: true },
      });
      if (
        !user?.active ||
        !user.passwordHash ||
        !(await verifySecret(input.password, user.passwordHash))
      ) {
        throw new UnauthorizedException(INVALID_CREDENTIALS);
      }
      return this.issueTokens(tx, user, meta, 'auth.login');
    });
  }

  async pinLogin(input: PinLoginInput, meta: RequestMeta): Promise<IssuedSession> {
    const identity = await this.identityById(input.userId);
    if (!identity) throw new UnauthorizedException(INVALID_CREDENTIALS);

    return withTenant(this.prisma, identity.tenantId, async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: input.userId },
        include: { tenant: true },
      });
      if (!user?.active || !user.pin || !(await verifySecret(input.pin, user.pin))) {
        throw new UnauthorizedException(INVALID_CREDENTIALS);
      }
      return this.issueTokens(tx, user, meta, 'auth.pin_login');
    });
  }

  /** Grilla del kiosco (A2): solo nombres, roles e ids de empleados con PIN. */
  async kioskEmployees(
    slug: string,
  ): Promise<{ id: string; name: string; role: User['role'] }[]> {
    return this.prisma.$queryRaw<{ id: string; name: string; role: User['role'] }[]>`
      SELECT id, name, role FROM list_kiosk_employees(${slug})
    `;
  }

  // ── Sesión (refresh y logout) ────────────────────────────────────────────

  async refresh(rawToken: string | undefined, meta: RequestMeta): Promise<IssuedSession> {
    const payload = await this.verifyRefresh(rawToken);

    return withTenant(this.prisma, payload.tenantId, async (tx) => {
      const session = await tx.session.findUnique({ where: { id: payload.sid } });
      const vigente =
        session && !session.revokedAt && session.expiresAt > new Date() && session.userId === payload.sub;
      if (!vigente) throw new UnauthorizedException('Sesión expirada, inicia de nuevo');

      const user = await tx.user.findUnique({
        where: { id: payload.sub },
        include: { tenant: true },
      });
      if (!user?.active) throw new UnauthorizedException(INVALID_CREDENTIALS);

      await tx.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      return this.issueTokens(tx, user, meta, 'auth.refresh');
    });
  }

  async logout(rawToken: string | undefined): Promise<void> {
    const payload = await this.verifyRefresh(rawToken).catch(() => null);
    if (!payload) return;
    await withTenant(this.prisma, payload.tenantId, (tx) =>
      tx.session.updateMany({
        where: { id: payload.sid, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    );
  }

  // ── Recuperación de contraseña (A3) ──────────────────────────────────────

  /** Paso 1: envía un código de 6 dígitos. Siempre responde igual (sin fugas). */
  async requestRecovery(input: RecoveryRequestInput, meta: RequestMeta): Promise<void> {
    const identity = await this.identityByEmail(input.email);
    if (!identity) {
      this.logger.warn(`Recuperación pedida para un correo inexistente (${input.email})`);
      return;
    }

    const code = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
    const expiresAt = new Date(Date.now() + RECOVERY_TTL_MINUTES * 60_000);

    await withTenant(this.prisma, identity.tenantId, async (tx) => {
      await tx.recoveryToken.deleteMany({ where: { userId: identity.userId, usedAt: null } });
      await tx.recoveryToken.create({
        data: { userId: identity.userId, token: await hashSecret(code), expiresAt },
      });
      await this.audit.record({
        tenantId: identity.tenantId,
        userId: identity.userId,
        action: 'auth.recovery_requested',
        resource: 'user',
        data: { ip: meta.ip ?? 'desconocida' },
      });
    });

    await this.email.send({
      to: input.email,
      subject: 'Recupera tu acceso a AKI Admin',
      text: `Hola, tu código de recuperación es ${code}. Vence en ${RECOVERY_TTL_MINUTES} minutos. Si no pediste este correo, ignóralo.`,
    });
  }

  /** Paso 2: valida el código sin consumirlo. */
  async verifyRecovery(input: RecoveryVerifyInput): Promise<void> {
    const ok = await this.checkRecoveryCode(input.email, input.code);
    if (!ok) throw new BadRequestException('Código inválido o expirado');
  }

  /** Paso 3: cambia la contraseña, marca el código y cierra las sesiones. */
  async resetRecovery(input: RecoveryResetInput, meta: RequestMeta): Promise<void> {
    const identity = await this.identityByEmail(input.email);
    if (!identity) throw new BadRequestException('Código inválido o expirado');

    await withTenant(this.prisma, identity.tenantId, async (tx) => {
      if (!(await this.hasValidRecoveryCode(tx, identity.userId, input.code))) {
        throw new BadRequestException('Código inválido o expirado');
      }
      await tx.recoveryToken.updateMany({
        where: { userId: identity.userId, usedAt: null },
        data: { usedAt: new Date() },
      });
      await tx.user.update({
        where: { id: identity.userId },
        data: { passwordHash: await hashSecret(input.newPassword) },
      });
      await tx.session.updateMany({
        where: { userId: identity.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await this.audit.record({
        tenantId: identity.tenantId,
        userId: identity.userId,
        action: 'auth.password_reset',
        resource: 'user',
        data: { ip: meta.ip ?? 'desconocida' },
      });
    });
  }

  // ── Internos ─────────────────────────────────────────────────────────────

  private async checkRecoveryCode(email: string, code: string): Promise<boolean> {
    const identity = await this.identityByEmail(email);
    if (!identity) return false;
    return withTenant(this.prisma, identity.tenantId, (tx) =>
      this.hasValidRecoveryCode(tx, identity.userId, code),
    );
  }

  private async hasValidRecoveryCode(
    tx: Prisma.TransactionClient,
    userId: string,
    code: string,
  ): Promise<boolean> {
    const token = await tx.recoveryToken.findFirst({
      where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!token) return false;
    return verifySecret(code, token.token);
  }

  private async issueTokens(
    tx: Prisma.TransactionClient,
    user: UserWithTenant,
    meta: RequestMeta,
    action: string,
  ): Promise<IssuedSession> {
    const session = await tx.session.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        expiresAt: new Date(Date.now() + this.refreshMs),
        ip: meta.ip ?? null,
        userAgent: meta.userAgent ?? null,
      },
    });
    const access: AccessTokenPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      name: user.name,
      sid: session.id,
    };
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      sid: session.id,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(access, { secret: this.accessSecret, expiresIn: this.accessTtl }),
      this.jwt.signAsync(refreshPayload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshTtl,
      }),
    ]);

    await this.audit.record({
      tenantId: user.tenantId,
      userId: user.id,
      action,
      resource: 'session',
      entityId: session.id,
      data: { ip: meta.ip ?? 'desconocida' },
    });

    return {
      accessToken,
      refreshToken,
      refreshMaxAgeMs: this.refreshMs,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug },
    };
  }

  private async verifyRefresh(rawToken: string | undefined): Promise<RefreshTokenPayload> {
    if (!rawToken) throw new UnauthorizedException('Sesión no encontrada, inicia de nuevo');
    try {
      return await this.jwt.verifyAsync<RefreshTokenPayload>(rawToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Sesión expirada, inicia de nuevo');
    }
  }

  private async identityByEmail(
    email: string,
  ): Promise<{ userId: string; tenantId: string } | null> {
    const rows = await this.prisma.$queryRaw<{ userId: string; tenantId: string }[]>`
      SELECT * FROM resolve_login_identity(${email})
    `;
    return rows[0] ?? null;
  }

  private async identityById(
    userId: string,
  ): Promise<{ userId: string; tenantId: string } | null> {
    const rows = await this.prisma.$queryRaw<{ userId: string; tenantId: string }[]>`
      SELECT * FROM resolve_user_identity(${userId})
    `;
    return rows[0] ?? null;
  }
}
