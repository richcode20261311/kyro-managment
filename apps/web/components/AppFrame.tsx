'use client';

import { usePathname } from 'next/navigation';
import { AppShell, menuIdFromPath, type Role } from '@aki/ui';

/**
 * Conecta `AppShell` con la ruta actual: resalta el ítem del menú que corresponde
 * a la sección activa (docs/SCREEN-MAP.md).
 */
export function AppFrame({
  role = 'administrador',
  children,
}: {
  role?: Role;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AppShell activeItem={menuIdFromPath(pathname)} role={role}>
      {children}
    </AppShell>
  );
}
