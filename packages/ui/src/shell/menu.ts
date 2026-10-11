import {
  Armchair,
  Banknote,
  BarChart3,
  Bike,
  BookOpen,
  CalendarDays,
  ChefHat,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Package,
  Settings,
  ShoppingBasket,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { t } from '@aki/shared';

/** Identidad de menú: coincide con el "Activo" de docs/SCREEN-MAP.md. */
export type MenuId =
  | 'panel'
  | 'mesas'
  | 'pedidos'
  | 'domicilios'
  | 'cocina'
  | 'caja'
  | 'menu'
  | 'inventario'
  | 'compras'
  | 'clientes'
  | 'whatsapp'
  | 'reservas'
  | 'facturacion'
  | 'personal'
  | 'reportes'
  | 'configuracion';

export type Role = 'administrador' | 'cajero' | 'mesero' | 'cocinero' | 'domiciliario';

export interface MenuItem {
  id: MenuId;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Roles que ven este ítem (DESIGN-CONTRACT §6). */
  roles: readonly Role[];
}

export type SectionId = 'operacion' | 'gestion' | 'administracion';

export interface MenuSection {
  id: SectionId;
  label: string;
  items: MenuItem[];
}

/**
 * Menú oficial: 16 ítems, orden y iconos exactos del DESIGN-CONTRACT §6.
 * No se añaden, renombran ni reordenan ítems sin actualizar el contrato primero.
 */
export const menuSections: readonly MenuSection[] = [
  {
    id: 'operacion',
    label: 'Operación',
    items: [
      {
        id: 'panel',
        label: t.shell.menu.panel,
        href: '/panel',
        icon: LayoutDashboard,
        roles: ['administrador', 'cajero'],
      },
      {
        id: 'mesas',
        label: t.shell.menu.mesas,
        href: '/mesas',
        icon: Armchair,
        roles: ['administrador', 'cajero', 'mesero'],
      },
      {
        id: 'pedidos',
        label: t.shell.menu.pedidos,
        href: '/pedidos',
        icon: ClipboardList,
        roles: ['administrador', 'cajero', 'mesero'],
      },
      {
        id: 'domicilios',
        label: t.shell.menu.domicilios,
        href: '/domicilios',
        icon: Bike,
        roles: ['administrador', 'cajero', 'domiciliario'],
      },
      {
        id: 'cocina',
        label: t.shell.menu.cocina,
        href: '/cocina',
        icon: ChefHat,
        roles: ['administrador', 'cocinero'],
      },
      {
        id: 'caja',
        label: t.shell.menu.caja,
        href: '/caja',
        icon: Banknote,
        roles: ['administrador', 'cajero', 'mesero'],
      },
    ],
  },
  {
    id: 'gestion',
    label: 'Gestión',
    items: [
      {
        id: 'menu',
        label: t.shell.menu.menu,
        href: '/menu',
        icon: BookOpen,
        roles: ['administrador'],
      },
      {
        id: 'inventario',
        label: t.shell.menu.inventario,
        href: '/inventario',
        icon: Package,
        roles: ['administrador'],
      },
      {
        id: 'compras',
        label: t.shell.menu.compras,
        href: '/compras',
        icon: ShoppingBasket,
        roles: ['administrador'],
      },
      {
        id: 'clientes',
        label: t.shell.menu.clientes,
        href: '/clientes',
        icon: Users,
        roles: ['administrador', 'cajero'],
      },
      {
        id: 'whatsapp',
        label: t.shell.menu.whatsapp,
        href: '/whatsapp',
        icon: MessageCircle,
        roles: ['administrador'],
      },
      {
        id: 'reservas',
        label: t.shell.menu.reservas,
        href: '/reservas',
        icon: CalendarDays,
        roles: ['administrador'],
      },
    ],
  },
  {
    id: 'administracion',
    label: 'Administración',
    items: [
      {
        id: 'facturacion',
        label: t.shell.menu.facturacion,
        href: '/facturacion',
        icon: FileText,
        roles: ['administrador'],
      },
      {
        id: 'personal',
        label: t.shell.menu.personal,
        href: '/personal',
        icon: UserCog,
        roles: ['administrador'],
      },
      {
        id: 'reportes',
        label: t.shell.menu.reportes,
        href: '/reportes',
        icon: BarChart3,
        roles: ['administrador'],
      },
      {
        id: 'configuracion',
        label: t.shell.menu.configuracion,
        href: '/configuracion',
        icon: Settings,
        roles: ['administrador'],
      },
    ],
  },
] as const;

/** Ítems del menú filtrados por rol (el componente es el mismo, se oculta lo que no aplica). */
export function visibleSections(role: Role): MenuSection[] {
  return menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);
}

/** Accesos de la barra inferior en móvil (DESIGN-CONTRACT §6): Mesas, Pedidos, Caja, Clientes, Más. */
export const bottomNavIds = ['mesas', 'pedidos', 'caja', 'clientes'] as const;

export const itemCount = menuSections.reduce((total, section) => total + section.items.length, 0);
