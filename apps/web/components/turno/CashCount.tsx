'use client';

import { useMemo, useState } from 'react';
import { t } from '@aki/shared';
import { Button, Input, Card, cn, formatCOP } from '@aki/ui';

const DENOMINACIONES = [
  // Billetes
  { id: 'b100k', label: '100K', value: 100_000, name: '$100.000', desc: 'Cien mil pesos', color: 'bg-[#E8E2D2] border-[#C5BBA4] text-[#554E3E]', type: 'billetes' as const },
  { id: 'b50k', label: '50K', value: 50_000, name: '$50.000', desc: 'Cincuenta mil pesos', color: 'bg-[#DDD3E6] border-[#B6A0C7] text-[#58416C]', type: 'billetes' as const },
  { id: 'b20k', label: '20K', value: 20_000, name: '$20.000', desc: 'Veinte mil pesos', color: 'bg-[#F8DFD2] border-[#E7AC8F] text-[#824422]', type: 'billetes' as const },
  { id: 'b10k', label: '10K', value: 10_000, name: '$10.000', desc: 'Diez mil pesos', color: 'bg-[#FBE2CD] border-[#EDB688] text-[#7E4514]', type: 'billetes' as const },
  { id: 'b5k', label: '5K', value: 5_000, name: '$5.000', desc: 'Cinco mil pesos', color: 'bg-[#D3E8D3] border-[#92C492] text-[#285728]', type: 'billetes' as const },
  { id: 'b2k', label: '2K', value: 2_000, name: '$2.000', desc: 'Dos mil pesos', color: 'bg-[#E4EDF7] border-[#A6C4E6] text-[#234D77]', type: 'billetes' as const },
  // Monedas
  { id: 'm1000', label: '1000', value: 1_000, name: '$1.000', desc: 'Bimetálica', color: 'bg-[#E5D7B3] border-2 border-[#AA9457] rounded-full', type: 'monedas' as const },
  { id: 'm500', label: '500', value: 500, name: '$500', desc: 'Bimetálica', color: 'bg-[#DED6C7] border-2 border-[#9F9178] rounded-full', type: 'monedas' as const },
  { id: 'm200', label: '200', value: 200, name: '$200', desc: 'Níquel', color: 'bg-[#E0E0E0] border border-[#B0B0B0] rounded-full', type: 'monedas' as const },
  { id: 'm100', label: '100', value: 100, name: '$100', desc: 'Latón', color: 'bg-[#E3D4B6] border border-[#C2AE86] rounded-full', type: 'monedas' as const },
  { id: 'm50', label: '50', value: 50, name: '$50', desc: 'Pequeña', color: 'bg-[#E8DDD0] border border-[#C7B5A0] rounded-full', type: 'monedas' as const },
];

const DEFAULT_COUNTS: Record<string, number> = {
  b100k: 0, b50k: 2, b20k: 2, b10k: 2, b5k: 2, b2k: 5,
  m1000: 10, m500: 10, m200: 15, m100: 15, m50: 10,
};

const BASE_SUGERIDA = 200_000;

interface CashCountProps {
  onChange: (counts: Record<string, number>) => void;
  onAutofill?: () => void;
  disabled?: boolean;
}

export function CashCount({ onChange, onAutofill, disabled = false }: CashCountProps) {
  const [counts, setCounts] = useState<Record<string, number>>(DEFAULT_COUNTS);

  const subtotalBilletes = useMemo(() =>
    DENOMINACIONES.filter(d => d.type === 'billetes').reduce((sum, d) => sum + (counts[d.id] ?? 0) * d.value, 0),
    [counts]
  );

  const subtotalMonedas = useMemo(() =>
    DENOMINACIONES.filter(d => d.type === 'monedas').reduce((sum, d) => sum + (counts[d.id] ?? 0) * d.value, 0),
    [counts]
  );

  const total = subtotalBilletes + subtotalMonedas;

  const handleChange = (id: string, delta: number) => {
    if (disabled) return;
    const next = Math.max(0, (counts[id] ?? 0) + delta);
    const newCounts = { ...counts, [id]: next };
    setCounts(newCounts);
    onChange(newCounts);
  };

  const handleInputChange = (id: string, value: string) => {
    if (disabled) return;
    const num = Math.max(0, parseInt(value || '0', 10));
    const newCounts = { ...counts, [id]: num };
    setCounts(newCounts);
    onChange(newCounts);
  };

  const handleAutofill = () => {
    if (disabled || !onAutofill) return;
    onAutofill();
    // Auto-completar para $200k sugerido
    const autofillCounts = { ...DEFAULT_COUNTS, b100k: 2 };
    setCounts(autofillCounts);
    onChange(autofillCounts);
  };

  const denomRows = DENOMINACIONES.map((d) => {
    const count = counts[d.id] ?? 0;
    const subtotal = count * d.value;
    return (
      <div key={d.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#FCFCFC] transition">
        <div className="flex items-center gap-3 min-w-[120px] sm:min-w-[170px]">
          <span className={cn('w-10 h-6 rounded border font-mono font-bold flex items-center justify-center text-[10px]', d.color)}>
            {d.label}
          </span>
          <div>
            <div className="text-sm font-bold font-mono text-aki-ink">{d.name}</div>
            <div className="text-[11px] text-aki-muted">{d.desc}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className={cn('w-12 h-12 rounded-lg', disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-aki-line')}
            onClick={() => handleChange(d.id, -1)}
            disabled={disabled || count === 0}
            aria-label={t.auth.turno.apertura.controls.decrement}
          >
            <span className="text-xl font-bold">−</span>
          </Button>
          <Input
            type="number"
            id={`input-${d.id}`}
            value={count}
            min={0}
            onChange={(e) => handleInputChange(d.id, e.target.value)}
            className="w-14 sm:w-16 h-12 text-center font-mono font-bold text-base"
            disabled={disabled}
            inputMode="numeric"
            aria-label={`Cantidad de ${d.name}`}
          />
          <Button
            type="button"
            variant="secondary"
            className={cn('w-12 h-12 rounded-lg', disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-aki-line')}
            onClick={() => handleChange(d.id, 1)}
            disabled={disabled}
            aria-label={t.auth.turno.apertura.controls.increment}
          >
            <span className="text-xl font-bold">+</span>
          </Button>
        </div>

        <div className="text-right min-w-[90px] sm:min-w-[110px]">
          <div className="text-[10px] uppercase tracking-wider text-aki-muted">Subtotal</div>
          <div className="text-sm sm:text-base font-mono font-bold text-aki-ink">{formatCOP(subtotal)}</div>
        </div>
      </div>
    );
  });

  return (
    <>
      {/* Banner informativo */}
      <Card className="p-4 flex items-start gap-3" role="region" aria-label="Información de base">
        <div className="w-8 h-8 rounded-full bg-[#EBF3FB] text-[#0A66C2] flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-aki-ink">{t.auth.turno.apertura.banners.baseSugerida}</h3>
          <p className="text-xs text-aki-muted mt-0.5">
            {t.auth.turno.apertura.banners.baseSugeridaDesc(formatCOP(BASE_SUGERIDA)).replace('{caja}', 'Caja #1')}
          </p>
        </div>
        {onAutofill && (
          <Button variant="secondary" className="sm:inline-flex" onClick={handleAutofill} disabled={disabled}>
            {t.auth.turno.apertura.banners.autocompletar.replace('{monto}', formatCOP(BASE_SUGERIDA))}
          </Button>
        )}
      </Card>

      {/* Billetes */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 bg-[#FAFBFB] border-b border-aki-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-aki-red" aria-hidden />
            <h2 className="text-sm font-bold uppercase tracking-wider text-aki-ink">{t.auth.turno.apertura.sections.billetes}</h2>
            <span className="text-xs text-aki-muted font-medium">(Pesos Colombianos)</span>
          </div>
          <div className="text-xs font-mono font-semibold text-aki-muted">
            {t.auth.turno.apertura.sections.subtotalBilletes}: <span className="text-aki-ink font-bold">{formatCOP(subtotalBilletes)}</span>
          </div>
        </div>
        <div className="divide-y divide-aki-line">
          {denomRows.filter(d => DENOMINACIONES.find(den => den.id === d.key)?.type === 'billetes')}
        </div>
      </Card>

      {/* Monedas */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 bg-[#FAFBFB] border-b border-aki-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-aki-gold" aria-hidden />
            <h2 className="text-sm font-bold uppercase tracking-wider text-aki-ink">{t.auth.turno.apertura.sections.monedas}</h2>
            <span className="text-xs text-aki-muted font-medium">(Cono monetario oficial)</span>
          </div>
          <div className="text-xs font-mono font-semibold text-aki-muted">
            {t.auth.turno.apertura.sections.subtotalMonedas}: <span className="text-aki-ink font-bold">{formatCOP(subtotalMonedas)}</span>
          </div>
        </div>
        <div className="divide-y divide-aki-line">
          {denomRows.filter(d => DENOMINACIONES.find(den => den.id === d.key)?.type === 'monedas')}
        </div>
      </Card>

      {/* Totales en tarjeta resumen (para móvil) */}
      <Card className="p-4 grid grid-cols-3 gap-4 text-center lg:hidden">
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
      </Card>
    </>
  );
}