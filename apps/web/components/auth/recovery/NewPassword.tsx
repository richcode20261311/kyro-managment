import { useForm, useWatch } from 'react-hook-form';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Circle, CircleCheck } from 'lucide-react';
import {
  recoveryPasswordSchema,
  t,
  type RecoveryPasswordInput,
} from '@aki/shared';
import { Button, FormField, cn } from '@aki/ui';
import { AuthError } from '../AuthError';
import { PasswordInput } from '../inputs';

interface NewPasswordProps {
  loading?: boolean;
  error?: string | null;
  onSubmit: (password: string) => void;
}

/** A3 paso 3 — crear la nueva contraseña con lista de requisitos en vivo. */
export function NewPassword({ loading, error, onSubmit }: NewPasswordProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RecoveryPasswordInput>({
    resolver: zodResolver(recoveryPasswordSchema),
    defaultValues: { password: '', confirm: '' },
  });
  const password = useWatch({ control, name: 'password' });
  const confirm = useWatch({ control, name: 'confirm' });

  const rules = [
    { ok: password.length >= 8, label: t.auth.recovery.password.ruleMin },
    { ok: /[A-Z]/.test(password), label: t.auth.recovery.password.ruleUpper },
    { ok: /\d/.test(password), label: t.auth.recovery.password.ruleNumber },
    { ok: confirm.length > 0 && confirm === password, label: t.auth.recovery.password.ruleMatch },
  ];

  const submit = handleSubmit((values) => onSubmit(values.password));

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-aki-muted">
          {t.auth.recovery.eyebrow}
        </p>
        <p className="mt-2 text-sm font-medium text-aki-muted">{t.auth.recovery.password.step}</p>
        <h1 className="mt-1 font-display text-[28px] font-semibold text-aki-ink">
          {t.auth.recovery.password.title}
        </h1>
        <p className="mt-2 text-base text-aki-muted">{t.auth.recovery.password.body}</p>
      </header>

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormField label={t.auth.recovery.password.field} required error={errors.password?.message}>
          {(props) => (
            <PasswordInput
              {...props}
              autoComplete="new-password"
              {...register('password')}
            />
          )}
        </FormField>

        <ul className="flex min-w-0 flex-col gap-2">
          {rules.map((rule) => (
            <li
              key={rule.label}
              className={cn(
                'flex min-w-0 items-center gap-2 text-sm',
                rule.ok ? 'text-aki-success-ink' : 'text-aki-muted',
              )}
            >
              {rule.ok ? (
                <CircleCheck className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
              ) : (
                <Circle className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
              )}
              <span className="min-w-0">{rule.label}</span>
            </li>
          ))}
        </ul>

        <FormField label={t.auth.recovery.password.confirm} required error={errors.confirm?.message}>
          {(props) => (
            <PasswordInput
              {...props}
              autoComplete="new-password"
              {...register('confirm')}
            />
          )}
        </FormField>

        <AuthError message={error ?? null} />

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting || loading}
          icon={<ArrowRight className="size-5" strokeWidth={1.75} />}
        >
          {t.auth.recovery.password.submit}
        </Button>
      </form>

      <p className="text-center text-sm text-aki-muted">
        {t.auth.recovery.password.remember}{' '}
        <Link href="/login" className="font-medium text-aki-error hover:underline">
          {t.auth.recovery.password.backToLogin}
        </Link>
      </p>
    </div>
  );
}
