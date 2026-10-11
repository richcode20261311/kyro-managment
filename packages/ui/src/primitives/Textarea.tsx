import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

/** Área de texto con foco rojo; el scroll horizontal vive dentro del propio control. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, rows = 4, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full min-w-0 rounded-xl border border-aki-line bg-white px-4 py-3 text-base text-aki-ink',
        'placeholder:text-aki-muted focus:outline-none focus:ring-2 focus:ring-aki-red',
        invalid && 'border-aki-error focus:ring-aki-error',
        className,
      )}
      {...rest}
    />
  );
});
