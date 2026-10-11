import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../cn';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Muestra un indicador de carga y bloquea el botón. */
  loading?: boolean;
  /** Icono a la izquierda del texto (lucide, 24 px, trazo 1.75). */
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-aki-red text-white hover:bg-aki-error',
  secondary: 'border border-aki-ink bg-white text-aki-ink hover:bg-black/5',
  tertiary: 'text-aki-ink hover:bg-black/5',
  danger: 'bg-aki-error text-white hover:brightness-90',
};

/**
 * Botón base (DESIGN-CONTRACT §4 y §7): 48 px de alto, radio 12, texto en una sola línea.
 * Nunca se parte el texto: si no cabe, se trunca con elipsis.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', loading = false, icon, fullWidth, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={rest.type ?? 'button'}
      disabled={disabled || loading}
      className={cn(
        'inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold',
        'whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="size-5 shrink-0 animate-spin" strokeWidth={1.75} aria-hidden />
      ) : (
        icon
      )}
      <span className="min-w-0 truncate">{children}</span>
    </button>
  );
});
