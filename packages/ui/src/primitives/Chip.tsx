import type { ReactNode } from 'react';
import { cn } from '../cn';

export type ChipTone = 'success' | 'warning' | 'danger' | 'orange' | 'neutral' | 'outline';

const tones: Record<ChipTone, string> = {
  success: 'bg-aki-success/10 text-aki-success-ink',
  warning: 'bg-aki-gold/10 text-aki-gold-ink',
  danger: 'bg-aki-error/10 text-aki-error',
  orange: 'bg-aki-orange/10 text-aki-orange-ink',
  neutral: 'bg-black/5 text-aki-ink',
  outline: 'border border-aki-line bg-white text-aki-ink',
};

export interface ChipProps {
  tone?: ChipTone;
  /** Icono lucide opcional; el texto siempre está presente (color nunca va solo). */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Chip de estado (DESIGN-CONTRACT §7 y §8): siempre lleva icono o texto además del color. */
export function Chip({ tone = 'neutral', icon, children, className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex h-7 max-w-full items-center gap-1.5 rounded-full px-3 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {icon}
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}
