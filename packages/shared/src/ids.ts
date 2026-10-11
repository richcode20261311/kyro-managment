/**
 * IDs UUID v7 generados en el cliente (PHASES.md: permiten trabajar sin conexión).
 * Formato: 48 bits de tiempo (ms) + versión 7 + aleatoriedad + variante RFC 4122.
 * Son lexicográficamente ordenables por fecha (una fila nueva "mayor" que una vieja).
 */
export type UuidV7 = string;

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

let lastTimestamp = -1;
/** 10 bytes aleatorios: [0]=rand_a alto, [1]=rand_a, [2]=variante, [3..9]=cola del contador. */
let lastRandom: Uint8Array | null = null;

/**
 * Incrementa la cola de 7 bytes (bytes 9..15 del UUID). Si se desborda (prácticamente
 * imposible: 2^56 IDs en el mismo milisegundo), se re-aleatoriza y el orden lo garantiza
 * el timestamp.
 */
function incrementTail(tail: Uint8Array): boolean {
  for (let i = tail.length - 1; i >= 0; i -= 1) {
    const next = (tail[i] ?? 0) + 1;
    tail[i] = next & 0xff;
    if (next <= 0xff) return true;
  }
  return false;
}

export function newId(at: number = Date.now()): UuidV7 {
  const timestampBytes = new Uint8Array(6);
  let timestamp = at;
  for (let i = 5; i >= 0; i -= 1) {
    timestampBytes[i] = timestamp % 256;
    timestamp = Math.floor(timestamp / 256);
  }

  if (at === lastTimestamp && lastRandom && incrementTail(lastRandom.subarray(3))) {
    // Mismo milisegundo: solo avanza la cola; bytes 6-8 quedan iguales → orden estricto.
  } else {
    lastRandom = randomBytes(10);
    lastTimestamp = at;
  }
  const random = lastRandom;

  const bytes = new Uint8Array(16);
  bytes.set(timestampBytes, 0);
  bytes[6] = 0x70 | ((random[0] ?? 0) & 0x0f); // versión 7
  bytes[7] = random[1] ?? 0;
  bytes[8] = 0x80 | ((random[2] ?? 0) & 0x3f); // variante RFC 4122 (10xx)
  bytes.set(random.subarray(3, 10), 9);

  let uuid = '';
  for (let i = 0; i < 16; i += 1) {
    const byte = bytes[i] ?? 0;
    uuid += (byte >> 4).toString(16) + (byte & 0x0f).toString(16);
    if (i === 3 || i === 5 || i === 7 || i === 9) uuid += '-';
  }
  return uuid;
}

/** `true` si la cadena tiene forma de UUID (cualquier versión). */
export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/** Versión del UUID (7 para los generados aquí). */
export function uuidVersion(uuid: UuidV7): number {
  return Number.parseInt(uuid.charAt(14), 16);
}

/** Timestamp (ms) embebido en un UUID v7. */
export function uuidTimestamp(uuid: UuidV7): number {
  return Number.parseInt(uuid.replace(/-/g, '').slice(0, 12), 16);
}
