import type { AuthResponse } from '@aki/shared';
import { useSession } from '../auth/session';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
}

/** Un solo refresh a la vez: las peticiones concurrentes esperan el mismo. */
let refreshPromise: Promise<boolean> | null = null;

/**
 * Intenta renovar la sesión con la cookie httpOnly de refresh.
 * Devuelve `false` si ya no hay sesión (el llamador debe mandar al login).
 */
export function refreshSession(): Promise<boolean> {
  refreshPromise ??= (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return false;
      const data = (await res.json()) as AuthResponse;
      useSession.getState().setSession(data);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

function errorMessage(body: unknown): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join(' · ');
  }
  return 'No pudimos procesar la solicitud, intenta de nuevo';
}

async function request<T>(
  path: string,
  method: string,
  options: RequestOptions = {},
  attempt = 0,
): Promise<T> {
  const token = useSession.getState().accessToken;
  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  // Access vencido: intenta un refresh y repite la petición una sola vez.
  if (res.status === 401 && attempt === 0 && !path.startsWith('/auth/')) {
    if (await refreshSession()) {
      return request<T>(path, method, options, attempt + 1);
    }
    useSession.getState().clearSession();
    window.dispatchEvent(new Event('aki:sesion-expirada'));
    throw new ApiError(401, 'Tu sesión expiró, vuelve a iniciar sesión');
  }

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    throw new ApiError(res.status, errorMessage(body));
  }
  // 204 o 202 con cuerpo vacío (por ejemplo, /auth/recovery/request).
  if (res.status === 204) return undefined as T;
  const data: unknown = await res.json().catch(() => undefined);
  return data as T;
}

/** Cliente HTTP: adjunta el token, gestiona cookies y traduce errores. */
export const api = {
  get: <T>(path: string): Promise<T> => request<T>(path, 'GET'),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, 'POST', { body }),
  patch: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, 'PATCH', { body }),
  delete: <T>(path: string): Promise<T> => request<T>(path, 'DELETE'),
};
