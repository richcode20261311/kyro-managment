'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { t } from '@aki/shared';
import { cn } from '../cn';
import { bottomNavIds, visibleSections, type MenuId, type Role } from './menu';

interface MoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeItem: MenuId | null;
  role: Role;
}

/**
 * Hoja "Más" en móvil: el resto del menú agrupado en Operación, Gestión y
 * Administración (DESIGN-CONTRACT §6). La capa oscura cubre toda la pantalla.
 */
export function MoreSheet({ open, onOpenChange, activeItem, role }: MoreSheetProps) {
  // Solo los ítems que NO están en la barra inferior (los "demás" del contrato).
  const sections = visibleSections(role)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !(bottomNavIds as readonly MenuId[]).includes(item.id)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white pb-6 pt-4 tablet:max-w-md tablet:inset-x-auto tablet:left-1/2 tablet:-translate-x-1/2 tablet:rounded-2xl">
          <div className="mb-2 flex items-center justify-between px-4">
            <Dialog.Title className="font-display text-lg font-semibold">{t.shell.more}</Dialog.Title>
            <Dialog.Close className="grid size-11 place-items-center rounded-xl hover:bg-black/5">
              <X className="size-6" strokeWidth={1.75} aria-label={t.actions.close} />
            </Dialog.Close>
          </div>

          {sections.map((section) => (
            <section key={section.id} className="mt-3">
              <p className="px-4 pb-1 text-xs font-medium uppercase text-aki-muted">
                {section.label}
              </p>
              <ul>
                {section.items.map((item) => {
                  const isActive = item.id === activeItem;
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'flex h-12 items-center gap-3 border-l-4 px-4 text-base',
                          isActive
                            ? 'border-aki-red bg-aki-red/8 font-medium text-aki-red'
                            : 'border-transparent text-aki-ink',
                        )}
                      >
                        <Icon className="size-6 shrink-0" strokeWidth={1.75} />
                        <span className="min-w-0 truncate">{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
