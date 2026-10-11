'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { refreshSession } from '../lib/api/client';
import { useSession } from '../lib/auth/session';

/**
 * Infraestructura de datos: TanStack Query + restauración de sesión (la
 * cookie de refresh es httpOnly, se renueva en silencio tras cada recarga) +
 * redirección al login cuando el cliente detecta sesión expirada.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  useEffect(() => {
    if (!useSession.getState().accessToken) {
      void refreshSession();
    }
  }, []);

  useEffect(() => {
    const onExpired = () => {
      window.location.assign('/login');
    };
    window.addEventListener('aki:sesion-expirada', onExpired);
    return () => window.removeEventListener('aki:sesion-expirada', onExpired);
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
