'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';
import { t } from '@aki/shared';
import { Button, cn } from '@aki/ui';

const MAX_DIGITS = 4;
const LOCK_DURATION_MS = 30_000;

type PinKeypadStatus = 'default' | 'error' | 'locked' | 'success';

interface PinKeypadProps {
  onComplete: (pin: string) => Promise<void>;
  onChangeUser?: () => void;
  disabled?: boolean;
}

const STORAGE_KEY = 'aki:pin-lock';

function readLock(): { lockedUntil: number; attempts: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLock(lockedUntil: number, attempts: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ lockedUntil, attempts }));
}

function clearLock(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function PinKeypad({ onComplete, onChangeUser, disabled = false }: PinKeypadProps) {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<PinKeypadStatus>('default');
  const [attempts, setAttempts] = useState(3);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restaurar estado de bloqueo al montar
  useEffect(() => {
    const lock = readLock();
    if (lock && lock.lockedUntil > Date.now()) {
      const remaining = lock.lockedUntil - Date.now();
      setAttempts(lock.attempts);
      setStatus('locked');
      lockTimerRef.current = setTimeout(() => {
        setStatus('default');
        clearLock();
      }, remaining);
    }
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

  const isLocked = status === 'locked';

  const updateDotStyles = useCallback(
    (index: number) => {
      const filled = index < pin.length;
      if (status === 'error') {
        return 'w-5 h-5 rounded-full border-2 border-aki-error bg-aki-error transition-all duration-150';
      }
      if (status === 'success') {
        return 'w-5 h-5 rounded-full border-2 border-aki-green bg-aki-green transition-all duration-150';
      }
      if (status === 'locked') {
        return 'w-5 h-5 rounded-full border-2 border-aki-gold bg-aki-gold/30 transition-all duration-150';
      }
      return filled
        ? 'w-5 h-5 rounded-full border-2 border-aki-ink bg-aki-ink scale-110 transition-all duration-150'
        : 'w-5 h-5 rounded-full border-2 border-aki-muted/50 bg-transparent transition-all duration-150';
    },
    [pin.length, status]
  );

  const pressKey = useCallback(
    (digit: number) => {
      if (isLocked || disabled || pin.length >= MAX_DIGITS) return;
      const nextPin = pin + digit;
      setPin(nextPin);
      if (status === 'error') setStatus('default');
      if (nextPin.length === MAX_DIGITS) {
        // Auto-confirmar tras breve pausa (accesibilidad: dar tiempo a corregir)
        setTimeout(() => handleConfirm(), 300);
      }
    },
    [pin, isLocked, disabled, status]
  );

  const deleteDigit = useCallback(() => {
    if (isLocked || disabled || pin.length === 0) return;
    setPin((p) => p.slice(0, -1));
    if (status === 'error') setStatus('default');
  }, [pin.length, isLocked, disabled, status]);

  const handleConfirm = useCallback(async () => {
    if (isLocked || disabled || pin.length !== MAX_DIGITS) return;
    setStatus('success');
    try {
      await onComplete(pin);
    } catch {
      // El error lo maneja el padre; aquí solo actualizamos estado local
      const nextAttempts = attempts - 1;
      setAttempts(nextAttempts);
      if (nextAttempts <= 0) {
        const until = Date.now() + LOCK_DURATION_MS;
        setStatus('locked');
        writeLock(until, 0);
        lockTimerRef.current = setTimeout(() => {
          setAttempts(3);
          setStatus('default');
          clearLock();
        }, LOCK_DURATION_MS);
      } else {
        setStatus('error');
      }
      setPin('');
    }
  }, [pin, isLocked, disabled, attempts, onComplete]);

  const statusText = (() => {
    switch (status) {
      case 'error':
        return t.auth.pin.step2.statusError(attempts);
      case 'locked':
        return t.auth.pin.step2.statusLocked;
      case 'success':
        return t.auth.pin.step2.statusSuccess;
      default:
        return t.auth.pin.step2.statusDefault;
    }
  })();

  const statusIcon = (() => {
    switch (status) {
      case 'error':
        return (
          <svg className="w-4 h-4 text-aki-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'locked':
        return (
          <svg className="w-4 h-4 text-aki-gold animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-4 h-4 text-aki-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return (
          <svg className="w-3.5 h-3.5 text-aki-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
    }
  })();

  const keys = [
    { digit: 1 },
    { digit: 2 },
    { digit: 3 },
    { digit: 4 },
    { digit: 5 },
    { digit: 6 },
    { digit: 7 },
    { digit: 8 },
    { digit: 9 },
    { action: 'delete', label: t.auth.pin.step2.deleteLabel, icon: <X className="w-6 h-6" aria-hidden /> },
    { digit: 0 },
    { action: 'confirm', label: t.auth.pin.step2.confirmLabel, icon: <Check className="w-6 h-6" aria-hidden /> },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-sm" role="region" aria-label={t.auth.pin.step2.title}>
      <h3 className="text-xl font-bold text-aki-ink text-center mb-1">{t.auth.pin.step2.title}</h3>
      <p className="text-sm text-aki-muted text-center mb-6">{t.auth.pin.step2.body}</p>

      {/* 4 Indicadores de PIN */}
      <div className="flex items-center justify-center gap-5 mb-4" aria-live="polite" aria-label="Dígitos ingresados">
        {Array.from({ length: MAX_DIGITS }, (_, i) => (
          <div key={i} className={updateDotStyles(i)} aria-hidden />
        ))}
      </div>

      {/* Mensaje de estado */}
      <div className="h-8 flex items-center justify-center mb-5 w-full" aria-live="assertive" aria-atomic="true">
        <span className="flex items-center gap-1.5 text-xs font-medium" role="status">
          {statusIcon}
          <span>{statusText}</span>
        </span>
      </div>

      {/* Teclado numérico 3x4 */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[90vw]" role="group" aria-label="Teclado PIN">
        {keys.map((key, idx) => {
          if (key.action === 'delete') {
            return (
              <Button
                key={idx}
                type="button"
                variant="secondary"
                className={cn('pin-key h-12 min-w-12 rounded-2xl', disabled || isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 text-aki-muted hover:text-aki-error')}
                onClick={deleteDigit}
                disabled={disabled || isLocked || pin.length === 0}
                aria-label={key.label}
              >
                {key.icon}
              </Button>
            );
          }
          if (key.action === 'confirm') {
            return (
              <Button
                key={idx}
                type="button"
                variant="primary"
                className={cn('pin-key h-12 min-w-12 rounded-2xl', disabled || isLocked || pin.length !== MAX_DIGITS ? 'opacity-50 cursor-not-allowed' : '')}
                onClick={handleConfirm}
                disabled={disabled || isLocked || pin.length !== MAX_DIGITS}
                aria-label={key.label}
              >
                {key.icon}
              </Button>
            );
          }
          return (
            <Button
              key={idx}
              type="button"
              variant="secondary"
              className={cn('pin-key h-12 min-w-12 rounded-2xl text-2xl font-bold', disabled || isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white active:bg-aki-line')}
              onClick={() => pressKey(key.digit!)}
              disabled={disabled || isLocked || pin.length >= MAX_DIGITS}
              aria-label={t.auth.pin.step2.dotsLabel.replace('{index}', String(key.digit))}
            >
              {key.digit}
            </Button>
          );
        })}
      </div>

      {onChangeUser && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onChangeUser}
            disabled={disabled || isLocked}
            className="text-xs text-aki-muted hover:text-aki-ink underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.auth.pin.step2.changeUser}
          </button>
        </div>
      )}

      <div className="mt-4 text-center">
        <span className="text-xs text-aki-muted hover:text-aki-ink underline font-medium cursor-pointer">
          {t.auth.pin.step2.forgotPin}
        </span>
      </div>
    </div>
  );
}