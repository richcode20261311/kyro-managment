import { Compass } from 'lucide-react';
import { t } from '@aki/shared';
import { Button } from '../primitives/Button';

/** Página 404 (§7): sin shell, con retorno al panel. */
export function NotFound404() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-aki-bg p-6 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-black/5 text-aki-muted">
        <Compass className="size-8" strokeWidth={1.75} />
      </span>
      <p className="font-display text-3xl font-semibold text-aki-ink">404</p>
      <p className="font-display text-lg font-semibold text-aki-ink">
        {t.states.notFoundTitle}
      </p>
      <p className="max-w-md text-sm text-aki-muted">{t.states.notFoundBody}</p>
      <a href="/panel">
        <Button>{t.shell.menu.panel}</Button>
      </a>
    </main>
  );
}
