import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma.module';
import { PermissionsGuard } from './permissions.guard';

const tx = { $queryRaw: vi.fn(), permission: { count: vi.fn() } };
const prisma = {
  $transaction: vi.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
};

function makeContext(user?: unknown): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

const user = { sub: 'u1', tenantId: 't1', role: 'CAJERO' };

describe('PermissionsGuard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('permite rutas sin @RequirePermissions', async () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) };
    const guard = new PermissionsGuard(reflector as unknown as Reflector, prisma as unknown as PrismaService);
    await expect(guard.canActivate(makeContext(user))).resolves.toBe(true);
  });

  it('permite cuando el rol tiene el permiso', async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue({ resource: 'pedidos', action: 'CREAR' }),
    };
    tx.permission.count.mockResolvedValue(1);
    const guard = new PermissionsGuard(reflector as unknown as Reflector, prisma as unknown as PrismaService);
    await expect(guard.canActivate(makeContext(user))).resolves.toBe(true);
  });

  it('prohíbe cuando el rol no tiene el permiso', async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue({ resource: 'reportes', action: 'VER' }),
    };
    tx.permission.count.mockResolvedValue(0);
    const guard = new PermissionsGuard(reflector as unknown as Reflector, prisma as unknown as PrismaService);
    await expect(guard.canActivate(makeContext(user))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('prohíbe si no hay usuario autenticado', async () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue({ resource: 'pedidos', action: 'VER' }),
    };
    const guard = new PermissionsGuard(reflector as unknown as Reflector, prisma as unknown as PrismaService);
    await expect(guard.canActivate(makeContext(undefined))).rejects.toBeInstanceOf(ForbiddenException);
  });
});
