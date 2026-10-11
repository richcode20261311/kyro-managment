import { cn } from '../cn';

export interface SkeletonProps {
  /** Ancho CSS, p. ej. `"48px"` o `"60%"`. */
  width?: string;
  height?: string;
  className?: string;
  /** Variante redonda (avatar). */
  circle?: boolean;
}

/** Bloque de carga (estado "cargando" de cada pantalla). */
export function Skeleton({ width = '100%', height = '16px', circle, className }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'block animate-pulse bg-black/10',
        circle ? 'rounded-full' : 'rounded-xl',
        className,
      )}
      style={{ width, height }}
    />
  );
}
