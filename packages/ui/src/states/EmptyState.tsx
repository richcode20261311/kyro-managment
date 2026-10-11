import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { t } from '@aki/shared';

interface EmptyStateProps {
  title?: string;
  body?: string;
  /** Acción principal, p. ej. "Nuevo pedido". */
  action?: ReactNode;
  icon?: ReactNode;
}

/** Estado vacío (obligatorio en cada pantalla, §7). */
export function EmptyState({ title, body, action, icon }: EmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-aki-line bg-white p-8 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-black/5 text-aki-muted">
        {icon ?? <Inbox className="size-7" strokeWidth={1.75} />}
      </span>
      <p className="font-display text-lg font-semibold text-aki-ink">
        {title ?? t.states.emptyTitle}
      </p>
      <p className="max-w-md text-sm text-aki-muted">{body ?? t.states.emptyBody}</p>
      {action}
    </div>
  );
}
