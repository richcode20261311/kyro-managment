import type { TenantSelectionChallenge } from '@aki/shared';

/**
 * Reto de selección de restaurante (A1 multi-tenant) en memoria del módulo:
 * solo vive en la pestaña abierta, nunca se guarda en localStorage ni en
 * sessionStorage (no persistimos tokens fuera de la sesión de la pestaña).
 * Si la página se recarga, el reto se pierde y el usuario repite el login.
 */
let pending: TenantSelectionChallenge | null = null;

export function setPendingTenantSelection(challenge: TenantSelectionChallenge): void {
  pending = challenge;
}

export function readPendingTenantSelection(): TenantSelectionChallenge | null {
  return pending;
}

export function clearPendingTenantSelection(): void {
  pending = null;
}
