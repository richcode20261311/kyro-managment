import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

/**
 * Limitación de intentos de autenticación (fase de endurecimiento A1–A3).
 *
 * Almacén en memoria tras la interfaz `RateLimitStore`: válido para la
 * instancia única actual de la API. Los contadores se pierden al reiniciar el
 * proceso y no se comparten entre instancias; si algún día hay varias
 * instancias o colas (BullMQ), se implementa un `RateLimitStore` sobre Redis
 * sin tocar el servicio de autenticación (ver docs/OPERATIONS.md).
 *
 * Las claves se construyen con la IP real del socket (`req.ip` de Express,
 * que ignora cabeceras del cliente salvo que se configure `trust proxy`) y con
 * el identificador crudo (correo o userId), de modo que una cuenta inexistente
 * acumula los mismos intentos que una existente y las respuestas no revelan
 * nada sobre ella.
 */

const MS = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 } as const;
type Unidad = keyof typeof MS;

export interface RateLimitRule {
  /** Intentos permitidos dentro de la ventana. */
  max: number;
  /** Ventana deslizante en milisegundos. */
  windowMs: number;
  /** Duración del bloqueo al superar el máximo (temporal, nunca permanente). */
  blockMs: number;
}

export const RATE_LIMIT_MESSAGE = 'Demasiados intentos. Intenta de nuevo en unos minutos.';

/** Excepción429 con `Retry-After` (la resuelve el filtro global). */
export class RateLimitException extends HttpException {
  readonly retryAfterSec: number;

  constructor(retryAfterSec: number) {
    super(
      { statusCode: HttpStatus.TOO_MANY_REQUESTS, message: RATE_LIMIT_MESSAGE },
      HttpStatus.TOO_MANY_REQUESTS,
    );
    this.retryAfterSec = retryAfterSec;
  }
}

export interface RateLimitStore {
  /** Fecha de fin del bloqueo activo de la clave, o `null` si no está bloqueada. */
  blockedUntil(key: string, now: number): number | null;
  /** Añade un evento a la ventana; bloquea y devuelve la fecha de fin si supera el máximo. */
  record(key: string, rule: RateLimitRule, now: number): number | null;
  clear(key: string): void;
}

interface Entry {
  events: number[];
  blockedUntil: number;
}

/** Ventana deslizante en memoria, con barrido de claves caducadas. */
export class InMemoryRateLimitStore implements RateLimitStore {
  private readonly entries = new Map<string, Entry>();
  private ops = 0;

  blockedUntil(key: string, now: number): number | null {
    const entry = this.entries.get(key);
    if (!entry || entry.blockedUntil <= now) return null;
    return entry.blockedUntil;
  }

  record(key: string, rule: RateLimitRule, now: number): number | null {
    this.sweep(now);
    const entry = this.entries.get(key) ?? { events: [], blockedUntil: 0 };
    const ventana = entry.events.filter((t) => now - t < rule.windowMs);
    ventana.push(now);
    if (ventana.length >= rule.max) {
      // Se toleraron `max` intentos: bloqueo temporal; la petición actual ya
      // tuvo su respuesta, el bloqueo lo aplica el `check` de la siguiente.
      this.entries.set(key, { events: [], blockedUntil: now + rule.blockMs });
      return now + rule.blockMs;
    }
    this.entries.set(key, { events: ventana, blockedUntil: entry.blockedUntil });
    return entry.blockedUntil > now ? entry.blockedUntil : null;
  }

  clear(key: string): void {
    this.entries.delete(key);
  }

  /** Evita crecimiento indefinido: barre claves sin eventos y sin bloqueo activo. */
  private sweep(now: number): void {
    this.ops += 1;
    if (this.ops % 500 !== 0) return;
    for (const [key, entry] of this.entries) {
      if (entry.events.length === 0 && entry.blockedUntil <= now) this.entries.delete(key);
    }
  }
}

function readInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} debe ser un entero positivo (recibido: "${raw}")`);
  }
  return value;
}

function readMs(name: string, fallback: `${number}${Unidad}`): number {
  const raw = process.env[name] ?? fallback;
  const match = /^(\d+)([smhd])$/.exec(raw.trim());
  if (!match) {
    throw new Error(`Duración inválida en ${name}: "${raw}" (usa formatos como 5m, 15m, 1h)`);
  }
  return Number(match[1]) * MS[match[2] as Unidad];
}

function readRule(prefix: string, def: RateLimitRule): RateLimitRule {
  return {
    max: readInt(`RATE_LIMIT_${prefix}_MAX`, def.max),
    windowMs: readMs(`RATE_LIMIT_${prefix}_WINDOW`, `${Math.round(def.windowMs / 60_000)}m` as const),
    blockMs: readMs(`RATE_LIMIT_${prefix}_BLOCK`, `${Math.round(def.blockMs / 60_000)}m` as const),
  };
}

/**
 * Límites configurables por variables `RATE_LIMIT_<CLAVE>_{MAX,WINDOW,BLOCK}`
 * (ventana y bloqueo en formato `5m`, `15m`, `1h`), valores por defecto
 * documentados en `.env.example`.
 */
export interface RateLimitRules {
  loginIp: RateLimitRule;
  loginAcct: RateLimitRule;
  pinIp: RateLimitRule;
  pinUser: RateLimitRule;
  recoveryIp: RateLimitRule;
  recoveryAcct: RateLimitRule;
  verifyIp: RateLimitRule;
  verifyAcct: RateLimitRule;
  selectIp: RateLimitRule;
}

@Injectable()
export class RateLimitService {
  readonly rules: RateLimitRules;
  /**
   * Almacén por propiedad y no por parámetro del constructor: `RateLimitStore`
   * es una interfaz y, como argumento inyectable, se resuelve a `Object` en
   * runtime y Nest no puede inyectarlo. Si algún día se quiere sustituir por
   * un almacén Redis, se hará con un token de inyección (`@Inject(TOKEN)`).
   */
  private readonly store: RateLimitStore = new InMemoryRateLimitStore();

  constructor() {
    this.rules = {
      // A1 login por correo+contraseña.
      loginIp: readRule('LOGIN_IP', { max: 10, windowMs: 5 * MS.m, blockMs: 15 * MS.m }),
      // Umbral alto y bloqueo muy corto: un tercero no debe poder denegar
      // el acceso al propietario durante largo rato.
      loginAcct: readRule('LOGIN_ACCT', { max: 8, windowMs: 15 * MS.m, blockMs: 1 * MS.m }),
      // A2 PIN de kiosco.
      pinIp: readRule('PIN_IP', { max: 15, windowMs: 5 * MS.m, blockMs: 10 * MS.m }),
      pinUser: readRule('PIN_USER', { max: 10, windowMs: 5 * MS.m, blockMs: 2 * MS.m }),
      // A3 solicitud de recuperación (cada petición puede implicar correo).
      recoveryIp: readRule('RECOVERY_IP', { max: 5, windowMs: 15 * MS.m, blockMs: 30 * MS.m }),
      recoveryAcct: readRule('RECOVERY_ACCT', { max: 3, windowMs: 15 * MS.m, blockMs: 15 * MS.m }),
      // A3 verificación y reset: comparten presupuesto de intentos fallidos.
      verifyIp: readRule('VERIFY_IP', { max: 15, windowMs: 15 * MS.m, blockMs: 15 * MS.m }),
      verifyAcct: readRule('VERIFY_ACCT', { max: 8, windowMs: 15 * MS.m, blockMs: 15 * MS.m }),
      // Selección de restaurante tras el reto multi-tenant.
      selectIp: readRule('SELECT_IP', { max: 20, windowMs: 5 * MS.m, blockMs: 5 * MS.m }),
    };
  }

  /** Lanza `RateLimitException` si la clave está actualmente bloqueada. */
  check(key: string): void {
    const until = this.store.blockedUntil(key, Date.now());
    if (until !== null) throw new RateLimitException(retryAfter(until));
  }

  /** Cuenta un intento (fallido o de solicitud); marca bloqueo al llegar al máximo. */
  count(key: string, rule: RateLimitRule): void {
    this.store.record(key, rule, Date.now());
  }

  /** Borra el contador de la clave (p. ej. tras un inicio de sesión válido). */
  clear(key: string): void {
    this.store.clear(key);
  }
}

function retryAfter(until: number): number {
  return Math.max(1, Math.ceil((until - Date.now()) / 1000));
}

/**
 * Filtro global:429 con cabecera `Retry-After`, sin revelar nada más.
 *
 * `@Catch(RateLimitException)` es imprescindible: un filtro global sin este
 * decorador captura TODAS las excepciones y reescribiría cada400/401 como 429
 * (con `Retry-After: undefined`). Solo el limitador debe producir429.
 * Regresión automatizada en rate-limit-filter.test.ts.
 *
 * El429 sólo lleva `Retry-After` (segundos restantes): la clave, el límite
 * y la ventana jamás se revelan en la respuesta.
 */
@Catch(RateLimitException)
@Injectable()
export class RateLimitExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('RateLimit');

  catch(exception: RateLimitException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<{ url?: string }>();
    this.logger.warn(
      `429 retry-after=${exception.retryAfterSec}s path=${req.url ?? '?'}`,
    );
    res.setHeader('Retry-After', String(exception.retryAfterSec));
    res.status(HttpStatus.TOO_MANY_REQUESTS).json({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: RATE_LIMIT_MESSAGE,
    });
  }
}
