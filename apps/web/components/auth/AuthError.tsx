import { CircleAlert } from 'lucide-react';

/** Alerta inline de error con icono y texto (nunca solo color, DESIGN-CONTRACT §7). */
export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="flex items-center gap-2 rounded-xl bg-aki-error/10 px-4 py-3 text-sm font-medium text-aki-error"
    >
      <CircleAlert className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="min-w-0">{message}</span>
    </p>
  );
}
