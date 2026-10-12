import { z } from 'zod';
import type { DbRole } from '../resources';

/** Esquemas de autenticación compartidos entre `apps/web` (formularios) y `apps/api` (validación). */

/** Respuesta de login, pin-login y refresh. */
export interface AuthResponse {
  accessToken: string;
  user: { id: string; name: string; email: string; role: DbRole };
  tenant: { id: string; name: string; slug: string };
}

/** Empleado del kiosco (A2): nada de correos ni PINs. */
export interface KioskEmployee {
  id: string;
  name: string;
  role: DbRole;
}

/** Restaurante (tenant) entre los que un correo puede elegir. */
export interface TenantOption {
  id: string;
  name: string;
  slug: string;
}

/**
 * Sede activa del tenant autenticado (A4). El backend ya filtró por tenant y
 * por `active: true`: el cliente no envía ni el tenant ni el estado.
 */
export interface SedeOption {
  id: string;
  name: string;
  active: boolean;
}

/**
 * Respuesta de `POST /auth/login` cuando el correo y la contraseña son válidos
 * en más de un restaurante: el servidor recién revela la lista después de
 * verificar la contraseña (no existe endpoint público que asocie correos con
 * restaurantes) y acompaña un token firmado de corta vida para elegir.
 */
export interface TenantSelectionChallenge {
  requiresTenantSelection: true;
  tenants: TenantOption[];
  selectionToken: string;
}

/** Resultado de A1: sesión directa o reto de selección de restaurante. */
export type LoginResult = AuthResponse | TenantSelectionChallenge;

export function isTenantSelection(result: LoginResult): result is TenantSelectionChallenge {
  return (result as TenantSelectionChallenge).requiresTenantSelection === true;
}

export const emailSchema = z.string().trim().toLowerCase().email('Correo inválido');

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Incluye al menos una mayúscula')
  .regex(/\d/, 'Incluye al menos un número');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Ingresa tu contraseña'),
});
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Elección de restaurante tras el reto de A1. El servidor valida que el token
 * sea suyo (firma + caducidad) y que `tenantId` pertenezca a los tenants
 * verificados en ese token: nunca se confía en el id enviado por el cliente.
 */
export const tenantSelectSchema = z.object({
  selectionToken: z.string().min(1, 'Falta la sesión de selección'),
  tenantId: z.string().uuid('Restaurante inválido'),
});
export type TenantSelectInput = z.infer<typeof tenantSelectSchema>;

export const pinSchema = z.string().regex(/^\d{4,6}$/, 'El PIN debe tener de 4 a 6 dígitos');

export const pinLoginSchema = z.object({
  userId: z.string().uuid('Usuario inválido'),
  pin: pinSchema,
});
export type PinLoginInput = z.infer<typeof pinLoginSchema>;

/** Grilla de empleados del kiosco (A2): el tenant llega como slug público. */
export const kioskQuerySchema = z.object({
  tenant: z.string().trim().min(1, 'Falta el restaurante'),
});
export type KioskQuery = z.infer<typeof kioskQuerySchema>;

export const recoveryCodeSchema = z.string().regex(/^\d{6}$/, 'El código tiene 6 dígitos');

export const recoveryRequestSchema = z.object({ email: emailSchema });
export type RecoveryRequestInput = z.infer<typeof recoveryRequestSchema>;

export const recoveryVerifySchema = z.object({
  email: emailSchema,
  code: recoveryCodeSchema,
});
export type RecoveryVerifyInput = z.infer<typeof recoveryVerifySchema>;

export const recoveryResetSchema = z.object({
  email: emailSchema,
  code: recoveryCodeSchema,
  newPassword: passwordSchema,
});
export type RecoveryResetInput = z.infer<typeof recoveryResetSchema>;

/** Paso 3 de A3 en el cliente: nueva contraseña + confirmación que deben coincidir. */
export const recoveryPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string().min(1, 'Confirma la contraseña'),
  })
  .refine((values) => values.password === values.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  });
export type RecoveryPasswordInput = z.infer<typeof recoveryPasswordSchema>;
