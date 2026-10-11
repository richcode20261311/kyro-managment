'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../cn';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Ancho máximo del panel. */
  width?: string;
  /** Elementos de acción al pie (primario a la derecha). */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Diálogo (DESIGN-CONTRACT §7): capa negra al 40% que cubre **toda** la pantalla
 * (menú y barra superior incluidos), panel blanco opaco, sin transparencia ni desenfoque.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  width = 'max-w-lg',
  footer,
  className,
}: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2',
            'overflow-y-auto rounded-2xl bg-white p-6 shadow-lg',
            width,
            className,
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogPrimitive.Title className="truncate font-display text-lg font-semibold text-aki-ink">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="mt-1 text-sm text-aki-muted">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              aria-label="Cerrar"
              className="grid size-11 shrink-0 place-items-center rounded-xl text-aki-muted hover:bg-black/5"
            >
              <X className="size-6" strokeWidth={1.75} />
            </DialogPrimitive.Close>
          </div>

          <div className="min-w-0">{children}</div>

          {footer && (
            <div className="mt-6 flex min-w-0 flex-wrap justify-end gap-2">{footer}</div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
