/**
 * Tipos base de dominio compartidos entre web y api.
 * Multi-tenant desde el día 1: toda entidad pertenece a un `tenantId` (RLS en PostgreSQL).
 */

/** Campos de auditoría presentes en todas las tablas. */
export interface Auditable {
  createdAt: string;
  updatedAt: string;
  /** Borrado lógico: nunca se borra físico en tablas de negocio. */
  deletedAt?: string | null;
}

export interface TenantScoped extends Auditable {
  tenantId: string;
}

/** Estados globales que toda pantalla debe cubrir (AGENTS.md). */
export type GlobalScreenStatus = 'loading' | 'empty' | 'error' | 'offline' | 'forbidden';

/** Respuesta paginada estándar de la API. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
