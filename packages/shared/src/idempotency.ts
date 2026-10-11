/**
 * Claves de idempotencia para operaciones de dinero y de sincronización offline
 * (AGENTS.md · Seguridad). El cliente las genera; el servidor las usa para no repetir efectos.
 */
export type IdempotencyKey = string & { readonly __brand: 'IdempotencyKey' };
export type TenantId = string & { readonly __brand: 'TenantId' };

export function newIdempotencyKey(): IdempotencyKey {
  // Formato: `ik_<uuid v7>` — legible en logs y trazable en el tiempo.
  return `ik_${crypto.randomUUID()}` as IdempotencyKey;
}

export function isIdempotencyKey(value: string): value is IdempotencyKey {
  return /^ik_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
