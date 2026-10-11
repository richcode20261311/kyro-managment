import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

/**
 * Selector nativo (accesible por teclado) con la apariencia del contrato:
 * 48 px, radio 12, foco rojo y flecha propia.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className, children, ...rest },
  ref,
) {
  return (
    <span className={cn('relative block w-full min-w-0', className)}>
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-12 w-full min-w-0 appearance-none rounded-xl border border-aki-line bg-white px-4 pr-10 text-base text-aki-ink',
          'focus:outline-none focus:ring-2 focus:ring-aki-red',
          invalid && 'border-aki-error focus:ring-aki-error',
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-aki-muted"
        strokeWidth={1.75}
        aria-hidden
      />
    </span>
  );
});
