import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

/** Casilla nativa (teclado y lector de pantalla incluidos) con acento rojo AKI. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, id, ...rest },
  ref,
) {
  const inputId = id ?? `cb-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <span className={cn('flex min-w-0 items-center gap-3', className)}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className="size-5 shrink-0 accent-aki-red"
        {...rest}
      />
      <label htmlFor={inputId} className="min-w-0 truncate text-base text-aki-ink">
        {label}
      </label>
    </span>
  );
});
