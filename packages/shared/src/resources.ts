/**
 * Recursos (ítems del menú oficial) y acciones de permiso.
 * Es la base de los permisos por rol de PHASES.md; el test de `@aki/ui`
 * verifica que esta lista y el menú visual nunca diverjan.
 */

export const RESOURCE_IDS = [
  'panel',
  'mesas',
  'pedidos',
  'domicilios',
  'cocina',
  'caja',
  'menu',
  'inventario',
  'compras',
  'clientes',
  'whatsapp',
  'reservas',
  'facturacion',
  'personal',
  'reportes',
  'configuracion',
] as const;

export type ResourceId = (typeof RESOURCE_IDS)[number];

export const PERMISSION_ACTIONS = ['VER', 'CREAR', 'EDITAR', 'ANULAR', 'APROBAR'] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const ROLES = ['administrador', 'cajero', 'mesero', 'cocinero', 'domiciliario'] as const;
export type RoleId = (typeof ROLES)[number];

/**
 * Recursos que cada rol ve en el menú (DESIGN-CONTRACT §6).
 * Son la base de los permisos `VER`; las acciones de escritura se suman
 * por rol según su operación diaria.
 */
export const VISIBLE_RESOURCES: Record<RoleId, readonly ResourceId[]> = {
  administrador: RESOURCE_IDS,
  cajero: ['panel', 'mesas', 'pedidos', 'domicilios', 'caja', 'clientes'],
  mesero: ['mesas', 'pedidos', 'caja'],
  cocinero: ['cocina'],
  domiciliario: ['domicilios'],
};

/**
 * Acciones de escritura por rol (fuera de `VER`).
 * El administrador ya cubre todo con el cruce completo de RESOURCE_IDS × acciones.
 */
export const WRITE_RESOURCES: Partial<
  Record<RoleId, Partial<Record<PermissionAction, readonly ResourceId[]>>>
> = {
  cajero: { CREAR: ['pedidos', 'caja'], EDITAR: ['pedidos'] },
  mesero: { CREAR: ['pedidos'], EDITAR: ['pedidos'] },
  cocinero: { EDITAR: ['pedidos'] },
  domiciliario: { EDITAR: ['domicilios'] },
};
