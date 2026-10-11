'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { loginSchema, t, type LoginInput } from '@aki/shared';
import { Button, Checkbox, FormField, Tabs } from '@aki/ui';
import { login } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import { setKeepSession } from '../../lib/auth/keep-session';
import { AuthError } from './AuthError';
import { IconInput, PasswordInput } from './inputs';

/**
 * A1 — Login con correo y contraseña (SCREEN-MAP: `/login`, sin shell).
 * La pestaña "Entrar con PIN" lleva a A2 (`/login/pin`).
 */
export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [keep, setKeep] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login(values);
      setKeepSession(keep);
      // El middleware guardó a dónde ibas en ?sigue=; el flujo entra por /sede.
      const sigue = new URLSearchParams(window.location.search).get('sigue');
      const destino = sigue?.startsWith('/') ? sigue : '/sede';
      router.push(destino as Route);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : t.states.errorBody);
    }
  });

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="min-w-0">
        <h1 className="font-display text-[28px] font-semibold text-aki-ink">
          {t.auth.login.welcome}
        </h1>
        <p className="mt-1 text-base text-aki-muted">{t.auth.login.subtitle}</p>
      </header>

      <Tabs
        items={[
          { id: 'email', label: t.auth.login.tabEmail },
          { id: 'pin', label: t.auth.login.tabPin },
        ]}
        value="email"
        onChange={(id) => {
          // A2 (tarea 5) aún no existe como ruta.
          if (id === 'pin') router.push('/login/pin' as Route);
        }}
      />

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormField label={t.auth.login.email} required error={errors.email?.message}>
          {(props) => (
            <IconInput
              {...props}
              type="email"
              autoComplete="email"
              placeholder={t.auth.login.emailPlaceholder}
              icon={<Mail className="size-5" strokeWidth={1.75} />}
              {...register('email')}
            />
          )}
        </FormField>

        <FormField label={t.auth.login.password} required error={errors.password?.message}>
          {(props) => (
            <PasswordInput {...props} autoComplete="current-password" {...register('password')} />
          )}
        </FormField>

        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <Checkbox
            label={t.auth.login.keep}
            checked={keep}
            onChange={(event) => setKeep(event.target.checked)}
          />
          <Link
            href="/recuperar"
            className="text-sm font-medium text-aki-error hover:underline"
          >
            {t.auth.login.forgot}
          </Link>
        </div>

        <AuthError message={serverError} />

        <Button type="submit" fullWidth loading={isSubmitting}>
          {t.auth.login.submit}
        </Button>
      </form>

      <p className="text-center text-sm text-aki-muted">
        {t.auth.login.copyright(new Date().getFullYear())}
      </p>
    </div>
  );
}
