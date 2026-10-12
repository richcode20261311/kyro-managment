'use client';

import { useEffect, useState } from 'react';
import { Clock, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { t } from '@aki/shared';
import { Button, Card, Chip, cn, formatCOP, formatDate, formatTime } from '@aki/ui';
import { useSession } from '../../lib/auth/session';
import { CashCount } from './CashCount';
import { ConfirmacionApertura } from './ConfirmacionApertura';

type Step = 1 | 2 | 3;

interface StepConfig {
  number: Step;
  label: string;
  title: string;
}

const STEPS: StepConfig[] = [
  { number: 1, label: t.auth.turno.apertura.stepper.step1, title: 'Caja y responsable' },
  { number: 2, label: t.auth.turno.apertura.stepper.step2, title: 'Base inicial' },
  { number: 3, label: t.auth.turno.apertura.stepper.step3, title: 'Confirmar' },
];

export function AperturaTurno() {
  const router = useRouter();
  const { user } = useSession();
  const [step, setStep] = useState<Step>(2); // Empieza en paso 2 según diseño
  const [cashCounts, setCashCounts] = useState<Record<string, number>>({});
  const [sede, setSede] = useState<{ name: string; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Leer sede guardada
  useEffect(() => {
    const saved = localStorage.getItem('aki:sede');
    if (saved) {
      try {
        setSede(JSON.parse(saved));
      } catch {
        router.push('/sede' as Route);
      }
    } else {
      router.push('/sede' as Route);
    }
  }, [router]);

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Llamar a API real cuando exista (tarea 6)
      // await openTurno({ sedeId: sede!.id, userId: user.id, cashCounts, nota: data.nota });
      
      // Simulación de éxito
      await new Promise(r => setTimeout(r, 1000));
      
      // Limpiar sede guardada
      localStorage.removeItem('aki:sede');
      setShowSuccess(true);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    router.push('/panel' as Route);
  };

  if (!sede) return null; // Cargando o redirigiendo

  // Mock: datos del usuario responsable
  const responsable = { name: user?.name ?? 'Sofía Ramírez', id: user?.id ?? 'AKI-042' };

  const now = new Date();
  const fechaHoy = formatDate(now);
  const horaAhora = formatTime(now);

  // Constantes para cálculo de efectivo
  const DENOMINACIONES_VALUES: Record<string, number> = {
    b100k: 100_000, b50k: 50_000, b20k: 20_000, b10k: 10_000, b5k: 5_000, b2k: 2_000,
    m1000: 1_000, m500: 500, m200: 200, m100: 100, m50: 50,
  };
  const BASE_SUGERIDA = 200_000;

  const getStepStatus = (s: Step) => {
    if (s < step) return 'completed' as const;
    if (s === step) return 'active' as const;
    return 'pending' as const;
  };

  const renderStepCircle = (s: Step) => {
    const status = getStepStatus(s);
    
    if (status === 'completed') {
      return (
        <div className="w-8 h-8 rounded-full bg-aki-green text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
          <Check className="w-4 h-4" aria-hidden />
        </div>
      );
    }
    if (status === 'active') {
      return (
        <div className="w-8 h-8 rounded-full bg-aki-red text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs ring-4 ring-red-100">
          {s}
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-aki-line text-aki-muted flex items-center justify-center font-bold text-xs flex-shrink-0">
        {s}
      </div>
    );
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="success-title">
        <Card className="max-w-md w-full border-aki-line shadow-2xl p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto mb-4" aria-hidden>
            <Check className="w-8 h-8" />
          </div>
          <Chip tone="success" className="mb-2">Apertura exitosa</Chip>
          <h3 id="success-title" className="text-2xl font-display font-black text-aki-ink">Turno abierto</h3>
          <p className="text-xs text-aki-muted mt-1 mb-6">
            La <strong>Caja #1</strong> ha sido inicializada y está disponible para registrar comandas, pedidos de salón y cobros.
          </p>
          <Card className="bg-[#F8F9FA] border-aki-line p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-xs">
              <span className="text-aki-muted">{t.auth.turno.apertura.success.summary.hora}</span>
              <span className="font-mono font-bold text-aki-ink">{horaAhora} ({fechaHoy})</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-aki-muted">{t.auth.turno.apertura.success.summary.responsable}</span>
              <span className="font-bold text-aki-ink">{responsable.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-aki-muted">{t.auth.turno.apertura.success.summary.base}</span>
              <span className="font-mono font-extrabold text-aki-green">
                {formatCOP(Object.entries(cashCounts).reduce((sum, [k, v]) => sum + v * (DENOMINACIONES_VALUES[k] ?? 0), 0))} COP
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-aki-muted">{t.auth.turno.apertura.success.summary.puesto}</span>
              <span className="font-bold text-aki-ink">{sede.name}</span>
            </div>
          </Card>
          <Button variant="primary" fullWidth onClick={handleSuccessClose} className="mb-3">
            {t.auth.turno.apertura.success.cta}
            <ChevronRight className="w-4 h-4" aria-hidden />
          </Button>
          <Button variant="tertiary" onClick={handleSuccessClose}>
            Cerrar ventana
          </Button>
        </Card>
      </div>
    );
  }

  const subtotalBilletes = Object.entries(cashCounts)
    .filter(([k]) => k.startsWith('b'))
    .reduce((sum, [k, v]) => sum + v * (DENOMINACIONES_VALUES[k] ?? 0), 0);
  const subtotalMonedas = Object.entries(cashCounts)
    .filter(([k]) => k.startsWith('m'))
    .reduce((sum, [k, v]) => sum + v * (DENOMINACIONES_VALUES[k] ?? 0), 0);
  const total = subtotalBilletes + subtotalMonedas;
  const diferencia = total - BASE_SUGERIDA;

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-200px)]">
      {/* Header con título y stepper */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-aki-line">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-widest text-aki-muted">{t.auth.turno.apertura.eyebrow}</span>
              <span className="text-xs text-aki-muted">·</span>
              <span className="text-xs font-mono text-aki-muted">{fechaHoy}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-aki-ink">{t.auth.turno.apertura.title}</h1>
            <p className="text-sm text-aki-muted mt-1">{t.auth.turno.apertura.subtitle}</p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto bg-[#F9F9F9] border border-aki-line px-3.5 py-2 rounded-lg">
            <Clock className="w-4 h-4 text-aki-muted" aria-hidden />
            <span className="text-xs text-aki-muted">Hora de inicio:</span>
            <span className="text-xs font-mono font-bold text-aki-ink">{horaAhora}</span>
          </div>
        </div>

        {/* Stepper */}
        <div className="pt-5">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
            {STEPS.map((s) => (
              <div key={s.number} className="flex items-center gap-3">
                {renderStepCircle(s.number)}
                <div className="min-w-0">
                  <div className={cn(
                    'text-[11px] font-bold uppercase tracking-wider',
                    getStepStatus(s.number) === 'completed' ? 'text-aki-green' :
                    getStepStatus(s.number) === 'active' ? 'text-aki-red' : 'text-aki-muted'
                  )}>
                    {s.label}
                  </div>
                  <div className={cn(
                    'text-xs sm:text-sm font-bold truncate',
                    getStepStatus(s.number) === 'pending' ? 'text-aki-muted' : 'text-aki-ink'
                  )}>
                    {s.title}
                  </div>
                </div>
              </div>
            ))}
            {/* Líneas conectores */}
            <div className="absolute top-4 left-1/2 right-1/2 h-0.5 bg-aki-line -z-10 lg:hidden" aria-hidden />
          </div>
        </div>
      </Card>

      {/* Contenido de dos zonas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Zona izquierda: 8 columnas */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Paso 1: Caja y responsable (solo lectura/resumen) */}
          {step === 1 && (
            <Card className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] uppercase font-bold text-aki-muted">Puesto de Caja</span>
                  <p className="text-sm font-bold text-aki-ink mt-0.5">Caja Principal #1 (Salón & Domicilios)</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase font-bold text-aki-muted">Cajera Responsable</span>
                  <p className="text-sm font-bold text-aki-ink mt-0.5">{responsable.name} (ID: {responsable.id})</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase font-bold text-aki-muted">Sede Asignada</span>
                  <p className="text-sm font-bold text-aki-ink mt-0.5">{sede.name}</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase font-bold text-aki-muted">Fecha y Hora</span>
                  <p className="text-sm font-bold font-mono text-aki-ink mt-0.5">{fechaHoy} · {horaAhora}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-aki-line flex justify-end">
                <Button variant="primary" onClick={handleNext} disabled={loading}>
                  Continuar a base inicial
                  <ChevronRight className="w-4 h-4" aria-hidden />
                </Button>
              </div>
            </Card>
          )}

          {/* Paso 2: Conteo de efectivo */}
          {step === 2 && (
            <div id="view-step-2" className="flex flex-col gap-6">
              <CashCount
                onChange={setCashCounts}
                onAutofill={() => {
                  // Auto-llenar para $200k
                  const autofill = { b100k: 2, b50k: 0, b20k: 0, b10k: 0, b5k: 0, b2k: 0, m1000: 0, m500: 0, m200: 0, m100: 0, m50: 0 };
                  setCashCounts(autofill);
                }}
                disabled={loading}
              />
            </div>
          )}

          {/* Paso 3: Confirmación */}
          {step === 3 && (
            <ConfirmacionApertura
              sede={sede}
              usuario={responsable}
              cashCounts={cashCounts}
              onConfirm={handleConfirm}
              onBack={handleBack}
              disabled={loading}
            />
          )}
        </div>

        {/* Zona derecha: 4 columnas - Resumen fijo */}
        <aside className="lg:col-span-4 sticky top-24">
          <Card className="overflow-hidden">
            <div className="p-5 border-b border-aki-line bg-[#FCFCFC]">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-display font-bold text-aki-ink">Resumen de Turno</h2>
                <Chip tone="neutral" className="text-[11px]">Caja #1</Chip>
              </div>
              <p className="text-xs text-aki-muted mt-0.5">Información operativa de partida</p>
            </div>

            <div className="p-5 space-y-4">
              {/* Responsable & Hora */}
              <div className="space-y-2 pb-4 border-b border-aki-line">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-aki-muted">Responsable:</span>
                  <span className="font-bold text-aki-ink">{responsable.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-aki-muted">Puesto:</span>
                  <span className="font-mono text-aki-ink">Caja Principal 01</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-aki-muted">Hora de apertura:</span>
                  <span className="font-mono font-bold text-aki-ink">{horaAhora}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-aki-muted">Base sugerida:</span>
                  <span className="font-mono font-bold text-aki-ink">{formatCOP(BASE_SUGERIDA)} COP</span>
                </div>
              </div>

              {/* Gran Cifra: Total Contado */}
              <div className="bg-[#FAFBFB] border border-aki-line rounded-xl p-4 text-center">
                <div className="text-xs uppercase font-bold tracking-wider text-aki-muted">Total Contado en Caja</div>
                <div className="text-3xl sm:text-4xl font-mono font-black text-aki-ink my-1 tracking-tight">
                  {formatCOP(total)}
                </div>
                <div className="text-[11px] text-aki-muted">Pesos colombianos (COP)</div>
              </div>

              {/* Diferencia */}
              <div className={cn(
                'p-3 rounded-lg border flex items-center justify-between transition-colors',
                diferencia === 0
                  ? 'border-aki-greenBorder bg-aki-greenLight'
                  : diferencia > 0
                    ? 'border-aki-goldBorder bg-aki-goldLight'
                    : 'border-red-200 bg-red-50'
              )}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0',
                    diferencia === 0 ? 'bg-emerald-600 text-white' :
                    diferencia > 0 ? 'bg-aki-gold text-white' : 'bg-aki-error text-white'
                  )}>
                    {diferencia === 0 ? <Check className="w-3 h-3" /> : diferencia > 0 ? '+' : '−'}
                  </div>
                  <div>
                    <div className={cn(
                      'text-xs font-bold',
                      diferencia === 0 ? 'text-aki-green' : diferencia > 0 ? 'text-aki-gold' : 'text-aki-error'
                    )}>
                      {diferencia === 0 ? 'Base Coincide' : diferencia > 0 ? 'Sobrante' : 'Faltante'}
                    </div>
                    <div className={cn(
                      'text-[11px]',
                      diferencia === 0 ? 'text-emerald-700' : diferencia > 0 ? 'text-amber-700' : 'text-red-700'
                    )}>
                      {diferencia === 0 ? 'Exacto con la base sugerida' : `${formatCOP(Math.abs(diferencia))} de diferencia`}
                    </div>
                  </div>
                </div>
                <div className={cn(
                  'font-mono font-bold text-sm',
                  diferencia === 0 ? 'text-aki-green' : diferencia > 0 ? 'text-aki-gold' : 'text-aki-error'
                )}>
                  {diferencia === 0 ? '$0' : (diferencia > 0 ? '+' : '') + formatCOP(diferencia)}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-2 flex flex-col gap-2.5">
                {step === 2 && (
                  <Button variant="primary" fullWidth onClick={handleNext} disabled={loading}>
                    Continuar a Confirmar
                    <ChevronRight className="w-4 h-4" aria-hidden />
                  </Button>
                )}
                {step === 3 && (
                  <Button variant="primary" fullWidth onClick={() => {}} loading={loading} disabled={loading}>
                    Confirmar y abrir caja
                  </Button>
                )}
                {(step === 2 || step === 3) && (
                  <Button variant="secondary" fullWidth onClick={handleBack} disabled={loading}>
                    <ChevronLeft className="w-4 h-4 mr-1" aria-hidden />
                    Atrás
                  </Button>
                )}
              </div>

              {/* Ayuda rápida */}
              <div className="pt-2 border-t border-aki-line">
                <div className="flex items-center gap-2 text-[11px] text-aki-muted">
                  <AlertCircle className="w-3.5 h-3.5 text-aki-gold flex-shrink-0" aria-hidden />
                  <span>{t.auth.turno.apertura.confirm.warnings.descuadre}</span>
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </div>

      {/* Mobile bottom bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-aki-line p-3 z-20 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold text-aki-muted">Total en caja</div>
            <div className="text-xl font-mono font-black text-aki-ink leading-tight">{formatCOP(total)}</div>
            <div className={cn('text-[10px] font-bold', diferencia === 0 ? 'text-aki-green' : 'text-aki-gold')}>
              {diferencia === 0 ? t.auth.turno.apertura.mobile.diferencia : `${diferencia > 0 ? '+' : ''}${formatCOP(diferencia)}`}
            </div>
          </div>
          {step === 2 && (
            <Button variant="primary" className="h-12 px-6" onClick={handleNext} disabled={loading}>
              <span>Continuar</span>
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Button>
          )}
          {step === 3 && (
            <Button variant="primary" className="h-12 px-6" onClick={() => {}} loading={loading} disabled={loading}>
              Confirmar y abrir caja
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="fixed bottom-24 lg:static lg:mb-6 inset-x-0 mx-auto max-w-md z-30" role="alert">
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-aki-error">
            <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}