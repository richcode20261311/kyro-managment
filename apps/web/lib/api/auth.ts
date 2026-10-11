import type {
  AuthResponse,
  KioskEmployee,
  LoginInput,
  PinLoginInput,
} from '@aki/shared';
import { useSession } from '../auth/session';
import { api, refreshSession } from './client';

/** Endpoints de autenticación (A1 a A3). El refresh va en cookie httpOnly. */

export async function login(input: LoginInput): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', input);
  useSession.getState().setSession(response);
  return response;
}

export async function pinLogin(input: PinLoginInput): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/pin-login', input);
  useSession.getState().setSession(response);
  return response;
}

export async function logout(): Promise<void> {
  await api.post<void>('/auth/logout');
  useSession.getState().clearSession();
}

export function getKioskEmployees(tenant: string): Promise<KioskEmployee[]> {
  const query = new URLSearchParams({ tenant });
  return api.get<KioskEmployee[]>(`/auth/employees?${query.toString()}`);
}

export async function requestRecovery(email: string): Promise<void> {
  await api.post<void>('/auth/recovery/request', { email });
}

export function verifyRecovery(email: string, code: string): Promise<{ ok: true }> {
  return api.post<{ ok: true }>('/auth/recovery/verify', { email, code });
}

export function resetRecovery(
  email: string,
  code: string,
  newPassword: string,
): Promise<{ ok: true }> {
  return api.post<{ ok: true }>('/auth/recovery/reset', {
    email,
    code,
    newPassword,
  });
}

export { refreshSession };
