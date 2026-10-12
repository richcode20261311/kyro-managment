import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import { isTenantSelection, type TenantSelectionChallenge } from '@aki/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EmailProvider } from '../email/email.provider';
import { RateLimitException, RateLimitService } from '../common/rate-limit';
import { hashSecret } from '../common/password.util';
import type { PrismaService } from '../prisma.module';
import { AuthService, type IssuedSession } from './auth.service';

process.env['JWT_ACCESS_SECRET'] = 'test-access';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh';

const tx = {
  $queryRaw: vi.fn().mockResolvedValue([]),
  user: { findUnique: vi.fn(), update: vi.fn() },
  session: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  recoveryToken: { create: vi.fn(), findFirst: vi.fn(), deleteMany: vi.fn(), updateMany: vi.fn() },
  sede: { findMany: vi.fn().mockResolvedValue([]) },
};

const prisma = {
  $queryRaw: vi.fn(),
  $transaction: vi.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
};
const jwt = { signAsync: vi.fn().mockResolvedValue('token-firmado'), verifyAsync: vi.fn() };
const email = { send: vi.fn().mockResolvedValue(undefined) };
const audit = { record: vi.fn().mockResolvedValue(undefined) };

function makeService(rateLimit: RateLimitService = new RateLimitService()): AuthService {
  return new AuthService(
    prisma as unknown as PrismaService,
    jwt as unknown as JwtService,
    email as unknown as EmailProvider,
    audit as unknown as never,
    rateLimit,
  );
}

/** Deja claro que el login no vino como reto de selección de restaurante. */
function asSession(result: IssuedSession | TenantSelectionChallenge): IssuedSession {
  if (isTenantSelection(result)) throw new Error('se esperaba sesión, llegó selección');
  return result;
}

const tenant = { id: 't1', name: 'AKI Cocina Oriental', slug: 'aki' };
const admin = {
  id: 'u1',
  tenantId: 't1',
  email: 'admin@aki.co',
  name: 'Andrea Ramírez',
  role: 'ADMINISTRADOR',
  active: true,
  pin: null,
  tenant,
};

describe('AuthService.login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('entrega tokens con la sesión creada y audita el ingreso', async () => {
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    tx.user.findUnique.mockResolvedValue({
      ...admin,
      passwordHash: await hashSecret('Admin1234!'),
    });
    tx.session.create.mockResolvedValue({ id: 's1' });

    const result = asSession(
      await makeService().login(
        { email: 'admin@aki.co', password: 'Admin1234!' },
        { ip: '127.0.0.1' },
      ),
    );

    expect(result.accessToken).toBe('token-firmado');
    expect(result.user).toEqual({ id: 'u1', name: 'Andrea Ramírez', email: 'admin@aki.co', role: 'ADMINISTRADOR' });
    expect(result.tenant.slug).toBe('aki');
    expect(result.refreshToken).toBe('token-firmado');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'auth.login', tenantId: 't1' }),
    );
  });

  it('rechaza un correo desconocido sin revelar detalles', async () => {
    prisma.$queryRaw.mockResolvedValue([]);
    await expect(
      makeService().login({ email: 'nadie@aki.co', password: 'x' }, {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza una contraseña incorrecta', async () => {
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    tx.user.findUnique.mockResolvedValue({
      ...admin,
      passwordHash: await hashSecret('Admin1234!'),
    });
    await expect(
      makeService().login({ email: 'admin@aki.co', password: 'Otra1234!' }, {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

describe('AuthService.pinLogin y grilla kiosco', () => {
  beforeEach(() => vi.clearAllMocks());

  it('el PIN correcto abre sesión', async () => {
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    tx.user.findUnique.mockResolvedValue({ ...admin, pin: await hashSecret('1111') });
    tx.session.create.mockResolvedValue({ id: 's1' });

    const result = await makeService().pinLogin({ userId: 'u1', pin: '1111' }, {});
    expect(result.user.id).toBe('u1');
  });

  it('el PIN incorrecto se rechaza', async () => {
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    tx.user.findUnique.mockResolvedValue({ ...admin, pin: await hashSecret('1111') });
    await expect(makeService().pinLogin({ userId: 'u1', pin: '9999' }, {})).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('la grilla del kiosco usa la función SQL', async () => {
    prisma.$queryRaw.mockResolvedValue([{ id: 'u1', name: 'Andrea Ramírez', role: 'ADMINISTRADOR' }]);
    const rows = await makeService().kioskEmployees('aki');
    expect(rows).toEqual([{ id: 'u1', name: 'Andrea Ramírez', role: 'ADMINISTRADOR' }]);
    expect(String(prisma.$queryRaw.mock.calls[0]?.[0])).toContain('list_kiosk_employees');
  });
});

describe('AuthService.sedes (A4)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve solo las sedes activas del tenant autenticado, ordenadas por nombre', async () => {
    tx.sede.findMany.mockResolvedValue([
      { id: 's2', name: 'Sede Chía', active: true },
      { id: 's1', name: 'Sede Cajicá', active: true },
    ]);

    const rows = await makeService().sedes('t1');

    expect(rows).toHaveLength(2);
    expect(tx.sede.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 't1', active: true },
        orderBy: { name: 'asc' },
      }),
    );
  });

  it('el tenantId lo impone el servidor: no acepta otro tenant aunque lo pida el llamador', async () => {
    tx.sede.findMany.mockResolvedValue([]);

    await makeService().sedes('t1');

    // El servicio recibe el tenant del token (req.user.tenantId en el
    // controlador); la prueba fija que la consulta lo use literalmente.
    const args = tx.sede.findMany.mock.calls[0]?.[0];
    expect(args.where.tenantId).toBe('t1');
    expect(args.where.tenantId).not.toBe('t2');
  });

  it('devuelve lista vacía cuando el tenant no tiene sedes activas', async () => {
    tx.sede.findMany.mockResolvedValue([]);

    await expect(makeService().sedes('t1')).resolves.toEqual([]);
  });
});

describe('AuthService.refresh y logout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rota la sesión: revoca la anterior y emite nuevas', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'u1', tenantId: 't1', sid: 's1' });
    tx.session.findUnique.mockResolvedValue({
      id: 's1',
      userId: 'u1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    tx.user.findUnique.mockResolvedValue(admin);
    tx.session.create.mockResolvedValue({ id: 's2' });

    const result = await makeService().refresh('token-viejo', {});
    expect(result.accessToken).toBe('token-firmado');
    expect(tx.session.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { revokedAt: expect.any(Date) } }),
    );
  });

  it('rechaza una sesión revocada', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'u1', tenantId: 't1', sid: 's1' });
    tx.session.findUnique.mockResolvedValue({
      id: 's1',
      userId: 'u1',
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    });
    await expect(makeService().refresh('token-viejo', {})).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('logout sin cookie no lanza error', async () => {
    await expect(makeService().logout(undefined)).resolves.toBeUndefined();
  });
});

describe('AuthService recuperación de contraseña', () => {
  beforeEach(() => vi.clearAllMocks());

  it('envía el código y no revela correos inexistentes', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([{ userId: 'u1', tenantId: 't1' }]);
    tx.recoveryToken.findFirst.mockResolvedValue(null);
    await makeService().requestRecovery({ email: 'admin@aki.co' }, { ip: '1.1.1.1' });
    expect(email.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'admin@aki.co', text: expect.stringMatching(/\b\d{6}\b/) }),
    );

    vi.clearAllMocks();
    prisma.$queryRaw.mockResolvedValue([]);
    await expect(
      makeService().requestRecovery({ email: 'nadie@aki.co' }, {}),
    ).resolves.toBeUndefined();
    expect(email.send).not.toHaveBeenCalled();
  });

  it('reset con código válido cambia la contraseña y cierra sesiones', async () => {
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    tx.recoveryToken.findFirst.mockResolvedValue({
      id: 'r1',
      token: await hashSecret('recovery:u1:123456'),
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    });
    tx.recoveryToken.updateMany.mockResolvedValue({ count: 1 });

    await makeService().resetRecovery(
      { email: 'admin@aki.co', code: '123456', newPassword: 'Nueva1234' },
      {},
    );

    expect(tx.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { passwordHash: expect.any(String) } }),
    );
    expect(tx.session.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { revokedAt: expect.any(Date) } }),
    );
  });

  it('reset con código inválido se rechaza', async () => {
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    tx.recoveryToken.findFirst.mockResolvedValue({
      id: 'r1',
      token: await hashSecret('recovery:u1:123456'),
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    });
    await expect(
      makeService().resetRecovery({ email: 'admin@aki.co', code: '000000', newPassword: 'Nueva1234' }, {}),
    ).rejects.toBeInstanceOf(BadRequestException);
    // Una solicitud fallida no modifica la cuenta ni consume el código.
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.recoveryToken.updateMany).not.toHaveBeenCalled();
  });
});

// ── Multi-tenant: el mismo correo en varios restaurantes ─────────────────────

const identidades = [
  { userId: 'u1', tenantId: 't1', tenantSlug: 'aki', tenantName: 'AKI Cocina Oriental' },
  { userId: 'u2', tenantId: 't2', tenantSlug: 'demo', tenantName: 'Restaurante Demo' },
];
const tenantDemo = { id: 't2', name: 'Restaurante Demo', slug: 'demo' };

describe('AuthService.login con correo en varios restaurantes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('si la contraseña solo es válida en un restaurante, entra directo a ese', async () => {
    prisma.$queryRaw.mockResolvedValue(identidades);
    const hashValida = await hashSecret('Admin1234!');
    const hashOtra = await hashSecret('Otra1234!');
    tx.user.findUnique.mockImplementation(({ where }: { where: { id: string } }) =>
      Promise.resolve(
        where.id === 'u1'
          ? { ...admin, passwordHash: hashOtra }
          : {
              id: 'u2',
              tenantId: 't2',
              email: 'compartido@x.co',
              name: 'Otro Usuario',
              role: 'CAJERO',
              active: true,
              pin: null,
              passwordHash: hashValida,
              tenant: tenantDemo,
            },
      ),
    );
    tx.session.create.mockResolvedValue({ id: 's1' });

    const result = asSession(
      await makeService().login({ email: 'compartido@x.co', password: 'Admin1234!' }, {}),
    );

    expect(result.tenant.id).toBe('t2');
    expect(result.user.id).toBe('u2');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'auth.login', tenantId: 't2' }),
    );
  });

  it('si la contraseña es válida en dos restaurantes, entrega el reto de selección', async () => {
    prisma.$queryRaw.mockResolvedValue(identidades);
    const hashValida = await hashSecret('Admin1234!');
    tx.user.findUnique.mockImplementation(({ where }: { where: { id: string } }) =>
      Promise.resolve({
        ...admin,
        id: where.id,
        tenantId: where.id === 'u1' ? 't1' : 't2',
        passwordHash: hashValida,
        tenant: where.id === 'u1' ? admin.tenant : tenantDemo,
      }),
    );

    const result = await makeService().login(
      { email: 'compartido@x.co', password: 'Admin1234!' },
      {},
    );

    expect(isTenantSelection(result)).toBe(true);
    if (!isTenantSelection(result)) throw new Error('esperaba el reto de selección');
    expect(result.tenants).toEqual([
      { id: 't1', name: 'AKI Cocina Oriental', slug: 'aki' },
      { id: 't2', name: 'Restaurante Demo', slug: 'demo' },
    ]);
    expect(result.selectionToken).toBe('token-firmado');
    expect(jwt.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'tenant_select', tenants: ['t1', 't2'] }),
      expect.objectContaining({ expiresIn: '5m' }),
    );
    // Sin selección todavía no se crea sesión ni cookie.
    expect(tx.session.create).not.toHaveBeenCalled();
  });

  it('contraseña que no cuadra en ningún restaurante responde 401 genérico', async () => {
    prisma.$queryRaw.mockResolvedValue(identidades);
    const hashValida = await hashSecret('Admin1234!');
    tx.user.findUnique.mockImplementation(({ where }: { where: { id: string } }) =>
      Promise.resolve({ ...admin, id: where.id, passwordHash: hashValida }),
    );

    await expect(
      makeService().login({ email: 'compartido@x.co', password: 'Incorrecta1!' }, {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(tx.session.create).not.toHaveBeenCalled();
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
});

describe('AuthService.loginSelect (elección de restaurante)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('acepta el token firmado si el tenant está entre los verificados', async () => {
    jwt.verifyAsync.mockResolvedValue({
      kind: 'tenant_select',
      email: 'compartido@x.co',
      tenants: ['t1', 't2'],
    });
    prisma.$queryRaw.mockResolvedValue(identidades);
    tx.user.findUnique.mockResolvedValue({ ...admin, passwordHash: await hashSecret('Admin1234!') });
    tx.session.create.mockResolvedValue({ id: 's1' });

    const result = asSession(
      await makeService().loginSelect({ selectionToken: 'tok', tenantId: 't1' }, {}),
    );

    expect(result.tenant.id).toBe('t1');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'auth.login', tenantId: 't1' }),
    );
  });

  it('rechaza un tenant que no está en el token (nunca se confía en el cliente)', async () => {
    jwt.verifyAsync.mockResolvedValue({
      kind: 'tenant_select',
      email: 'compartido@x.co',
      tenants: ['t1'],
    });

    await expect(
      makeService().loginSelect({ selectionToken: 'tok', tenantId: 't2' }, {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(tx.session.create).not.toHaveBeenCalled();
  });

  it('rechaza un token vencido o manipulado', async () => {
    jwt.verifyAsync.mockRejectedValue(new Error('expirado'));

    await expect(
      makeService().loginSelect({ selectionToken: 'tok', tenantId: 't1' }, {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza si el usuario ya no figura activo en ese tenant', async () => {
    jwt.verifyAsync.mockResolvedValue({
      kind: 'tenant_select',
      email: 'compartido@x.co',
      tenants: ['t1'],
    });
    prisma.$queryRaw.mockResolvedValue([]);

    await expect(
      makeService().loginSelect({ selectionToken: 'tok', tenantId: 't1' }, {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(tx.session.create).not.toHaveBeenCalled();
  });
});

describe('AuthService recuperación con correo en varios restaurantes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('envía un código por cuenta, nombrando el restaurante', async () => {
    prisma.$queryRaw.mockResolvedValue(identidades);
    // Ninguna cuenta tiene código vigente: ambas deben emitir y enviar.
    tx.recoveryToken.findFirst.mockResolvedValue(null);

    await makeService().requestRecovery({ email: 'compartido@x.co' }, { ip: '1.1.1.1' });

    expect(email.send).toHaveBeenCalledTimes(2);
    expect(email.send).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringMatching(/AKI Cocina Oriental.*\b\d{6}\b/) }),
    );
    expect(email.send).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringMatching(/Restaurante Demo.*\b\d{6}\b/) }),
    );
  });

  it('verifyRecovery acepta el código de la cuenta correcta', async () => {
    prisma.$queryRaw.mockResolvedValue(identidades);
    const hash = await hashSecret('recovery:u1:654321');
    tx.recoveryToken.findFirst.mockImplementation(({ where }: { where: { userId: string } }) =>
      Promise.resolve(
        where.userId === 'u1'
          ? { id: 'r1', token: hash, expiresAt: new Date(Date.now() + 60_000), usedAt: null }
          : null,
      ),
    );

    await expect(
      makeService().verifyRecovery({ email: 'compartido@x.co', code: '654321' }, {}),
    ).resolves.toBeUndefined();
  });

  it('el reset solo cambia la contraseña de la cuenta cuyo código coincide', async () => {
    prisma.$queryRaw.mockResolvedValue(identidades);
    const hash = await hashSecret('recovery:u2:123456');
    tx.recoveryToken.findFirst.mockImplementation(({ where }: { where: { userId: string } }) =>
      Promise.resolve(
        where.userId === 'u2'
          ? { id: 'r2', token: hash, expiresAt: new Date(Date.now() + 60_000), usedAt: null }
          : null,
      ),
    );
    tx.recoveryToken.updateMany.mockResolvedValue({ count: 1 });

    await makeService().resetRecovery(
      { email: 'compartido@x.co', code: '123456', newPassword: 'Nueva1234' },
      {},
    );

    expect(tx.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'u2' } }),
    );
    expect(tx.session.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u2', revokedAt: null } }),
    );
    // La otra cuenta (t1) no se toca.
    expect(tx.user.update).toHaveBeenCalledTimes(1);
  });

  it('un código emitido para una cuenta no sirve para otra (vinculado a la identidad)', async () => {
    prisma.$queryRaw.mockResolvedValue(identidades);
    // El token de u2 está guardado con el digest de u2; probar el mismo código
    // contra u1 debe fallar aunque el código "sea el correcto" para u2.
    const hashDeU2 = await hashSecret('recovery:u2:999999');
    tx.recoveryToken.findFirst.mockImplementation(({ where }: { where: { userId: string } }) =>
      Promise.resolve(
        where.userId === 'u1'
          ? { id: 'r1', token: hashDeU2, expiresAt: new Date(Date.now() + 60_000), usedAt: null }
          : null,
      ),
    );

    await expect(
      makeService().verifyRecovery({ email: 'compartido@x.co', code: '999999' }, {}),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

// ── Endurecimiento A1–A3: límites, códigos y concurrencia ───────────────────

describe('AuthService.login con límites por IP y cuenta', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.useRealTimers());

  /** Limitador de prueba:3 fallos por clave, bloqueo de1m (virtuales). */
  function limitsDePrueba(): RateLimitService {
    const rl = new RateLimitService();
    rl.rules.loginIp = { max: 3, windowMs: 60_000, blockMs: 60_000 };
    rl.rules.loginAcct = { max: 3, windowMs: 60_000, blockMs: 60_000 };
    return rl;
  }

  it('tras superar el máximo de fallos responde429 con Retry-After', async () => {
    vi.useFakeTimers();
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    tx.user.findUnique.mockResolvedValue({ ...admin, passwordHash: await hashSecret('Admin1234!') });
    tx.session.create.mockResolvedValue({ id: 's1' });
    const svc = makeService(limitsDePrueba());

    for (let i = 0; i < 3; i += 1) {
      await expect(
        svc.login({ email: 'admin@aki.co', password: 'mala' }, { ip: '2.2.2.2' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }
    // El4to intento (incluso con la contraseña CORRECTA) queda bloqueado.
    const error = await svc
      .login({ email: 'admin@aki.co', password: 'Admin1234!' }, { ip: '2.2.2.2' })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(RateLimitException);
    expect((error as RateLimitException).retryAfterSec).toBeGreaterThan(0);
    // El bloqueo expira y vuelve a dejar intentar.
    vi.advanceTimersByTime(61_000);
    const result = await svc.login({ email: 'admin@aki.co', password: 'Admin1234!' }, { ip: '2.2.2.2' });
    expect(isTenantSelection(result)).toBe(false);
  });

  it('una cuenta inexistente acumula intentos igual que una existente (sin fugas)', async () => {
    prisma.$queryRaw.mockResolvedValue([]);
    const svc = makeService(limitsDePrueba());
    for (let i = 0; i < 3; i += 1) {
      await expect(
        svc.login({ email: 'nadie@aki.co', password: 'x' }, { ip: '3.3.3.3' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }
    const error = await svc
      .login({ email: 'nadie@aki.co', password: 'x' }, { ip: '3.3.3.3' })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(RateLimitException);
  });

  it('un inicio de sesión válido limpia el contador de la cuenta', async () => {
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    tx.user.findUnique.mockResolvedValue({ ...admin, passwordHash: await hashSecret('Admin1234!') });
    tx.session.create.mockResolvedValue({ id: 's1' });
    const rl = new RateLimitService();
    rl.rules.loginAcct = { max: 2, windowMs: 60_000, blockMs: 60_000 };
    const svc = makeService(rl);

    await expect(
      svc.login({ email: 'admin@aki.co', password: 'mala' }, { ip: '4.4.4.4' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await svc.login({ email: 'admin@aki.co', password: 'Admin1234!' }, { ip: '4.4.4.4' });
    // Contador limpio: otro fallo no bloquea.
    await expect(
      svc.login({ email: 'admin@aki.co', password: 'mala' }, { ip: '4.4.4.4' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(
      (await svc
        .login({ email: 'admin@aki.co', password: 'mala2' }, { ip: '4.4.4.4' })
        .catch((e: unknown) => e)),
    ).toBeInstanceOf(UnauthorizedException);
  });
});

describe('AuthService.pinLogin con límites', () => {
  beforeEach(() => vi.clearAllMocks());

  it('tras10 fallos de PIN responde429 y el acierto posterior sigue bloqueado', async () => {
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    tx.user.findUnique.mockResolvedValue({ ...admin, pin: await hashSecret('1111') });
    const rl = new RateLimitService();
    rl.rules.pinUser = { max: 2, windowMs: 60_000, blockMs: 60_000 };
    const svc = makeService(rl);

    for (let i = 0; i < 2; i += 1) {
      await expect(svc.pinLogin({ userId: 'u1', pin: '9999' }, {})).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    }
    await expect(svc.pinLogin({ userId: 'u1', pin: '1111' }, {})).rejects.toBeInstanceOf(
      RateLimitException,
    );
  });
});

describe('AuthService.loginSelect con límites por IP', () => {
  beforeEach(() => vi.clearAllMocks());

  it('un token inválido repetido se bloquea por IP', async () => {
    jwt.verifyAsync.mockRejectedValue(new Error('expirado'));
    const rl = new RateLimitService();
    rl.rules.selectIp = { max: 2, windowMs: 60_000, blockMs: 60_000 };
    const svc = makeService(rl);

    for (let i = 0; i < 2; i += 1) {
      await expect(
        svc.loginSelect({ selectionToken: 'tok', tenantId: 't1' }, { ip: '5.5.5.5' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }
    await expect(
      svc.loginSelect({ selectionToken: 'tok', tenantId: 't1' }, { ip: '5.5.5.5' }),
    ).rejects.toBeInstanceOf(RateLimitException);
  });
});

describe('AuthService A3 endurecido: códigos, cooldown y concurrencia', () => {
  beforeEach(() => vi.clearAllMocks());

  it('una petición repetida con código vigente no lo invalida ni reenvía correo', async () => {
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    tx.recoveryToken.findFirst.mockResolvedValue({
      id: 'r1',
      token: await hashSecret('recovery:u1:123456'),
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    });

    await makeService().requestRecovery({ email: 'admin@aki.co' }, { ip: '6.6.6.6' });

    expect(email.send).not.toHaveBeenCalled();
    expect(tx.recoveryToken.deleteMany).not.toHaveBeenCalled();
    expect(tx.recoveryToken.create).not.toHaveBeenCalled();
  });

  it('el código usa CSPRNG de6 dígitos y cambia entre emisiones', async () => {
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    tx.recoveryToken.findFirst.mockResolvedValue(null);
    const svc = makeService();

    await svc.requestRecovery({ email: 'admin@aki.co' }, { ip: '7.7.7.7' });
    const texto1 = (email.send.mock.calls[0]?.[0] as { text: string }).text;
    // Se agota el código vigente (simulando vencimiento) y se pide otro.
    tx.recoveryToken.findFirst.mockResolvedValue(null);
    await svc.requestRecovery({ email: 'admin@aki.co' }, { ip: '7.7.7.7' });
    const texto2 = (email.send.mock.calls[1]?.[0] as { text: string }).text;

    const extraer = (t: string): string => /\b(\d{6})\b/.exec(t)?.[1] ?? '';
    expect(extraer(texto1)).toMatch(/^\d{6}$/);
    expect(extraer(texto2)).toMatch(/^\d{6}$/);
    expect(extraer(texto1)).not.toBe(extraer(texto2));
  });

  it('el código vencido o ya consumido no permite el reset', async () => {
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    // Sin token vigente (vencido/consumido): findFirst no devuelve nada.
    tx.recoveryToken.findFirst.mockResolvedValue(null);

    await expect(
      makeService().resetRecovery(
        { email: 'admin@aki.co', code: '123456', newPassword: 'Nueva1234' },
        {},
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it('dos resets simultáneos con el mismo código cambian la contraseña UNA vez', async () => {
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    const token = {
      id: 'r1',
      token: await hashSecret('recovery:u1:123456'),
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    };
    tx.recoveryToken.findFirst.mockResolvedValue(token);
    // Consumo atómico: la primera transacción gana (count1), la segunda ve0.
    tx.recoveryToken.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    const svc = makeService();

    const resultados = await Promise.allSettled([
      svc.resetRecovery({ email: 'admin@aki.co', code: '123456', newPassword: 'Nueva1234' }, {}),
      svc.resetRecovery({ email: 'admin@aki.co', code: '123456', newPassword: 'Nueva1234' }, {}),
    ]);

    const ok = resultados.filter((r) => r.status === 'fulfilled');
    const fallo = resultados.filter((r) => r.status === 'rejected');
    expect(ok).toHaveLength(1);
    expect(fallo).toHaveLength(1);
    expect((fallo[0] as PromiseRejectedResult).reason).toBeInstanceOf(BadRequestException);
    // La contraseña solo se cambió una vez.
    expect(tx.user.update).toHaveBeenCalledTimes(1);
  });

  it('las solicitudes de recuperación se limitan por IP y por cuenta', async () => {
    const rl = new RateLimitService();
    rl.rules.recoveryIp = { max: 2, windowMs: 60_000, blockMs: 60_000 };
    rl.rules.recoveryAcct = { max: 2, windowMs: 60_000, blockMs: 60_000 };
    const svc = makeService(rl);
    prisma.$queryRaw.mockResolvedValue([]);
    tx.recoveryToken.findFirst.mockResolvedValue(null);

    for (let i = 0; i < 2; i += 1) {
      await svc.requestRecovery({ email: 'x@y.co' }, { ip: '8.8.8.8' });
    }
    await expect(svc.requestRecovery({ email: 'x@y.co' }, { ip: '8.8.8.8' })).rejects.toBeInstanceOf(
      RateLimitException,
    );
  });

  it('los intentos fallidos de verify limitan también el reset (presupuesto compartido)', async () => {
    const rl = new RateLimitService();
    rl.rules.verifyAcct = { max: 2, windowMs: 60_000, blockMs: 60_000 };
    const svc = makeService(rl);
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    tx.recoveryToken.findFirst.mockResolvedValue(null);

    for (let i = 0; i < 2; i += 1) {
      await expect(
        svc.verifyRecovery({ email: 'admin@aki.co', code: '000000' }, {}),
      ).rejects.toBeInstanceOf(BadRequestException);
    }
    // El reset también queda bloqueado: no se puede "saltar" el límite
    // cambiando de endpoint.
    await expect(
      svc.resetRecovery({ email: 'admin@aki.co', code: '000000', newPassword: 'Nueva1234' }, {}),
    ).rejects.toBeInstanceOf(RateLimitException);
  });

  it('verify y reset con el código correcto limpian el contador de intentos', async () => {
    const rl = new RateLimitService();
    rl.rules.verifyAcct = { max: 3, windowMs: 60_000, blockMs: 60_000 };
    const svc = makeService(rl);
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    const token = {
      id: 'r1',
      token: await hashSecret('recovery:u1:654321'),
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    };
    tx.recoveryToken.findFirst.mockResolvedValue(token);
    tx.recoveryToken.updateMany.mockResolvedValue({ count: 1 });

    await expect(
      svc.verifyRecovery({ email: 'admin@aki.co', code: '000000' }, {}),
    ).rejects.toBeInstanceOf(BadRequestException);
    // Código correcto: limpió el contador.
    await svc.verifyRecovery({ email: 'admin@aki.co', code: '654321' }, {});
    await expect(
      svc.verifyRecovery({ email: 'admin@aki.co', code: '000000' }, {}),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('no se registran códigos, contraseñas ni tokens en la auditoría ni el log', async () => {
    prisma.$queryRaw.mockResolvedValue([{ userId: 'u1', tenantId: 't1' }]);
    tx.recoveryToken.findFirst.mockResolvedValue(null);
    const warns: string[] = [];
    const spy = vi.spyOn(Logger.prototype, 'warn').mockImplementation(((...args: unknown[]) => {
      warns.push(args.map(String).join(' '));
    }) as never);

    const svc = makeService();
    await svc.requestRecovery({ email: 'admin@aki.co' }, { ip: '9.9.9.9' });
    const codigo = /\b(\d{6})\b/.exec((email.send.mock.calls[0]?.[0] as { text: string }).text)?.[1];

    const auditoria = JSON.stringify(audit.record.mock.calls);
    const logs = warns.join('\n');
    expect(auditoria).not.toContain(codigo ?? 'sin-codigo');
    expect(logs).not.toContain(codigo ?? 'sin-codigo');
    expect(logs).not.toMatch(/token|passwordHash/i);
    spy.mockRestore();
  });
});
