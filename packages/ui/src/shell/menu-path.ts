import { menuSections, type MenuId } from './menu';

/**
 * Deduce el ítem activo del menú a partir de la ruta actual
 * (coincidencia por segmento: `/menu` no se come `/mesas`).
 */
export function menuIdFromPath(pathname: string): MenuId | null {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const match = menuSections
    .flatMap((section) => section.items)
    .find(
      (item) => normalized === item.href || normalized.startsWith(`${item.href}/`),
    );
  return match?.id ?? null;
}
