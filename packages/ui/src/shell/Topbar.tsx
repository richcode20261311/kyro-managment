'use client';

import { Bell, ChevronDown, Plus, Search } from 'lucide-react';
import { t } from '@aki/shared';
import { cn } from '../cn';

export interface TopbarProps {
  /** Abre la búsqueda global (C3, Ctrl+K) — su contenido se conecta en la Fase 2. */
  onSearch?: () => void;
  onNotifications?: () => void;
  onNewOrder?: () => void;
  /** Número de avisos sin leer; > 0 muestra el punto rojo. */
  notificationsCount?: number;
  sede?: string;
  cajaAbierta?: boolean;
  userName?: string;
}

/**
 * Barra superior de 72 px, una sola fila, todo en una línea (DESIGN-CONTRACT §6).
 * Si algo no cabe, se acorta el buscador: nunca el botón `Nuevo pedido` ni el avatar.
 */
export function Topbar({
  onSearch,
  onNotifications,
  onNewOrder,
  notificationsCount = 0,
  sede = 'Sede Cajicá',
  cajaAbierta = true,
  userName = 'Andrea Medina',
}: TopbarProps) {
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-topbar items-center gap-2 border-b border-aki-line bg-white px-4 desktop:gap-3 desktop:px-8">
      <button
        type="button"
        onClick={onSearch}
        className="flex h-12 min-w-0 shrink items-center gap-2 rounded-xl border border-aki-line px-3 text-sm text-aki-muted hover:border-black/20 desktop:w-64"
        aria-label={t.shell.search}
      >
        <Search className="size-4 shrink-0" strokeWidth={1.75} />
        <span className="min-w-0 truncate">{t.shell.search}</span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-aki-line px-1.5 text-xs desktop:block">
          Ctrl+K
        </kbd>
      </button>

      <button
        type="button"
        className="hidden h-12 shrink-0 items-center gap-1 rounded-xl px-3 text-sm font-medium tablet:flex"
      >
        {sede}
        <ChevronDown className="size-4" strokeWidth={1.75} aria-hidden />
      </button>

      <span className="hidden h-12 shrink-0 items-center gap-2 rounded-xl px-3 text-sm tablet:flex">
        <span
          className={cn('size-2.5 rounded-full', cajaAbierta ? 'bg-aki-success' : 'bg-aki-muted')}
          aria-hidden
        />
        {cajaAbierta ? 'Caja abierta' : 'Caja cerrada'}
      </span>

      <div className="ml-auto flex shrink-0 items-center gap-2 desktop:gap-3">
        <button
          type="button"
          onClick={onNotifications}
          aria-label={t.shell.notifications}
          className="relative grid size-12 place-items-center rounded-xl hover:bg-black/5"
        >
          <Bell className="size-6" strokeWidth={1.75} />
          {notificationsCount > 0 && (
            <span className="absolute right-2.5 top-2.5 size-2.5 rounded-full bg-aki-red" />
          )}
        </button>

        <button
          type="button"
          onClick={onNewOrder}
          className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-aki-red px-4 text-sm font-semibold text-white hover:bg-aki-error"
        >
          <Plus className="size-5" strokeWidth={1.75} aria-hidden />
          Nuevo pedido
        </button>

        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-aki-red to-aki-orange text-sm font-semibold text-white">
          {initials}
        </span>
      </div>
    </header>
  );
}
