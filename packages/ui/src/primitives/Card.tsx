import type { HTMLAttributes } from 'react';
import { cn } from '../cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Padding cómodo por defecto; `compact` para listas internas. */
  padding?: 'default' | 'compact' | 'none';
}

/** Tarjeta (DESIGN-CONTRACT §4): radio 16, borde #E6E6E6, sombra muy suave, ancho completo. */
export function Card({ padding = 'default', className, children, ...rest }: CardProps) {
  const paddings = {
    default: 'p-4 desktop:p-6',
    compact: 'p-4',
    none: '',
  } as const;

  return (
    <div
      className={cn(
        'min-w-0 rounded-2xl border border-aki-line bg-white shadow-sm',
        paddings[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
