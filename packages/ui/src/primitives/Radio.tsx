import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../cn';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

/** Opción nativa de un grupo de radio con acento rojo AKI. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, className, id, ...rest },
  ref,
) {
  const inputId = id ?? `rb-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <span className={cn('flex min-w-0 items-center gap-3', className)}>
      <input
        ref={ref}
        id={inputId}
        type="radio"
        className="size-5 shrink-0 accent-aki-red"
        {...rest}
      />
      <label htmlFor={inputId} className="min-w-0 truncate text-base text-aki-ink">
        {label}
      </label>
    </span>
  );
});
