import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Muestra el estado de error con borde `aki-error` y mensaje fuera del componente. */
  invalid?: boolean;
}

/**
 * Input base (DESIGN-CONTRACT §4 y §7): 48 px de alto, radio 12,
 * foco con anillo rojo de 2 px, texto en una sola línea.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-12 w-full min-w-0 rounded-xl border border-aki-line bg-white px-4 text-base text-aki-ink',
        'placeholder:text-aki-muted focus:outline-none focus:ring-2 focus:ring-aki-red',
        invalid && 'border-aki-error focus:ring-aki-error',
        className,
      )}
      {...rest}
    />
  );
});
