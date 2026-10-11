'use client';

import { useState, type ReactNode } from 'react';
import { t } from '@aki/shared';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { MoreSheet } from './MoreSheet';
import { type MenuId, type Role } from './menu';
export interface AppShellProps {
  /** Ítem resaltado del menú (según docs/SCREEN-MAP.md). `null` si no se resalta ninguno. */
  activeItem: MenuId | null;
  role?: Role;
  userName?: string;
  userRoleLabel?: string;
  children: ReactNode;
}

/**
 * Shell único de AKI Admin (DESIGN-CONTRACT §6):
 * - Escritorio ≥1280: sidebar 264 px.
 * - Tablet ≥1024: riel de 88 px con iconos.
 * - Móvil <1024: barra inferior de 5 accesos + hoja "Más".
 * Las pantallas sin shell (Acceso, Cocina, `/reservar`) no usan este componente.
 */
export function AppShell({
  activeItem,
  role = 'administrador',
  userName = 'Andrea Medina',
  userRoleLabel = 'Administrador',
  children,
}: AppShellProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="min-h-screen bg-aki-bg">
      <Sidebar
        activeItem={activeItem}
        role={role}
        userName={userName}
        userRoleLabel={userRoleLabel}
      />

      <div className="tablet:ml-[88px] desktop:ml-[264px]">
        <Topbar userName={userName} />
        <main className="px-4 pb-24 pt-6 tablet:px-6 tablet:pb-8 desktop:px-8">{children}</main>
      </div>

      <BottomNav activeItem={activeItem} role={role} onMore={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} activeItem={activeItem} role={role} />

      <span className="sr-only">{t.app.name}</span>
    </div>
  );
}
