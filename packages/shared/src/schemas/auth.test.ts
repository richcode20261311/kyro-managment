import { describe, expect, it } from 'vitest';
import {
  isTenantSelection,
  loginSchema,
  passwordSchema,
  pinLoginSchema,
  recoveryResetSchema,
  recoveryVerifySchema,
  tenantSelectSchema,
  type LoginResult,
} from './auth';

describe('esquemas de autenticación', () => {
  it('login: valida y normaliza el correo', () => {
    expect(loginSchema.parse({ email: '  ADMIN@AKI.CO ', password: 'x' })).toEqual({
      email: 'admin@aki.co',
      password: 'x',
    });
    expect(loginSchema.safeParse({ email: 'no-es-correo', password: 'x' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
  });

  it('contraseña: mínimo 8, una mayúscula y un número', () => {
    expect(passwordSchema.safeParse('Corta1').success).toBe(false);
    expect(passwordSchema.safeParse('miniscula1').success).toBe(false);
    expect(passwordSchema.safeParse('SINNUMEROS').success).toBe(false);
    expect(passwordSchema.safeParse('Admin1234').success).toBe(true);
  });

  it('pin-login: id uuid y PIN de 4 a 6 dígitos', () => {
    const userId = '48103d91-bfb2-4e4a-9f16-061cdebc40fe';
    expect(pinLoginSchema.safeParse({ userId, pin: '1234' }).success).toBe(true);
    expect(pinLoginSchema.safeParse({ userId, pin: '123456' }).success).toBe(true);
    expect(pinLoginSchema.safeParse({ userId, pin: '12ab' }).success).toBe(false);
    expect(pinLoginSchema.safeParse({ userId: 'x', pin: '1234' }).success).toBe(false);
  });

  it('recuperación: código de 6 dígitos y contraseña fuerte', () => {
    const base = { email: 'admin@aki.co', code: '123456' };
    expect(recoveryVerifySchema.safeParse(base).success).toBe(true);
    expect(recoveryVerifySchema.safeParse({ ...base, code: '12345' }).success).toBe(false);
    const reset = recoveryResetSchema.safeParse({ ...base, newPassword: 'Nueva1234' });
    expect(reset.success).toBe(true);
    expect(recoveryResetSchema.safeParse({ ...base, newPassword: 'débil' }).success).toBe(false);
  });

  it('selección de restaurante: token obligatorio y tenant con uuid válido', () => {
    const tenantId = '48103d91-bfb2-4e4a-9f16-061cdebc40fe';
    expect(tenantSelectSchema.safeParse({ selectionToken: 'tok', tenantId }).success).toBe(true);
    expect(tenantSelectSchema.safeParse({ selectionToken: '', tenantId }).success).toBe(false);
    expect(tenantSelectSchema.safeParse({ selectionToken: 'tok', tenantId: 'no-uuid' }).success).toBe(
      false,
    );
    expect(tenantSelectSchema.safeParse({ selectionToken: 'tok' }).success).toBe(false);
  });

  it('isTenantSelection distingue la sesión directa del reto', () => {
    expect(isTenantSelection({ accessToken: 'x' } as LoginResult)).toBe(false);
    expect(
      isTenantSelection({ requiresTenantSelection: true, tenants: [], selectionToken: 'tok' }),
    ).toBe(true);
  });
});
