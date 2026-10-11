const UNIT_MS = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 } as const;

/** Duración en el formato admitido por `parseDuration` (compatible con `ms`). */
export type Duration = `${number}${keyof typeof UNIT_MS}`;

/** Convierte duraciones tipo `15m`, `30d`, `2h` a milisegundos. */
export function parseDuration(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  const unit = match?.[2] as keyof typeof UNIT_MS | undefined;
  if (!match || !unit) {
    throw new Error(`Duración inválida: "${value}" (usa formatos como 15m, 2h o 30d)`);
  }
  return Number(match[1]) * UNIT_MS[unit];
}

/** Lee una duración del entorno, valida el formato y la devuelve tipada. */
export function readDuration(name: string, fallback: Duration): Duration {
  const raw = process.env[name] ?? fallback;
  parseDuration(raw);
  return raw as Duration;
}
