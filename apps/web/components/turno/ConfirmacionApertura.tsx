'use client';

import { useState } from 'react';
import { t } from '@aki/shared';
import { Button, Card, Textarea, formatCOP, formatDate, formatTime } from '@aki/ui';

interface ConfirmacionAperturaProps {
  sede: { name: string; id: string };
  usuario: { name: string; id: string };
  cashCounts: Record<string, number>;
  onConfirm: (data: { nota: string }) => Promise<void>;
  onBack: () => void;
  disabled?: boolean;
}

const DENOMINACIONES_VALUES: Record<string, number> = {
  b100k: 100_000, b50k: 50_000, b20k: 20_000, b10k: 10_000, b5k: 5_000, b2k: 2_000,
  m1000: 1_000, m500: 500, m200: 200, m100: 100, m50: 50,
};

export function ConfirmacionApertura({ sede, usuario, cashCounts, onConfirm, onBack, disabled = false }: ConfirmacionAperturaProps) {
  const [nota, setNota] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotalBilletes = Object.entries(cashCounts)
    .filter(([k]) => k.startsWith('b'))
    .reduce((sum, [k, v]) => sum + v * (DENOMINACIONES_VALUES[k] ?? 0), 0);

  const subtotalMonedas = Object.entries(cashCounts)
    .filter(([k]) => k.startsWith('m'))
    .reduce((sum, [k, v]) => sum + v * (DENOMINACIONES_VALUES[k] ?? 0), 0);

  const total = subtotalBilletes + subtotalMonedas;

  const now = new Date();
  const fechaHoy = formatDate(now);
  const horaAhora = formatTime(now);

  const handleConfirm = async () => {
    if (disabled || loading) return;
    setLoading(true);
    setError(null);
    try {
      await onConfirm({ nota });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al abrir la caja');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-display font-bold text-aki-ink mb-1">{t.auth.turno.apertura.confirm.title}</h2>
        <p className="text-xs text-aki-muted mb-6">{t.auth.turno.apertura.confirm.body}</p>
      </div>

      {/* Grid de parámetros confirmados */}
      <Card className="p-4 bg-[#F8F9FA] border-aki-line">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] uppercase font-bold text-aki-muted">{t.auth.turno.apertura.confirm.grid.caja}</span>
            <p className="text-sm font-bold text-aki-ink mt-0.5">Caja Principal #1 (Salón & Domicilios)</p>
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-aki-muted">{t.auth.turno.apertura.confirm.grid.responsable}</span>
            <p className="text-sm font-bold text-aki-ink mt-0.5">{usuario.name} (ID: {usuario.id})</p>
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-aki-muted">{t.auth.turno.apertura.confirm.grid.sede}</span>
            <p className="text-sm font-bold text-aki-ink mt-0.5">{sede.name}</p>
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-aki-muted">{t.auth.turno.apertura.confirm.grid.fechaHora}</span>
            <p className="text-sm font-bold font-mono text-aki-ink mt-0.5">{fechaHoy} · {horaAhora}</p>
          </div>
        </div>
      </Card>

      {/* Desglose resumido de efectivo */}
      <Card className="border-aki-line overflow-hidden">
        <div className="px-4 py-3 bg-[#FAFBFB] border-b border-aki-line font-bold text-xs uppercase tracking-wider text-aki-ink">
          {t.auth.turno.apertura.confirm.cashSummary.title}
        </div>
        <div className="p-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white rounded-lg border border-aki-line">
            <div className="text-[11px] text-aki-muted">{t.auth.turno.apertura.confirm.cashSummary.billetes}</div>
            <div className="text-base font-mono font-bold text-aki-ink mt-1">{formatCOP(subtotalBilletes)}</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-aki-line">
            <div className="text-[11px] text-aki-muted">{t.auth.turno.apertura.confirm.cashSummary.monedas}</div>
            <div className="text-base font-mono font-bold text-aki-ink mt-1">{formatCOP(subtotalMonedas)}</div>
          </div>
          <div className="p-3 bg-aki-greenLight rounded-lg border border-aki-greenBorder">
            <div className="text-[11px] font-bold text-aki-green">{t.auth.turno.apertura.confirm.cashSummary.total}</div>
            <div className="text-lg font-mono font-extrabold text-aki-green mt-0.5">{formatCOP(total)}</div>
          </div>
        </div>
      </Card>

      {/* Campo de Nota Opcional */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-aki-ink">
          {t.auth.turno.apertura.confirm.note.label}
          <span className="text-aki-muted font-normal normal-case"> {t.auth.turno.apertura.confirm.note.optional}</span>
        </label>
        <Textarea
          id="nota-apertura"
          rows={3}
          placeholder={t.auth.turno.apertura.confirm.note.placeholder}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          disabled={disabled || loading}
          className="w-full p-3 text-xs text-aki-ink"
          aria-describedby="nota-hint"
        />
        <p id="nota-hint" className="text-[11px] text-aki-muted">{t.auth.turno.apertura.confirm.note.hint}</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-aki-error" role="alert">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Botones de acción */}
      <div className="pt-2 flex flex-col gap-2.5">
        <Button
          variant="primary"
          fullWidth
          onClick={handleConfirm}
          loading={loading}
          disabled={disabled}
        >
          {t.auth.turno.apertura.confirm.actions.primary}
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={onBack}
          disabled={disabled || loading}
        >
          {t.auth.turno.apertura.confirm.actions.secondary}
        </Button>
      </div>

      {/* Advertencia */}
      <div className="pt-2 border-t border-aki-line">
        <div className="flex items-center gap-2 text-[11px] text-aki-muted">
          <svg className="w-3.5 h-3.5 text-aki-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{t.auth.turno.apertura.confirm.warnings.descuadre}</span>
        </div>
      </div>
    </Card>
  );
}