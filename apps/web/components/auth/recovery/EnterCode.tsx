import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Hash, Mail, Send } from 'lucide-react';
import { t } from '@aki/shared';
import { Button, FormField } from '@aki/ui';
import { maskEmail } from '../../../lib/auth/mask';
import { AuthError } from '../AuthError';
import { IconInput } from '../inputs';

interface EnterCodeProps {
  email: string;
  /** Segundos restantes para poder reenviar el código. */
  resendIn: number;
  loading?: boolean;
  error?: string | null;
  onSubmit: (code: string) => void;
  onResend: () => void;
  onChangeEmail: () => void;
}

/** A3 paso 2 — código de 6 dígitos recibido por correo. */
export function EnterCode({
  email,
  resendIn,
  loading,
  error,
  onSubmit,
  onResend,
  onChangeEmail,
}: EnterCodeProps) {
  const [code, setCode] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    if (/^\d{6}$/.test(code)) onSubmit(code);
  }

  const mm = String(Math.floor(resendIn / 60)).padStart(2, '0');
  const ss = String(resendIn % 60).padStart(2, '0');

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="min-w-0">
        <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-aki-red/10 text-aki-red">
          <Mail className="size-7" strokeWidth={1.75} aria-hidden />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-aki-muted">
          {t.auth.recovery.eyebrow}
        </p>
        <h1 className="mt-2 font-display text-[28px] font-semibold text-aki-ink">
          {t.auth.recovery.code.title}
        </h1>
        <p className="mt-2 text-base text-aki-muted">{t.auth.recovery.code.body}</p>
      </header>

      <p className="flex min-w-0 items-center gap-3 rounded-xl border border-aki-line bg-aki-bg px-4 py-3 text-sm">
        <Mail className="size-5 shrink-0 text-aki-muted" strokeWidth={1.75} aria-hidden />
        <span className="min-w-0 truncate font-medium text-aki-ink">{maskEmail(email)}</span>
        <span className="ml-auto shrink-0 text-aki-muted">{t.auth.recovery.code.sentNow}</span>
      </p>

      <p className="text-sm text-aki-muted">{t.auth.recovery.code.spamNote}</p>

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormField label={t.auth.recovery.code.field} required>
          {(props) => (
            <IconInput
              {...props}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder={t.auth.recovery.code.fieldPlaceholder}
              className="tabular-nums tracking-[0.5em]"
              icon={<Hash className="size-5" strokeWidth={1.75} />}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            />
          )}
        </FormField>

        <AuthError message={error ?? null} />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={code.length !== 6}
          icon={<ArrowRight className="size-5" strokeWidth={1.75} />}
        >
          {t.auth.recovery.code.continue}
        </Button>
      </form>

      {resendIn > 0 ? (
        <p className="text-center text-sm tabular-nums text-aki-muted">
          {t.auth.recovery.code.resendIn(mm, ss)}
        </p>
      ) : (
        <Button variant="tertiary" fullWidth onClick={onResend} icon={<Send className="size-5" strokeWidth={1.75} />}>
          {t.auth.recovery.code.resend}
        </Button>
      )}

      <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
        <button
          type="button"
          onClick={onChangeEmail}
          className="font-medium text-aki-error hover:underline"
        >
          {t.auth.recovery.code.changeEmail}
        </button>
        <Link href="/login" className="font-medium text-aki-muted hover:underline">
          {t.auth.recovery.code.backToLogin}
        </Link>
      </div>
    </div>
  );
}
