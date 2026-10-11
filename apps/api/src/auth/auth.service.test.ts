import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EmailProvider } from '../email/email.provider';
import { hashSecret } from '../common/password.util';
import type { PrismaService } from '../prisma.module';
import { AuthService } from './auth.service';

process.env['JWT_ACCESS_SECRET'] = 'test-access';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh';

const tx = {
  $queryRaw: vi.fn().mockResolvedValue([]),
  user: { findUnique: vi.fn(), update: vi.fn() },
  session: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  recoveryToken: { create: vi.fn(), findFirst: vi.fn(), deleteMany: vi.fn(), updateMany: vi.fn() },
};

const prisma = {
  $queryRaw: vi.fn(),
  $transaction: vi.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
};
const jwt = { signAsync: vi.fn().mockResolvedValue('token-firmado'), verifyAsync: vi.fn() };
const email = { send: vi.fn().mockResolvedValue(undefined) };
const audit = { record: vi.fn().mockResolvedValue(undefined) };

function makeService(): AuthService {
  return new AuthService(
    prisma as unknown as PrismaService,
    jwt as unknown as JwtService,
    email as unknown as EmailProvider,
    audit as unknown as never,
  );
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

    const result = await makeService().login(
      { email: 'admin@aki.co', password: 'Admin1234!' },
      { ip: '127.0.0.1' },
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
      token: await hashSecret('123456'),
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    });

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
      token: await hashSecret('123456'),
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
    });
    await expect(
      makeService().resetRecovery({ email: 'admin@aki.co', code: '000000', newPassword: 'Nueva1234' }, {}),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
