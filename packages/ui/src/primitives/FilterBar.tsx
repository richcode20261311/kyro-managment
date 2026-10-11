import type { ReactNode } from 'react';
import { cn } from '../cn';

/** Barra de filtros del encabezado: se envuelve en pantallas angostas, nunca desborda. */
export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-wrap items-center gap-2 desktop:gap-3',
        className,
      )}
    >
      {children}
    </div>
  );
}
