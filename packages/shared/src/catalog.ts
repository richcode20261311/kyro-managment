/**
 * Catálogo único de textos es-CO (AGENTS.md · Reglas de código).
 * Este archivo cubre textos globales y transversales; cada módulo añade su catálogo
 * en su fase. Ningún texto de UI se escribe "suelo" en los componentes.
 */
export const t = {
  app: {
    name: 'AKI Admin',
    breadcrumbSeparator: '//',
  },
  shell: {
    menu: {
      panel: 'Panel principal',
      mesas: 'Mesas',
      pedidos: 'Pedidos / POS',
      domicilios: 'Domicilios',
      cocina: 'Cocina',
      caja: 'Caja',
      facturacion: 'Facturación',
      menu: 'Menú',
      inventario: 'Inventario',
      compras: 'Compras',
      reportes: 'Reportes',
      clientes: 'Clientes',
      whatsapp: 'WhatsApp',
      reservas: 'Reservas',
      personal: 'Personal',
      configuracion: 'Configuración',
    } as const,
    notifications: 'Notificaciones',
    search: 'Buscar',
    searchHint: 'Buscar pedidos, mesas, clientes…',
    more: 'Más',
    logout: 'Cerrar sesión',
  },
  states: {
    loading: 'Cargando…',
    emptyTitle: 'Sin resultados',
    emptyBody: 'Aún no hay nada aquí.',
    errorTitle: 'Algo salió mal',
    errorBody: 'No pudimos cargar la información.',
    retry: 'Reintentar',
    offlineTitle: 'Sin conexión',
    offlineBody: 'Sin conexión: tus pedidos se sincronizarán al volver.',
    forbiddenTitle: 'Sin permisos',
    forbiddenBody: 'Tu rol no tiene permiso para ver esta sección.',
    sessionExpiredTitle: 'Sesión expirada',
    sessionExpiredBody: 'Vuelve a iniciar sesión para continuar.',
    notFoundTitle: 'Página no encontrada',
    notFoundBody: 'La página que buscas no existe o fue movida.',
    pendingSync: (count: number) =>
      count === 1
        ? '1 acción pendiente de sincronizar'
        : `${count} acciones pendientes de sincronizar`,
  },
  actions: {
    save: 'Guardar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    search: 'Buscar',
    clear: 'Limpiar',
    close: 'Cerrar',
    back: 'Volver',
    next: 'Siguiente',
    print: 'Imprimir',
    export: 'Exportar',
    refresh: 'Actualizar',
    retry: 'Reintentar',
  },
  confirm: {
    destructiveTitle: '¿Confirmas esta acción?',
    destructiveBody: 'Esta acción no se puede deshacer.',
    reasonRequired: 'El motivo es obligatorio.',
  },
} as const;

export type Catalog = typeof t;
