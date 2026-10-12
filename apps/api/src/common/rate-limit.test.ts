import { describe, expect, it, afterEach, vi } from 'vitest';
import {
  InMemoryRateLimitStore,
  RATE_LIMIT_MESSAGE,
  RateLimitException,
  RateLimitService,
  type RateLimitRule,
} from './rate-limit';

const regla: RateLimitRule = { max: 3, windowMs: 60_000, blockMs: 30_000 };

describe('InMemoryRateLimitStore', () => {
  afterEach(() => vi.useRealTimers());

  it('tolera `max` intentos y fija el bloqueo en el máximo-ésimo', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-11T10:00:00Z'));
    const store = new InMemoryRateLimitStore();

    expect(store.record('k', regla, Date.now())).toBeNull();
    expect(store.record('k', regla, Date.now())).toBeNull();
    // El3er intento (max) fija el bloqueo; la petición actual ya respondió,
    // el429 lo aplica el `check` de entrada de la siguiente.
    const bloqueo = store.record('k', regla, Date.now());
    expect(bloqueo).toBe(Date.now() + regla.blockMs);
    expect(store.blockedUntil('k', Date.now())).toBe(bloqueo);

    // El bloqueo expira y la clave vuelve a estar disponible.
    vi.setSystemTime(new Date('2026-10-11T10:00:31Z'));
    expect(store.blockedUntil('k', Date.now())).toBeNull();
    expect(store.record('k', regla, Date.now())).toBeNull();
  });

  it('la ventana es deslizante: los intentos viejos no cuentan', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-11T10:00:00Z'));
    const store = new InMemoryRateLimitStore();

    expect(store.record('k', regla, Date.now())).toBeNull();
    expect(store.record('k', regla, Date.now())).toBeNull();
    // Pasada la ventana de60s, esos dos intentos ya no cuentan.
    vi.setSystemTime(new Date('2026-10-11T10:01:01Z'));
    expect(store.record('k', regla, Date.now())).toBeNull();
    expect(store.blockedUntil('k', Date.now())).toBeNull();
  });

  it('las claves son independientes (IP de una no afecta a la otra)', () => {
    const store = new InMemoryRateLimitStore();
    store.record('ip:a', regla, Date.now());
    store.record('ip:a', regla, Date.now());
    store.record('ip:a', regla, Date.now());
    expect(store.record('ip:b', regla, Date.now())).toBeNull();
    expect(store.blockedUntil('ip:b', Date.now())).toBeNull();
  });

  it('clear reinicia el contador de la clave', () => {
    const store = new InMemoryRateLimitStore();
    store.record('k', regla, Date.now());
    store.record('k', regla, Date.now());
    store.clear('k');
    expect(store.record('k', regla, Date.now())).toBeNull();
    expect(store.record('k', regla, Date.now())).toBeNull();
  });

  it('el barrido no borra claves con bloqueo activo', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-11T10:00:00Z'));
    const store = new InMemoryRateLimitStore();
    for (let i = 0; i < 500; i += 1) store.record(`otra:${i}`, regla, Date.now());
    store.record('k', regla, Date.now());
    store.record('k', regla, Date.now());
    store.record('k', regla, Date.now());
    store.record('k', regla, Date.now()); // bloquea k
    // Fuerza el barrido (ocurre cada500 ops).
    for (let i = 0; i < 500; i += 1) store.record(`otra2:${i}`, regla, Date.now());
    expect(store.blockedUntil('k', Date.now())).not.toBeNull();
  });
});

describe('RateLimitService (configuración por entorno)', () => {
  afterEach(() => {
    delete process.env['RATE_LIMIT_LOGIN_IP_MAX'];
    delete process.env['RATE_LIMIT_LOGIN_IP_WINDOW'];
    delete process.env['RATE_LIMIT_LOGIN_IP_BLOCK'];
    delete process.env['RATE_LIMIT_LOGIN_IP_MAL'];
  });

  it('lee MAX, WINDOW y BLOCK del entorno con formato de duración', () => {
    process.env['RATE_LIMIT_LOGIN_IP_MAX'] = '7';
    process.env['RATE_LIMIT_LOGIN_IP_WINDOW'] = '2m';
    process.env['RATE_LIMIT_LOGIN_IP_BLOCK'] = '90s';
    const svc = new RateLimitService();
    expect(svc.rules.loginIp).toEqual({ max: 7, windowMs: 120_000, blockMs: 90_000 });
  });

  it('los valores por defecto son prudentes', () => {
    const svc = new RateLimitService();
    expect(svc.rules.loginIp.max).toBe(10);
    expect(svc.rules.loginAcct.blockMs).toBe(60_000); // bloqueo corto de cuenta
    expect(svc.rules.recoveryIp.max).toBe(5);
    expect(svc.rules.verifyAcct.max).toBe(8);
  });

  it('rechaza configuraciones inválidas en lugar de ignorarlas', () => {
    process.env['RATE_LIMIT_LOGIN_IP_MAX'] = 'no-numero';
    expect(() => new RateLimitService()).toThrow(/RATE_LIMIT_LOGIN_IP_MAX/);
    process.env['RATE_LIMIT_LOGIN_IP_MAX'] = '5';
    process.env['RATE_LIMIT_LOGIN_IP_WINDOW'] = 'abc';
    expect(() => new RateLimitService()).toThrow(/Duración inválida/);
  });

  it('check lanza429 con Retry-After y mensaje genérico', () => {
    const svc = new RateLimitService();
    for (let i = 0; i < svc.rules.loginIp.max; i += 1) svc.count('login:ip:1.1.1.1', svc.rules.loginIp);
    let error: unknown;
    try {
      svc.check('login:ip:1.1.1.1');
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(RateLimitException);
    const ex = error as RateLimitException;
    expect(ex.getStatus()).toBe(429);
    expect(ex.retryAfterSec).toBeGreaterThan(0);
    expect(ex.message).toBe(RATE_LIMIT_MESSAGE);
  });

  it('sin bloqueo, check no lanza nada', () => {
    const svc = new RateLimitService();
    svc.count('login:ip:2.2.2.2', svc.rules.loginIp);
    expect(() => svc.check('login:ip:2.2.2.2')).not.toThrow();
  });
});
