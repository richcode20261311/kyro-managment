'use client';

import { Armchair, Banknote, ClipboardList, Menu, Users } from 'lucide-react';
import { t } from '@aki/shared';
import { cn } from '../cn';
import { bottomNavIds, menuSections, type MenuId, type Role } from './menu';

interface BottomNavProps {
  activeItem: MenuId | null;
  role: Role;
  onMore: () => void;
}

const ICONS = {
  mesas: Armchair,
  pedidos: ClipboardList,
  caja: Banknote,
  clientes: Users,
} as const;

/**
 * Barra inferior de 5 accesos en móvil (DESIGN-CONTRACT §6):
 * Mesas, Pedidos, Caja, Clientes y "Más" (abre la hoja con el resto agrupado).
 */
export function BottomNav({ activeItem, role, onMore }: BottomNavProps) {
  const visibleIds = new Set(
    menuSections.flatMap((section) =>
      section.items.filter((item) => item.roles.includes(role)).map((item) => item.id),
    ),
  );
  const primary = bottomNavIds.filter((id) => visibleIds.has(id));
  const hasMore = menuSections.some((section) =>
    section.items.some(
      (item) => item.roles.includes(role) && !(bottomNavIds as readonly MenuId[]).includes(item.id),
    ),
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-aki-line bg-white tablet:hidden"
      aria-label="Navegación principal"
    >
      {primary.map((id) => {
        const item = menuSections
          .flatMap((section) => section.items)
          .find((candidate) => candidate.id === id);
        if (!item) return null;
        const Icon = ICONS[id];
        const isActive = id === activeItem;
        return (
          <a
            key={id}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[11px]',
              isActive ? 'text-aki-red' : 'text-aki-ink',
            )}
          >
            <Icon className="size-6" strokeWidth={1.75} />
            <span className="truncate">{item.label}</span>
          </a>
        );
      })}
      {hasMore && (
        <button
          type="button"
          onClick={onMore}
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] text-aki-ink"
        >
          <Menu className="size-6" strokeWidth={1.75} />
          {t.shell.more}
        </button>
      )}
    </nav>
  );
}
