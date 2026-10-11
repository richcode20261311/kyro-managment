import { WifiOff } from 'lucide-react';
import { t } from '@aki/shared';

/** /~offline — destino del service worker cuando no hay red y no hay caché. */
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-aki-bg p-6 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-black/5 text-aki-muted">
        <WifiOff className="size-8" strokeWidth={1.75} />
      </span>
      <p className="font-display text-2xl font-semibold text-aki-ink">
        {t.states.offlineTitle}
      </p>
      <p className="max-w-md text-sm text-aki-muted">{t.states.offlineBody}</p>
      <a
        href="/panel"
        className="inline-flex h-12 items-center rounded-xl bg-aki-red px-5 text-sm font-semibold text-white"
      >
        {t.actions.retry}
      </a>
    </main>
  );
}
