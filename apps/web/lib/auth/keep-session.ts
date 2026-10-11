/**
 * Preferencia "Mantener sesión iniciada" (A1): controla si, al volver a abrir la
 * app, se restaura la sesión en silencio desde la cookie httpOnly. La cookie en
 * sí vive 30 días (REFRESH_TOKEN_TTL) y se endurecerá en la Fase 10 de seguridad.
 */
const KEY = 'aki:mantener-sesion';

export function setKeepSession(enabled: boolean): void {
  localStorage.setItem(KEY, enabled ? '1' : '0');
}

/** Por defecto se restaura la sesión. */
export function keepSessionEnabled(): boolean {
  if (typeof localStorage === 'undefined') return true;
  return localStorage.getItem(KEY) !== '0';
}
