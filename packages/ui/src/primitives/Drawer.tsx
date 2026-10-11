'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../cn';

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Lado desde el que entra: derecho (por defecto) o izquierdo. */
  side?: 'right' | 'left';
  /** Ancho fijo del panel (p. ej. 480 px para K4 Agotados). */
  width?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Panel lateral con la misma superposición del contrato (capa negra al 40%,
 * panel blanco opaco). Se usa para paneles como P7 y K4.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  side = 'right',
  width = '480px',
  children,
  className,
}: DrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-y-0 z-50 flex w-[min(100vw,480px)] flex-col bg-white shadow-lg',
            side === 'right' ? 'right-0' : 'left-0',
            className,
          )}
          style={{ width }}
        >
          <div className="flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-aki-line px-6">
            <DialogPrimitive.Title className="min-w-0 truncate font-display text-lg font-semibold text-aki-ink">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Cerrar"
              className="grid size-11 shrink-0 place-items-center rounded-xl text-aki-muted hover:bg-black/5"
            >
              <X className="size-6" strokeWidth={1.75} />
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
