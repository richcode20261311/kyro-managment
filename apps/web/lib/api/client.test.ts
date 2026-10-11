import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSession } from '../auth/session';
import { ApiError, api, refreshSession } from './client';

const sessionResponse = {
  accessToken: 'token-nuevo',
  user: {
    id: 'u1',
    name: 'Andrea Ramírez',
    email: 'admin@aki.co',
    role: 'ADMINISTRADOR' as const,
  },
  tenant: { id: 't1', name: 'AKI Cocina Oriental', slug: 'aki' },
};

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status < 300,
    status,
    json: async () => data,
  } as unknown as Response;
}

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  useSession.getState().clearSession();
});

describe('cliente HTTP', () => {
  it('adjunta el Bearer y usa credenciales', async () => {
    useSession.getState().setSession(sessionResponse);
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await api.get<{ ok: boolean }>('/pedidos');

    expect(result.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit & { credentials: string }];
    expect(url).toContain('/api/pedidos');
    expect(init.credentials).toBe('include');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer token-nuevo' });
  });

  it('ante un 401 refresca la sesión y repite la petición', async () => {
    useSession.getState().setSession(sessionResponse);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse(sessionResponse))
      .mockResolvedValueOnce(jsonResponse({ pedidos: [] }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await api.get<{ pedidos: unknown[] }>('/pedidos');

    expect(result.pedidos).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(useSession.getState().accessToken).toBe('token-nuevo');
  });

  it('si el refresh falla limpia la sesión, avisa y lanza 401', async () => {
    useSession.getState().setSession(sessionResponse);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({}, 401));
    vi.stubGlobal('fetch', fetchMock);
    const expired = vi.fn();
    window.addEventListener('aki:sesion-expirada', expired);

    await expect(api.get('/pedidos')).rejects.toBeInstanceOf(ApiError);

    expect(useSession.getState().accessToken).toBeNull();
    expect(expired).toHaveBeenCalledTimes(1);
    window.removeEventListener('aki:sesion-expirada', expired);
  });

  it('refresca una sola vez aunque lleguen peticiones concurrentes', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(sessionResponse));
    vi.stubGlobal('fetch', fetchMock);

    const [a, b] = await Promise.all([refreshSession(), refreshSession()]);

    expect(a).toBe(true);
    expect(b).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('traduce el mensaje de error del servidor', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: 'Código inválido o expirado' }, 400));
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.post('/auth/recovery/verify', {})).rejects.toMatchObject({
      status: 400,
      message: 'Código inválido o expirado',
    });
  });

  it('las respuestas 204 devuelven undefined sin intentar parsear', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(undefined, 204));
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.post('/auth/logout')).resolves.toBeUndefined();
  });

  it('tolera un 202 con cuerpo vacío (recuperación de contraseña)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
      json: async () => {
        throw new SyntaxError('Unexpected end of JSON input');
      },
    } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.post('/auth/recovery/request', {})).resolves.toBeUndefined();
  });
});
