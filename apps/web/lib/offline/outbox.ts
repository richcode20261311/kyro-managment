import Dexie, { type Table } from 'dexie';

/**
 * Cola de acciones sin conexión (IndexedDB/Dexie).
 *
 * Fase 1: esquema y helpers base. La lógica de sincronización, reintentos y
 * resolución de conflictos (el servidor decide) se completa en la Fase 10.
 * Toda acción lleva `idempotencyKey` para que el servidor no duplique efectos
 * (AGENTS.md · Seguridad).
 */
export type OutboxStatus = 'pending' | 'syncing' | 'synced' | 'error';

export interface OutboxAction {
  /** UUIDv7 generado en el cliente (permite crear pedidos sin red). */
  id: string;
  /** Endpoint de destino, p. ej. `POST /api/orders`. */
  route: string;
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  payload: unknown;
  /** Clave única por operación de dinero/sincronización. */
  idempotencyKey: string;
  status: OutboxStatus;
  /** Intentos de sincronización fallidos. */
  attempts: number;
  createdAt: string;
  lastError?: string;
}

class AkiDatabase extends Dexie {
  outbox!: Table<OutboxAction, string>;

  constructor() {
    super('aki-admin');
    this.version(1).stores({
      outbox: 'id, status, createdAt',
    });
  }
}

export const db = new AkiDatabase();

/** Encola una acción para reintentarla al volver la red. */
export async function enqueue(action: OutboxAction): Promise<void> {
  await db.outbox.put(action);
}

/** Acciones aún no sincronizadas (para el banner "Sin conexión"). */
export async function pendingActions(): Promise<OutboxAction[]> {
  return db.outbox.where('status').anyOf('pending', 'error').sortBy('createdAt');
}

/** Número de pendientes para el banner. */
export async function pendingCount(): Promise<number> {
  return db.outbox.where('status').anyOf('pending', 'error').count();
}

/** Marca una acción como sincronizada. */
export async function markSynced(id: string): Promise<void> {
  await db.outbox.update(id, { status: 'synced' });
}

/** Registra un fallo con el motivo (visible en auditoría/soporte). */
export async function markError(id: string, error: string): Promise<void> {
  const current = await db.outbox.get(id);
  await db.outbox.update(id, {
    status: 'error',
    attempts: (current?.attempts ?? 0) + 1,
    lastError: error,
  });
}
