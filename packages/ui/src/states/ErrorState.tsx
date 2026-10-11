import { TriangleAlert } from 'lucide-react';
import { t } from '@aki/shared';
import { Button } from '../primitives/Button';

interface ErrorStateProps {
  title?: string;
  body?: string;
  onRetry: () => void;
}

/** Error de carga con "Reintentar" (§7). */
export function ErrorState({ title, body, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-aki-line bg-white p-8 text-center"
    >
      <span className="grid size-14 place-items-center rounded-full bg-aki-error/10 text-aki-error">
        <TriangleAlert className="size-7" strokeWidth={1.75} />
      </span>
      <p className="font-display text-lg font-semibold text-aki-ink">
        {title ?? t.states.errorTitle}
      </p>
      <p className="max-w-md text-sm text-aki-muted">{body ?? t.states.errorBody}</p>
      <Button onClick={onRetry}>{t.states.retry}</Button>
    </div>
  );
}
