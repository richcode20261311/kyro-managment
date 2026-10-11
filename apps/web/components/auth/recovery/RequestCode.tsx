import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { emailSchema, t } from '@aki/shared';
import { Button, FormField } from '@aki/ui';
import { AuthError } from '../AuthError';
import { IconInput } from '../inputs';

interface RequestCodeProps {
  defaultValue?: string;
  loading?: boolean;
  error?: string | null;
  onSubmit: (email: string) => void;
}

/** A3 paso 1 — solicitar código de recuperación por correo. */
export function RequestCode({ defaultValue = '', loading, error, onSubmit }: RequestCodeProps) {
  const [email, setEmail] = useState(defaultValue);
  const [localError, setLocalError] = useState<string | undefined>();

  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setLocalError(parsed.error.issues[0]?.message);
      return;
    }
    setLocalError(undefined);
    onSubmit(parsed.data);
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-aki-muted">
          {t.auth.recovery.eyebrow}
        </p>
        <h1 className="mt-2 font-display text-[28px] font-semibold text-aki-ink">
          {t.auth.recovery.request.title}
        </h1>
        <p className="mt-2 text-base text-aki-muted">{t.auth.recovery.request.body}</p>
      </header>

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormField
          label={t.auth.recovery.request.field}
          required
          error={localError}
          hint={t.auth.recovery.request.hint}
        >
          {(props) => (
            <IconInput
              {...props}
              type="email"
              autoComplete="email"
              placeholder={t.auth.login.emailPlaceholder}
              icon={<Mail className="size-5" strokeWidth={1.75} />}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          )}
        </FormField>

        <AuthError message={error ?? null} />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          icon={<ArrowRight className="size-5" strokeWidth={1.75} />}
        >
          {t.auth.recovery.request.submit}
        </Button>
      </form>

      <p className="text-center text-sm text-aki-muted">
        {t.auth.recovery.request.remember}{' '}
        <Link href="/login" className="font-medium text-aki-error hover:underline">
          {t.auth.recovery.request.backToLogin}
        </Link>
      </p>
    </div>
  );
}
