import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleCheck, RotateCcw, TriangleAlert } from 'lucide-react';
import { formatDate, formatTime, t } from '@aki/shared';
import { Button } from '@aki/ui';
import { maskEmail } from '../../../lib/auth/mask';

interface OutcomePanelProps {
  variant: 'listo' | 'expirado';
  /** Correo del flujo (se muestra enmascarado). */
  email: string;
  /** Momento en que se restableció la contraseña (solo en `listo`). */
  doneAt: Date | null;
  /** Éxito: ir al login. Caducado: solicitar un código nuevo. */
  onPrimary: () => void;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 border-b border-aki-line py-3 text-sm last:border-0">
      <span className="shrink-0 text-aki-muted">{label}</span>
      <span className="min-w-0 truncate font-medium text-aki-ink">{children}</span>
    </div>
  );
}

/** "Sábado, 10/10/2026, 11:42 a. m." con la fecha real (DESIGN-CONTRACT §9). */
function fechaCompleta(date: Date): string {
  const dia = new Intl.DateTimeFormat('es-CO', { weekday: 'long' }).format(date);
  const capitalizado = `${dia.charAt(0).toUpperCase()}${dia.slice(1)}`;
  return `${capitalizado}, ${formatDate(date)}, ${formatTime(date)}`;
}

/** A3 pasos 4 y estado caducado: confirmación de éxito o código expirado. */
export function OutcomePanel({ variant, email, doneAt, onPrimary }: OutcomePanelProps) {
  if (variant === 'expirado') {
    return (
      <div className="flex min-w-0 flex-col gap-6">
        <header className="min-w-0">
          <span
            role="img"
            aria-label={t.auth.recovery.expired.iconLabel}
            className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-aki-gold/10 text-aki-gold-ink"
          >
            <TriangleAlert className="size-7" strokeWidth={1.75} aria-hidden />
          </span>
          <h1 className="font-display text-[28px] font-semibold text-aki-ink">
            {t.auth.recovery.expired.title}
          </h1>
          <p className="mt-2 text-base text-aki-muted">{t.auth.recovery.expired.body}</p>
        </header>

        <Button
          fullWidth
          onClick={onPrimary}
          icon={<RotateCcw className="size-5" strokeWidth={1.75} />}
        >
          {t.auth.recovery.expired.submit}
        </Button>

        <p className="text-center text-sm text-aki-muted">
          <Link href="/login" className="font-medium text-aki-error hover:underline">
            {t.auth.recovery.expired.backToLogin}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="min-w-0">
        <span
          role="img"
          aria-label={t.auth.recovery.done.iconLabel}
          className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-aki-red/10 text-aki-red"
        >
          <CircleCheck className="size-7" strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="font-display text-[28px] font-semibold text-aki-ink">
          {t.auth.recovery.done.title}
        </h1>
        <p className="mt-2 text-base text-aki-muted">{t.auth.recovery.done.body}</p>
      </header>

      <div className="min-w-0 rounded-2xl border border-aki-line bg-aki-bg px-4">
        <Row label={t.auth.recovery.done.email}>{maskEmail(email)}</Row>
        {doneAt && <Row label={t.auth.recovery.done.datetime}>{fechaCompleta(doneAt)}</Row>}
        <Row label={t.auth.recovery.done.access}>
          <span className="inline-flex min-w-0 items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-aki-success" aria-hidden />
            {t.auth.recovery.done.accessReady}
          </span>
        </Row>
      </div>

      <Button
        fullWidth
        onClick={onPrimary}
        icon={<ArrowRight className="size-5" strokeWidth={1.75} />}
      >
        {t.auth.recovery.done.submit}
      </Button>
    </div>
  );
}
