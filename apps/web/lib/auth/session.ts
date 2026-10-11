import type { AuthResponse } from '@aki/shared';
import { create } from 'zustand';

/**
 * Sesión en memoria: access token (15 min) + perfil. El refresh token vive en
 * una cookie httpOnly que maneja el cliente HTTP; tras recargar, `Providers`
 * la usa para restaurar la sesión en silencio.
 */
interface SessionState {
  accessToken: string | null;
  user: AuthResponse['user'] | null;
  tenant: AuthResponse['tenant'] | null;
  setSession: (response: AuthResponse) => void;
  clearSession: () => void;
}

export const useSession = create<SessionState>((set) => ({
  accessToken: null,
  user: null,
  tenant: null,
  setSession: (response) =>
    set({
      accessToken: response.accessToken,
      user: response.user,
      tenant: response.tenant,
    }),
  clearSession: () => set({ accessToken: null, user: null, tenant: null }),
}));
