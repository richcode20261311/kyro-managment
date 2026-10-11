import { describe, expect, it } from 'vitest';
import { useSession } from './session';

describe('sesión (Zustand)', () => {
  it('guarda y limpia la sesión', () => {
    useSession.getState().setSession({
      accessToken: 'abc',
      user: {
        id: 'u1',
        name: 'Andrea Ramírez',
        email: 'admin@aki.co',
        role: 'ADMINISTRADOR',
      },
      tenant: { id: 't1', name: 'AKI Cocina Oriental', slug: 'aki' },
    });

    expect(useSession.getState().accessToken).toBe('abc');
    expect(useSession.getState().tenant?.slug).toBe('aki');

    useSession.getState().clearSession();
    expect(useSession.getState().accessToken).toBeNull();
    expect(useSession.getState().user).toBeNull();
    expect(useSession.getState().tenant).toBeNull();
  });
});
