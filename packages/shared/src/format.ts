/**
 * Formateadores únicos para toda la UI (DESIGN-CONTRACT §9).
 * Reglas: COP sin decimales ni sufijo "COP", fechas dd/mm/yyyy, horas 1:26 p. m.
 */

const copFormatters = new Map<string, Intl.NumberFormat>();

function copFormatter(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = JSON.stringify(options);
  let formatter = copFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat('es-CO', options);
    copFormatters.set(key, formatter);
  }
  return formatter;
}

/** Normaliza el espacio no separable que Intl pone tras el símbolo: `$ 48.000` → `$48.000`. */
function withSymbol(value: string): string {
  return value.replace(/\s+/g, '');
}

/**
 * `formatCOP(48000)` → `"$48.000"` · `formatCOP(-48000)` → `"-$48.000"`.
 * Sin decimales y sin el texto "COP" junto a la cifra (eso lo elimina la normalización de Stitch).
 */
export function formatCOP(value: number): string {
  const formatted = copFormatter({
    style: 'currency',
    currency: 'COP',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return withSymbol(formatted);
}

/** `formatDate(new Date())` → `"10/10/2026"` (dd/mm/yyyy, es-CO). */
export function formatDate(date: Date | number | string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(toDate(date));
}

/** `formatTime(new Date())` → `"1:26 p. m."` (es-CO). */
export function formatTime(date: Date | number | string): string {
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(toDate(date));
}

/** `formatPercent(0.08)` → `"8%"` (INC, propinas). */
export function formatPercent(ratio: number, digits = 0): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(ratio);
}

/** Minutos para cronómetros del KDS: `formatDuration(125)` → `"2:05"`. */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(Math.abs(totalSeconds) / 60);
  const seconds = Math.abs(totalSeconds) % 60;
  const sign = totalSeconds < 0 ? '-' : '';
  return `${sign}${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** Encabezados de página (§9): `formatDateHeader(new Date())` → `"Sábado, 10/10/2026"`. */
export function formatDateHeader(date: Date | number | string): string {
  const weekday = new Intl.DateTimeFormat('es-CO', { weekday: 'long' }).format(toDate(date));
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalized}, ${formatDate(date)}`;
}

function toDate(value: Date | number | string): Date {
  return value instanceof Date ? value : new Date(value);
}
