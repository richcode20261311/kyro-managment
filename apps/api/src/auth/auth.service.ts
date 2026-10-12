import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'node:crypto';
import type { Prisma, Tenant, User } from '@prisma/client';
import type {
  LoginInput,
  PinLoginInput,
  RecoveryResetInput,
  RecoveryRequestInput,
  RecoveryVerifyInput,
  SedeOption,
  TenantSelectInput,
  TenantSelectionChallenge,
} from '@aki/shared';
import { AuditService } from '../audit/audit.service';
import { parseDuration, readDuration, type Duration } from '../common/duration';
import { RateLimitService } from '../common/rate-limit';
import { hashSecret, verifySecret } from '../common/password.util';
import { EMAIL_PROVIDER, type EmailProvider } from '../email/email.provider';
import { PrismaService } from '../prisma.module';
import { withTenant } from '../prisma.with-tenant';
import type { AccessTokenPayload, RefreshTokenPayload, RequestMeta } from './token.types';

export const REFRESH_COOKIE = 'aki_refresh';
/**
 * Path `/` (no `/api/auth`): el middleware de Next debe ver la cookie en las
 * peticiones de página (/sede, /panel…) para decidir si hay sesión.
 */
export const REFRESH_COOKIE_PATH = '/';

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

/** Fila de `resolve_login_identity`: el mismo correo puede dar 0, 1 o N filas. */
interface EmailIdentity {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
}

/** Firmado del reto de selección: 5 minutos y solo con lo verificado. */
interface TenantSelectClaims {
  kind: 'tenant_select';
  email: string;
  tenants: string[];
}

const SELECTION_TTL = '5m';

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
    private readonly rateLimit: RateLimitService,
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

  /**
   * A1 (correo + contraseña). El mismo correo puede existir en varios
   * restaurantes (unicidad por tenant), así que se resuelven todas las
   * identidades y se verifica la contraseña en cada candidato:
   *   0 coincidencias → 401 genérico (no revela si el correo existe);
   *   1 coincidencia  → sesión directa (flujo actual de AKI, sin cambios);
   *   N coincidencias → reto con los restaurantes donde SÍ cuadró la
   *                     contraseña + token firmado de corta vida para elegir.
   * La lista de restaurantes solo sale del servidor tras validar la contraseña:
   * no hay endpoint público que asocie correos con restaurantes.
   */
  async login(
    input: LoginInput,
    meta: RequestMeta,
  ): Promise<IssuedSession | TenantSelectionChallenge> {
    // Claves por IP y por correo crudo: se comprueban ANTES de tocar la base
    // y se cuentan también para correos inexistentes, así los límites no
    // revelan si la cuenta existe ni permiten distinguir ambos casos.
    const ipKey = `login:ip:${meta.ip ?? 'desconocida'}`;
    const acctKey = `login:acct:${input.email.trim().toLowerCase()}`;
    this.rateLimit.check(ipKey);
    this.rateLimit.check(acctKey);

    const identities = await this.identitiesByEmail(input.email);
    const matches: EmailIdentity[] = [];
    for (const identity of identities) {
      if (await this.passwordMatches(identity, input.password)) matches.push(identity);
    }
    if (matches.length === 0) {
      // Se incrementan AMBOS contadores; el bloqueo, si se alcanza el máximo,
      // lo aplicará el `check` de entrada de la siguiente petición.
      this.rateLimit.count(ipKey, this.rateLimit.rules.loginIp);
      this.rateLimit.count(acctKey, this.rateLimit.rules.loginAcct);
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    // Inicio válido: el contador de la cuenta vuelve a cero.
    this.rateLimit.clear(acctKey);
    if (matches.length === 1) {
      const [unico] = matches;
      if (!unico) throw new UnauthorizedException(INVALID_CREDENTIALS);
      return this.startSession(unico, meta);
    }

    const selectionToken = await this.jwt.signAsync<TenantSelectClaims>(
      {
        kind: 'tenant_select',
        email: input.email,
        tenants: matches.map((identity) => identity.tenantId),
      },
      { secret: this.accessSecret, expiresIn: SELECTION_TTL },
    );
    return {
      requiresTenantSelection: true,
      tenants: matches.map((identity) => ({
        id: identity.tenantId,
        name: identity.tenantName,
        slug: identity.tenantSlug,
      })),
      selectionToken,
    };
  }

  /**
   * Completa A1 cuando hubo selección: el token firmado atestigua que la
   * contraseña ya se verificó (5 minutos) y lista los tenants permitidos; el
   * `tenantId` del cliente solo se acepta si está en esa lista, y además el
   * usuario debe seguir activo en ese tenant (reconsulta con la función de
   * identidad). La contraseña no se reenvía en este segundo paso.
   */
  async loginSelect(input: TenantSelectInput, meta: RequestMeta): Promise<IssuedSession> {
    const ipKey = `select:ip:${meta.ip ?? 'desconocida'}`;
    this.rateLimit.check(ipKey);

    let claims: TenantSelectClaims;
    try {
      claims = await this.jwt.verifyAsync<TenantSelectClaims>(input.selectionToken, {
        secret: this.accessSecret,
      });
    } catch {
      // Cuenta el intento: el token no sirve para nada más que elegir tenant.
      this.rateLimit.count(ipKey, this.rateLimit.rules.selectIp);
      throw new UnauthorizedException('La selección venció, ingresa de nuevo');
    }
    if (
      claims.kind !== 'tenant_select' ||
      typeof claims.email !== 'string' ||
      !Array.isArray(claims.tenants) ||
      !claims.tenants.includes(input.tenantId)
    ) {
      this.rateLimit.count(ipKey, this.rateLimit.rules.selectIp);
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const identity = (await this.identitiesByEmail(claims.email)).find(
      (candidate) => candidate.tenantId === input.tenantId,
    );
    if (!identity) {
      this.rateLimit.count(ipKey, this.rateLimit.rules.selectIp);
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    return this.startSession(identity, meta);
  }

  async pinLogin(input: PinLoginInput, meta: RequestMeta): Promise<IssuedSession> {
    // Clave por usuario (no por correo: aquí solo hay userId) e IP. El fallo
    // cuenta igual que en login; el acierto limpia el contador del usuario.
    const ipKey = `pin:ip:${meta.ip ?? 'desconocida'}`;
    const userKey = `pin:user:${input.userId}`;
    this.rateLimit.check(ipKey);
    this.rateLimit.check(userKey);

    const identity = await this.identityById(input.userId);
    if (!identity) {
      this.rateLimit.count(ipKey, this.rateLimit.rules.pinIp);
      this.rateLimit.count(userKey, this.rateLimit.rules.pinUser);
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    return withTenant(this.prisma, identity.tenantId, async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: input.userId },
        include: { tenant: true },
      });
      if (!user?.active || !user.pin || !(await verifySecret(input.pin, user.pin))) {
        this.rateLimit.count(ipKey, this.rateLimit.rules.pinIp);
        this.rateLimit.count(userKey, this.rateLimit.rules.pinUser);
        throw new UnauthorizedException(INVALID_CREDENTIALS);
      }
      this.rateLimit.clear(userKey);
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

  /**
   * Sedes activas del tenant autenticado (A4). El tenant llega ya validado
   * por el token (lo resolvió el guard), nunca del cliente. Corre dentro de
   * `withTenant`: las políticas RLS bloquean de todas formas cualquier intento
   * de leer sedes de otro tenant, y solo devolvemos lo que la interfaz usa.
   */
  async sedes(tenantId: string): Promise<SedeOption[]> {
    return withTenant(this.prisma, tenantId, (tx) =>
      tx.sede.findMany({
        where: { tenantId, active: true },
        select: { id: true, name: true, active: true },
        orderBy: { name: 'asc' },
      }),
    );
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

  /**
   * Paso 1: envía un código de 6 dígitos generado con CSPRNG. Siempre responde
   * igual (sin fugas). Si el correo existe en varios restaurantes, cada cuenta
   * recibe su propio código nombrando el restaurante: solo el dueño del buzón
   * puede leerlos, y así el paso 2/3 actúa sobre la cuenta cuyo código se
   * introduzca.
   *
   * Cooldown: mientras exista un código válido sin usar para la cuenta NO se
   * borra, NO se crea otro ni se envía otro correo. Así una petición repetida
   * no invalida el código vigente ni provoca envíos masivos. Si el usuario
   * pierde el correo, debe esperar a que venza (≤15 min) para pedir otro.
   */
  async requestRecovery(input: RecoveryRequestInput, meta: RequestMeta): Promise<void> {
    const ipKey = `recovery:ip:${meta.ip ?? 'desconocida'}`;
    const acctKey = `recovery:acct:${input.email.trim().toLowerCase()}`;
    this.rateLimit.check(ipKey);
    this.rateLimit.check(acctKey);
    this.rateLimit.count(ipKey, this.rateLimit.rules.recoveryIp);
    this.rateLimit.count(acctKey, this.rateLimit.rules.recoveryAcct);

    const identities = await this.identitiesByEmail(input.email);
    if (identities.length === 0) {
      this.logger.warn(`Recuperación pedida para un correo inexistente (${input.email})`);
      return;
    }
    const esMultiple = identities.length > 1;

    for (const identity of identities) {
      const ahora = new Date();
      const vigente = await withTenant(this.prisma, identity.tenantId, (tx) =>
        tx.recoveryToken.findFirst({
          where: { userId: identity.userId, usedAt: null, expiresAt: { gt: ahora } },
          orderBy: { createdAt: 'desc' },
        }),
      );
      // Cooldown: código vigente intacto, sin correo nuevo.
      if (vigente) continue;

      // Limpieza de tokens usados o vencidos de ESTA cuenta (nunca de otras).
      await withTenant(this.prisma, identity.tenantId, (tx) =>
        tx.recoveryToken.deleteMany({
          where: {
            userId: identity.userId,
            OR: [{ usedAt: { not: null } }, { expiresAt: { lte: ahora } }],
          },
        }),
      );

      const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
      const expiresAt = new Date(Date.now() + RECOVERY_TTL_MINUTES * 60_000);

      await withTenant(this.prisma, identity.tenantId, async (tx) => {
        await tx.recoveryToken.create({
          data: {
            userId: identity.userId,
            token: await hashSecret(this.recoveryCodeSecret(identity.userId, code)),
            expiresAt,
          },
        });
        await this.audit.record({
          tenantId: identity.tenantId,
          userId: identity.userId,
          action: 'auth.recovery_requested',
          resource: 'user',
          data: { ip: meta.ip ?? 'desconocida' },
        });
      });

      try {
        await this.email.send({
          to: input.email,
          subject: esMultiple
            ? `Recupera tu acceso a AKI Admin · ${identity.tenantName}`
            : 'Recupera tu acceso a AKI Admin',
          text: esMultiple
            ? `Hola, para ${identity.tenantName} tu código de recuperación es ${code}. Vence en ${RECOVERY_TTL_MINUTES} minutos. Si no pediste este correo, ignóralo.`
            : `Hola, tu código de recuperación es ${code}. Vence en ${RECOVERY_TTL_MINUTES} minutos. Si no pediste este correo, ignóralo.`,
        });
      } catch (error) {
        // Solicitud fallida: retira el código recién creado para no dejar la
        // cuenta en un estado que el usuario no puede usar.
        await withTenant(this.prisma, identity.tenantId, (tx) =>
          tx.recoveryToken.deleteMany({ where: { userId: identity.userId, usedAt: null } }),
        );
        this.logger.warn(`No se pudo enviar el correo de recuperación a ${input.email}`);
        throw error;
      }
    }
  }

  /**
   * Paso 2: valida el código sin consumirlo (en la cuenta cuyo código sea).
   * Comparte con el paso 3 el presupuesto de intentos fallidos por cuenta e IP.
   */
  async verifyRecovery(input: RecoveryVerifyInput, meta: RequestMeta): Promise<void> {
    const ipKey = `verify:ip:${meta.ip ?? 'desconocida'}`;
    const acctKey = `verify:acct:${input.email.trim().toLowerCase()}`;
    this.rateLimit.check(ipKey);
    this.rateLimit.check(acctKey);

    const identities = await this.identitiesByEmail(input.email);
    for (const identity of identities) {
      if (await this.checkRecoveryCode(identity, input.code)) {
        this.rateLimit.clear(acctKey);
        return;
      }
    }
    this.rateLimit.count(ipKey, this.rateLimit.rules.verifyIp);
    this.rateLimit.count(acctKey, this.rateLimit.rules.verifyAcct);
    throw new BadRequestException('Código inválido o expirado');
  }

  /**
   * Paso 3: cambia la contraseña de la cuenta cuyo código sea válido, marca el
   * código y cierra sus sesiones. Con varios restaurantes, cada identidad se
   * evalúa en su propia transacción y solo la que valida el código se modifica.
   *
   * Consumo atómico: el token se marca como usado con un `updateMany`
   * condicionado a `usedAt: null`; si otra transacción concurrente lo ganó
   * (count 0), esta solicitud se rechaza sin tocar la cuenta. Dos resets
   * simultáneos con el mismo código cambian la contraseña exactamente una vez.
   */
  async resetRecovery(input: RecoveryResetInput, meta: RequestMeta): Promise<void> {
    const ipKey = `verify:ip:${meta.ip ?? 'desconocida'}`;
    const acctKey = `verify:acct:${input.email.trim().toLowerCase()}`;
    this.rateLimit.check(ipKey);
    this.rateLimit.check(acctKey);

    const identities = await this.identitiesByEmail(input.email);

    for (const identity of identities) {
      const aplicado = await withTenant(this.prisma, identity.tenantId, async (tx) => {
        const token = await tx.recoveryToken.findFirst({
          where: { userId: identity.userId, usedAt: null, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
        });
        if (!token) return false;
        if (
          !(await verifySecret(this.recoveryCodeSecret(identity.userId, input.code), token.token))
        ) {
          return false;
        }
        const consumido = await tx.recoveryToken.updateMany({
          where: { id: token.id, usedAt: null },
          data: { usedAt: new Date() },
        });
        // Otra transacción lo consumió primero: esta solicitud no aplica.
        if (consumido.count !== 1) return false;
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
        return true;
      });
      if (aplicado) {
        this.rateLimit.clear(acctKey);
        return;
      }
    }
    this.rateLimit.count(ipKey, this.rateLimit.rules.verifyIp);
    this.rateLimit.count(acctKey, this.rateLimit.rules.verifyAcct);
    throw new BadRequestException('Código inválido o expirado');
  }

  // ── Internos ─────────────────────────────────────────────────────────────

  /**
   * Vincula el código a la identidad (userId) y a la finalidad exacta
   * (recuperación de contraseña): lo que se hashea y guarda no es el código
   * solo, sino el prefijo `recovery:<userId>:<código>`. Un código no puede
   * usarse para otra cuenta ni para nada más, aunque el atacante lo sepa.
   */
  private recoveryCodeSecret(userId: string, code: string): string {
    return `recovery:${userId}:${code}`;
  }

  private async checkRecoveryCode(identity: EmailIdentity, code: string): Promise<boolean> {
    return withTenant(this.prisma, identity.tenantId, (tx) =>
      this.hasValidRecoveryCode(tx, identity.userId, code),
    );
  }

  /** Verifica la contraseña de la identidad dentro de su tenant. */
  private async passwordMatches(identity: EmailIdentity, password: string): Promise<boolean> {
    const user = await withTenant(this.prisma, identity.tenantId, (tx) =>
      tx.user.findUnique({ where: { id: identity.userId } }),
    );
    if (!user?.active || !user.passwordHash) return false;
    return verifySecret(password, user.passwordHash);
  }

  /** Abre la sesión ya verificada (la validación de credenciales hizo el llamador). */
  private async startSession(identity: EmailIdentity, meta: RequestMeta): Promise<IssuedSession> {
    return withTenant(this.prisma, identity.tenantId, async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: identity.userId },
        include: { tenant: true },
      });
      if (!user?.active || !user.passwordHash) throw new UnauthorizedException(INVALID_CREDENTIALS);
      return this.issueTokens(tx, user, meta, 'auth.login');
    });
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
    return verifySecret(this.recoveryCodeSecret(userId, code), token.token);
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
      const payload = await this.jwt.verifyAsync<RefreshTokenPayload>(rawToken, {
        secret: this.refreshSecret,
      });
      // Un payload incompleto no es un refresh válido (defensa ante tokens
      // firmados con otro fin, p. ej. el reto de selección de restaurante).
      if (!payload.sub || !payload.tenantId || !payload.sid) {
        throw new Error('payload de refresh incompleto');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Sesión expirada, inicia de nuevo');
    }
  }

  /**
   * Correo → identidades (0, 1 o N). SECURITY DEFINER: corre sin contexto de
   * tenant porque A1/A3 no lo tienen todavía; solo expone id, tenant y nombre
   * público del restaurante, y solo para cuentas activas en tenants que
   * pueden entrar (PRUEBA/ACTIVO).
   */
  private async identitiesByEmail(email: string): Promise<EmailIdentity[]> {
    return this.prisma.$queryRaw<EmailIdentity[]>`
      SELECT * FROM resolve_login_identity(${email})
    `;
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
