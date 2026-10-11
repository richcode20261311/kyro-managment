import { ShieldX } from 'lucide-react';
import { t } from '@aki/shared';

/** Estado "sin permisos" (§7): rol sin acceso a la sección. */
export function ForbiddenState({ body }: { body?: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-aki-line bg-white p-8 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-aki-error/10 text-aki-error">
        <ShieldX className="size-7" strokeWidth={1.75} />
      </span>
      <p className="font-display text-lg font-semibold text-aki-ink">
        {t.states.forbiddenTitle}
      </p>
      <p className="max-w-md text-sm text-aki-muted">{body ?? t.states.forbiddenBody}</p>
    </div>
  );
}
