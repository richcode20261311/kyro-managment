import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'red' | 'green';
  children: ReactNode;
}

/** Etiqueta compacta (contadores, avisos). Para estados de negocio usa `Chip`. */
export function Badge({ tone = 'default', children, className, ...rest }: BadgeProps) {
  const tones = {
    default: 'bg-black/5 text-aki-ink',
    red: 'bg-aki-red text-white',
    green: 'bg-aki-success text-white',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center justify-center rounded-full px-2 text-xs font-semibold',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
