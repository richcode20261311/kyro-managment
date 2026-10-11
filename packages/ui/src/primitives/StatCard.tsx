import type { ReactNode } from 'react';
import { cn } from '../cn';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Detalle secundario, p. ej. "+12% vs. ayer". */
  detail?: ReactNode;
  className?: string;
}

/** Tarjeta KPI: cifra a 28 px con numerales tabulares (DESIGN-CONTRACT §5). */
export function StatCard({ label, value, detail, className }: StatCardProps) {
  return (
    <Card className={cn('min-w-0', className)}>
      <p className="truncate text-sm text-aki-muted">{label}</p>
      <p
        className="truncate font-display text-[28px] font-semibold tabular-nums text-aki-ink"
        data-moneda
      >
        {value}
      </p>
      {detail && <p className="truncate text-sm text-aki-muted">{detail}</p>}
    </Card>
  );
}
