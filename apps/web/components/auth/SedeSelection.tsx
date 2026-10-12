'use client';

import { useCallback, useEffect, useState } from 'react';
import { MapPin, Building2, ChevronRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { t } from '@aki/shared';
import type { SedeOption } from '@aki/shared';
import { Button, Card, Chip, cn } from '@aki/ui';
import { useSession } from '../../lib/auth/session';
import { getSedes } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';

/**
 * A4 — Selección de sede (SCREEN-MAP.md, sin shell). Las sedes vienen del
 * backend (`GET /api/auth/sedes`), que ya filtra por el tenant autenticado y
 * por `active: true`: el cliente no envía ni el tenant ni el estado, y el
 * servidor vuelve a validar cualquier selección posterior.
 *
 * `localStorage` solo recuerda la última sede elegida como preferencia de
 * interfaz; nunca es prueba de autorización.
 */

type SedeStatus = 'open' | 'closed';

function statusOf(sede: SedeOption): SedeStatus {
  return sede.active ? 'open' : 'closed';
}

const STATUS_CONFIG: Record<SedeStatus, { label: string; icon: React.ReactNode; chipTone: 'success' | 'neutral' }> = {
  open: { label: 'Abierta', icon: <span className="w-2 h-2 rounded-full bg-aki-green" aria-hidden />, chipTone: 'success' },
  closed: { label: 'Cerrada', icon: <span className="w-2 h-2 rounded-full bg-aki-muted" aria-hidden />, chipTone: 'neutral' },
};

function SedeCard({ sede, selected, onSelect }: { sede: SedeOption; selected: boolean; onSelect: () => void }) {
  const status = STATUS_CONFIG[statusOf(sede)];

  return (
    <Card
      className={cn(
        'relative p-6 flex flex-col items-start gap-3 transition-all duration-200',
        selected
          ? 'border-2 border-aki-red shadow-md'
          : 'border-2 border-aki-line hover:border-aki-red hover:shadow-md'
      )}
      onClick={onSelect}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      role="button"
      aria-pressed={selected}
      aria-label={`${sede.name}, ${status.label}`}
    >
      <div className="flex items-center gap-3 w-full">
        <div className="w-12 h-12 rounded-xl bg-aki-red/10 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-6 h-6 text-aki-red" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-aki-ink truncate">{sede.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Chip tone={status.chipTone} className="text-xs">{status.icon} {status.label}</Chip>
          </div>
        </div>
        {selected && (
          <div className="w-8 h-8 rounded-full bg-aki-red flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-white" aria-hidden />
          </div>
        )}
      </div>

      <Button
        variant={selected ? 'primary' : 'secondary'}
        fullWidth
        onClick={onSelect}
        disabled={statusOf(sede) === 'closed'}
        className="mt-auto"
      >
        {statusOf(sede) === 'closed' ? 'Cerrada' : selected ? 'Seleccionada' : 'Seleccionar'}
        <ChevronRight className="w-4 h-4" aria-hidden />
      </Button>
    </Card>
  );
}

function SedeSkeleton() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-aki-line" />
        <div className="flex-1">
          <div className="h-5 bg-aki-line rounded w-3/4 mb-2" />
          <div className="h-4 bg-aki-line rounded w-1/2" />
        </div>
      </div>
      <div className="h-12 w-full bg-aki-line rounded mt-auto" />
    </Card>
  );
}

export function SedeSelection() {
  const router = useRouter();
  const { tenant } = useSession();
  const [sedes, setSedes] = useState<SedeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSede, setSelectedSede] = useState<SedeOption | null>(null);

  const cargarSedes = useCallback(async () => {
    if (!tenant?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSedes();
      setSedes(data);
      setSelectedSede(null);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t.states.errorBody);
    } finally {
      setLoading(false);
    }
  }, [tenant?.id]);

  useEffect(() => {
    let cancelled = false;
    if (!tenant?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getSedes()
      .then((data) => {
        if (cancelled) return;
        setSedes(data);
        setSelectedSede(null);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setError(caught instanceof ApiError ? caught.message : t.states.errorBody);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenant?.id]);

  const handleSelect = (sede: SedeOption) => {
    if (statusOf(sede) === 'closed') return;
    setSelectedSede(sede);
  };

  const handleContinue = () => {
    if (!selectedSede) return;
    // Preferencia de interfaz únicamente: el servidor valida la selección
    // contra el tenant autenticado en cada operación posterior.
    localStorage.setItem('aki:sede', JSON.stringify(selectedSede));
    router.push('/turno/apertura' as Route);
  };

  const seleccionValida = selectedSede !== null && sedes.some((s) => s.id === selectedSede.id);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="min-w-0">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-aki-red/10 text-aki-error mb-3">
          <span className="w-2 h-2 rounded-full bg-aki-red" aria-hidden />
          {t.auth.sede.eyebrow}
        </span>
        <h1 className="font-display text-[28px] font-semibold text-aki-ink">{t.auth.sede.title}</h1>
        <p className="mt-1 text-base text-aki-muted">{t.auth.sede.body}</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Cargando sedes">
          {Array.from({ length: 3 }).map((_, i) => <SedeSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="bg-aki-bg border-2 border-dashed border-aki-line rounded-2xl p-8 text-center" role="alert">
          <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden />
          <p className="font-semibold text-aki-ink mb-1">{t.states.errorTitle}</p>
          <p className="text-sm text-aki-muted mb-4">{error}</p>
          <Button variant="secondary" onClick={cargarSedes} disabled={loading}>
            Reintentar
          </Button>
        </div>
      ) : sedes.length === 0 ? (
        <div className="bg-aki-bg border-2 border-dashed border-aki-line rounded-2xl p-8 text-center text-aki-muted">
          <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden />
          <p className="font-semibold text-aki-ink mb-1">{t.auth.sede.noSedes}</p>
          <p className="text-sm">{t.auth.sede.noSedesAction}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Sedes disponibles">
          {sedes.map((sede) => (
            <SedeCard
              key={sede.id}
              sede={sede}
              selected={selectedSede?.id === sede.id}
              onSelect={() => handleSelect(sede)}
            />
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" fullWidth onClick={() => router.push('/login')} disabled={loading}>
          Volver al login
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={handleContinue}
          disabled={loading || !!error || !seleccionValida}
        >
          Continuar a apertura de turno
          <ChevronRight className="w-4 h-4" aria-hidden />
        </Button>
      </div>

      <p className="text-center text-sm text-aki-muted">
        {t.auth.login.copyright(new Date().getFullYear())}
      </p>
    </div>
  );
}
