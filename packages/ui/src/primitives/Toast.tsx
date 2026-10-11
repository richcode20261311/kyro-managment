'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { cn } from '../cn';

export interface ToastInput {
  title: string;
  description?: string;
  tone?: 'success' | 'error' | 'info';
}

interface ToastMessage extends ToastInput {
  id: number;
}

const ToastContext = createContext<(toast: ToastInput) => void>(() => undefined);

/** Notificaciones flotantes: `const toast = useToast(); toast({ title: 'Guardado' })`. */
export function useToast(): (toast: ToastInput) => void {
  return useContext(ToastContext);
}

const TONES = {
  success: { icon: CheckCircle2, className: 'text-aki-success' },
  error: { icon: XCircle, className: 'text-aki-error' },
  info: { icon: CheckCircle2, className: 'text-aki-orange' },
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const push = useCallback((toast: ToastInput) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { ...toast, id }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastPrimitive.Provider duration={5000}>
        {toasts.map((toast) => {
          const tone = TONES[toast.tone ?? 'info'];
          const Icon = tone.icon;
          return (
            <ToastPrimitive.Root
              key={toast.id}
              onOpenChange={(open) => {
                if (!open) dismiss(toast.id);
              }}
              className="flex min-w-80 max-w-sm items-start gap-3 rounded-2xl border border-aki-line bg-white p-4 shadow-lg"
            >
              <Icon className={cn('size-6 shrink-0', tone.className)} strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <ToastPrimitive.Title className="truncate text-sm font-semibold text-aki-ink">
                  {toast.title}
                </ToastPrimitive.Title>
                {toast.description && (
                  <ToastPrimitive.Description className="mt-0.5 text-sm text-aki-muted">
                    {toast.description}
                  </ToastPrimitive.Description>
                )}
              </div>
              <ToastPrimitive.Close
                aria-label="Cerrar"
                className="grid size-8 shrink-0 place-items-center rounded-lg text-aki-muted hover:bg-black/5"
              >
                <X className="size-4" strokeWidth={1.75} />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        })}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[60] flex w-sm max-w-[calc(100vw-2rem)] flex-col gap-2" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
