import { useId, type ReactNode } from 'react';
import { cn } from '../cn';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  /** Recibe el id para asociar label e input (accesibilidad). */
  children: (props: { id: string; invalid: boolean; 'aria-describedby': string | undefined }) => ReactNode;
  className?: string;
}

/** Campo de formulario: etiqueta, control asociado y mensaje de error con `role="alert"`. */
export function FormField({ label, required, error, hint, children, className }: FormFieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const invalid = Boolean(error);

  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <label htmlFor={id} className="text-sm font-medium text-aki-ink">
        {label}
        {required && (
          <span className="ml-1 text-aki-error" aria-hidden>
            *
          </span>
        )}
      </label>

      {children({
        id,
        invalid,
        'aria-describedby': error || hint ? messageId : undefined,
      })}

      {(error || hint) && (
        <p
          id={messageId}
          role={error ? 'alert' : undefined}
          className={cn('text-sm', error ? 'text-aki-error' : 'text-aki-muted')}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
