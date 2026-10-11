import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;
const KEY_LENGTH = 64;
const SALT_BYTES = 16;
const SCHEME = 'scrypt';

/**
 * Hash de secretos (contraseña y PIN) con scrypt de Node.
 * Formato: `scrypt:<salt hex>:<hash hex>` — verificable sin dependencias externas.
 */
export async function hashSecret(secret: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const derived = await scrypt(secret, salt, KEY_LENGTH);
  return `${SCHEME}:${salt}:${derived.toString('hex')}`;
}

export async function verifySecret(secret: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split(':');
  if (scheme !== SCHEME || !salt || !hash) return false;

  const expected = Buffer.from(hash, 'hex');
  const derived = await scrypt(secret, salt, KEY_LENGTH);
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
