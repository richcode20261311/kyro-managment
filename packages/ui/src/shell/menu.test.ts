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
} from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { RESOURCE_IDS, ROLES, VISIBLE_RESOURCES } from '@aki/shared';
import { bottomNavIds, itemCount, menuSections, visibleSections } from './menu';

const flat = menuSections.flatMap((section) => section.items);

describe('menú oficial (DESIGN-CONTRACT §6)', () => {
  it('tiene exactamente 16 ítems', () => {
    expect(itemCount).toBe(16);
    expect(flat).toHaveLength(16);
  });

  it('respeta las 3 secciones y su orden', () => {
    expect(menuSections.map((section) => section.label)).toEqual([
      'Operación',
      'Gestión',
      'Administración',
    ]);
    expect(menuSections.map((section) => section.items.length)).toEqual([6, 6, 4]);
  });

  it('respeta nombres e iconos exactos, en orden', () => {
    const expected = [
      ['Panel principal', LayoutDashboard],
      ['Mesas', Armchair],
      ['Pedidos / POS', ClipboardList],
      ['Domicilios', Bike],
      ['Cocina', ChefHat],
      ['Caja', Banknote],
      ['Menú', BookOpen],
      ['Inventario', Package],
      ['Compras', ShoppingBasket],
      ['Clientes', Users],
      ['WhatsApp', MessageCircle],
      ['Reservas', CalendarDays],
      ['Facturación', FileText],
      ['Personal', UserCog],
      ['Reportes', BarChart3],
      ['Configuración', Settings],
    ] as const;

    expect(flat.map((item) => [item.label, item.icon])).toEqual(expected);
  });

  it('ningún ítem contiene "//" (prohibido fuera del breadcrumb)', () => {
    for (const item of flat) {
      expect(item.label).not.toContain('//');
    }
  });
});

describe('menú filtrado por rol', () => {
  it('el administrador ve los 16', () => {
    expect(visibleSections('administrador')).toHaveLength(3);
    expect(visibleSections('administrador').flatMap((s) => s.items)).toHaveLength(16);
  });

  it('el cajero ve 6: panel, mesas, pedidos, domicilios, caja, clientes', () => {
    const ids = visibleSections('cajero').flatMap((section) => section.items.map((i) => i.id));
    expect(ids).toEqual(['panel', 'mesas', 'pedidos', 'domicilios', 'caja', 'clientes']);
  });

  it('el mesero ve 3: mesas, pedidos, caja', () => {
    const ids = visibleSections('mesero').flatMap((section) => section.items.map((i) => i.id));
    expect(ids).toEqual(['mesas', 'pedidos', 'caja']);
  });

  it('el domiciliario ve domicilios', () => {
    const ids = visibleSections('domiciliario').flatMap((section) =>
      section.items.map((i) => i.id),
    );
    expect(ids).toEqual(['domicilios']);
  });

  it('la barra inferior móvil usa los 5 accesos definidos', () => {
    expect([...bottomNavIds]).toEqual(['mesas', 'pedidos', 'caja', 'clientes']);
  });
});

describe('paridad con @aki/shared (permisos y recursos)', () => {
  it('los ids del menú son exactamente RESOURCE_IDS, en orden', () => {
    expect(flat.map((item) => item.id)).toEqual([...RESOURCE_IDS]);
  });

  it('la visibilidad por rol del menú coincide con VISIBLE_RESOURCES', () => {
    for (const role of ROLES) {
      const menuIds = visibleSections(role).flatMap((section) =>
        section.items.map((item) => item.id),
      );
      expect(menuIds).toEqual([...VISIBLE_RESOURCES[role]]);
    }
  });
});
