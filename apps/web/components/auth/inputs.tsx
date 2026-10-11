import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { t } from '@aki/shared';
import { Input, cn } from '@aki/ui';

export interface IconInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** Icono lucide a la izquierda (24 px, trazo 1.75). */
  icon: ReactNode;
  /** Contenido a la derecha (por ejemplo el botón de ver contraseña). */
  trailing?: ReactNode;
}

/** Input con icono interior (DESIGN-CONTRACT §7): mantiene 48 px y foco rojo. */
export const IconInput = forwardRef<HTMLInputElement, IconInputProps>(function IconInput(
  { icon, trailing, invalid, className, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-aki-muted"
      >
        {icon}
      </span>
      <Input
        ref={ref}
        invalid={invalid}
        className={cn('pl-12', trailing && 'pr-12', className)}
        {...rest}
      />
      {trailing && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</div>
      )}
    </div>
  );
});

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean;
}

/** Contraseña con icono de candado y botón de mostrar/ocultar (48 px de zona táctil). */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ invalid, ...rest }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <IconInput
        ref={ref}
        invalid={invalid}
        type={visible ? 'text' : 'password'}
        icon={<Lock className="size-5" strokeWidth={1.75} />}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? t.auth.login.hidePassword : t.auth.login.showPassword}
            className="flex size-10 items-center justify-center rounded-lg text-aki-muted hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-aki-red"
          >
            {visible ? (
              <EyeOff className="size-5" strokeWidth={1.75} aria-hidden />
            ) : (
              <Eye className="size-5" strokeWidth={1.75} aria-hidden />
            )}
          </button>
        }
        {...rest}
      />
    );
  },
);
