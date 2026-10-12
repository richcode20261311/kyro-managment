'use client';

import { useEffect, useState } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { Building2, ChevronRight } from 'lucide-react';
import { isTenantSelection, t, type TenantOption } from '@aki/shared';
import { Button, Card, cn } from '@aki/ui';
import { selectTenant } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import { clearPendingTenantSelection, readPendingTenantSelection } from '../../lib/auth/tenant-selection';
import { AuthError } from './AuthError';

/**
 * A1 multi-tenant: se muestra SOLO cuando el servidor respondió que el correo
 * y la contraseña son válidos en más de un restaurante. El reto (lista + token
 * firmado) vive en memoria de la pestaña; sin reto (recarga o acceso directo)
 * se ofrece volver al login. Nunca se pide la contraseña de nuevo: el token
 * firmado de corta vida la atestigua y el servidor valida cada tenant elegido.
 */
type Estado = 'cargando' | 'listo' | 'sin-reto';

export function TenantSelection() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>('cargando');
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [selectionToken, setSelectionToken] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reto = readPendingTenantSelection();
    if (reto && isTenantSelection(reto)) {
      setTenants(reto.tenants);
      setSelectionToken(reto.selectionToken);
      setEstado('listo');
    } else {
      setEstado('sin-reto');
    }
  }, []);

  const volverAlLogin = () => {
    clearPendingTenantSelection();
    router.push('/login' as Route);
  };

  const entrar = async (tenantId: string) => {
    if (!selectionToken) return;
    setEnviando(tenantId);
    setError(null);
    try {
      await selectTenant({ selectionToken, tenantId });
      clearPendingTenantSelection();
      const sigue = new URLSearchParams(window.location.search).get('sigue');
      const destino = sigue?.startsWith('/') ? sigue : '/sede';
      router.push(destino as Route);
    } catch (caught) {
      // 401 = token vencido o tenant no permitido: se vuelve a pedir el login.
      setError(caught instanceof ApiError ? caught.message : t.states.errorBody);
      setEnviando(null);
    }
  };

  if (estado === 'cargando') {
    return (
      <div className="flex min-w-0 flex-col gap-6" aria-busy="true" aria-live="polite">
        <header className="min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-aki-red/10 text-aki-error mb-3">
            <span className="w-2 h-2 rounded-full bg-aki-red" aria-hidden />
            {t.auth.tenant.eyebrow}
          </span>
          <h1 className="font-display text-[28px] font-semibold text-aki-ink">
            {t.auth.tenant.title}
          </h1>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label={t.auth.tenant.listLabel}>
          {[0, 1].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-5 w-2/3 rounded bg-aki-line mb-3" />
              <div className="h-4 w-1/3 rounded bg-aki-line" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="min-w-0">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-aki-red/10 text-aki-error mb-3">
          <span className="w-2 h-2 rounded-full bg-aki-red" aria-hidden />
          {t.auth.tenant.eyebrow}
        </span>
        <h1 className="font-display text-[28px] font-semibold text-aki-ink">
          {t.auth.tenant.title}
        </h1>
        <p className="mt-1 text-base text-aki-muted">
          {estado === 'sin-reto' ? t.auth.tenant.expired : t.auth.tenant.body}
        </p>
      </header>

      {estado === 'sin-reto' ? (
        <div className="bg-aki-bg border-2 border-dashed border-aki-line rounded-2xl p-8 text-center text-aki-muted">
          <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden />
          <p className="font-semibold text-aki-ink mb-1">{t.auth.tenant.missing}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label={t.auth.tenant.listLabel}>
          {tenants.map((tenant) => (
            <li key={tenant.id}>
              <Card
                className={cn(
                  'p-6 flex items-center gap-3 transition-all duration-200',
                  'border-2 border-aki-line hover:border-aki-red hover:shadow-md',
                  enviando === tenant.id && 'border-aki-red',
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-aki-red/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-aki-red" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-aki-ink truncate">{tenant.name}</h2>
                  <p className="text-xs text-aki-muted truncate">{tenant.slug}</p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => entrar(tenant.id)}
                  disabled={enviando !== null}
                  loading={enviando === tenant.id}
                  aria-busy={enviando === tenant.id}
                >
                  {t.auth.tenant.select}
                  {enviando !== tenant.id && <ChevronRight className="w-4 h-4" aria-hidden />}
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <AuthError message={error} />

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" fullWidth onClick={volverAlLogin}>
          {t.auth.tenant.back}
        </Button>
      </div>

      <p className="text-center text-sm text-aki-muted">
        {t.auth.login.copyright(new Date().getFullYear())}
      </p>
    </div>
  );
}
