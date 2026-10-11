'use client';

import { WifiOff } from 'lucide-react';
import { t } from '@aki/shared';
import { useOnlineStatus } from './useOnlineStatus';

/**
 * Banner "Sin conexión" (§7): se muestra solo mientras no haya red,
 * con la cuenta de acciones pendientes de sincronizar de la cola offline.
 */
export function OfflineBanner({ pendingCount = 0 }: { pendingCount?: number }) {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[70] flex min-h-12 items-center justify-center gap-2 bg-aki-ink px-4 py-2 text-center text-sm font-medium text-white"
    >
      <WifiOff className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="min-w-0">{t.states.offlineBody}</span>
      {pendingCount > 0 && (
        <span className="hidden shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs desktop:block">
          {t.states.pendingSync(pendingCount)}
        </span>
      )}
    </div>
  );
}
