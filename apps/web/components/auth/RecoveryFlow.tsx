'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@aki/shared';
import { requestRecovery, resetRecovery, verifyRecovery } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import { EnterCode } from './recovery/EnterCode';
import { NewPassword } from './recovery/NewPassword';
import { OutcomePanel } from './recovery/OutcomePanel';
import { RequestCode } from './recovery/RequestCode';

/**
 * A3 — Recuperar contraseña: 4 pasos en una ruta con estados, según SCREEN-MAP.
 * El flujo usa códigos de 6 dígitos de un solo uso (válidos 15 minutos), igual
 * que la API: solicitar → código → nueva contraseña → confirmación (y caducado).
 */
type Paso = 'solicitar' | 'correo' | 'clave' | 'listo' | 'expirado';

/** Espera para poder reenviar el código (el límite real llegará en la Fase 10). */
const RESEND_SECONDS = 300;
const CODE_TTL_MS = 15 * 60 * 1000;

function messageOf(error: unknown): string {
  return error instanceof ApiError ? error.message : t.states.errorBody;
}

export function RecoveryFlow() {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>('solicitar');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const [codeExpiresAt, setCodeExpiresAt] = useState(0);
  const [doneAt, setDoneAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!resendAt) return;
    const tick = () => setResendIn(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resendAt]);

  async function enviarCodigo(correo: string): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      await requestRecovery(correo);
      setEmail(correo);
      setResendAt(Date.now() + RESEND_SECONDS * 1000);
      setCodeExpiresAt(Date.now() + CODE_TTL_MS);
      setPaso('correo');
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setLoading(false);
    }
  }

  async function verificar(codigo: string): Promise<void> {
    if (Date.now() > codeExpiresAt) {
      setPaso('expirado');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await verifyRecovery(email, codigo);
      setCode(codigo);
      setPaso('clave');
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setLoading(false);
    }
  }

  async function guardar(nueva: string): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      await resetRecovery(email, code, nueva);
      setDoneAt(new Date());
      setPaso('listo');
    } catch (caught) {
      setError(messageOf(caught));
    } finally {
      setLoading(false);
    }
  }

  switch (paso) {
    case 'correo':
      return (
        <EnterCode
          email={email}
          resendIn={resendIn}
          loading={loading}
          error={error}
          onSubmit={(codigo) => void verificar(codigo)}
          onResend={() => void enviarCodigo(email)}
          onChangeEmail={() => {
            setError(null);
            setPaso('solicitar');
          }}
        />
      );
    case 'clave':
      return (
        <NewPassword loading={loading} error={error} onSubmit={(nueva) => void guardar(nueva)} />
      );
    case 'listo':
      return (
        <OutcomePanel
          variant="listo"
          email={email}
          doneAt={doneAt}
          onPrimary={() => router.push('/login')}
        />
      );
    case 'expirado':
      return (
        <OutcomePanel
          variant="expirado"
          email={email}
          doneAt={null}
          onPrimary={() => {
            setError(null);
            setPaso('solicitar');
          }}
        />
      );
    default:
      return (
        <RequestCode
          defaultValue={email}
          loading={loading}
          error={error}
          onSubmit={(correo) => void enviarCodigo(correo)}
        />
      );
  }
}
