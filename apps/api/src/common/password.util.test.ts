import { describe, expect, it } from 'vitest';
import { hashSecret, verifySecret } from './password.util';

describe('hashSecret / verifySecret (scrypt)', () => {
  it('verifica el secreto correcto y rechaza otro', async () => {
    const stored = await hashSecret('Admin1234!');
    expect(await verifySecret('Admin1234!', stored)).toBe(true);
    expect(await verifySecret('otra-clave', stored)).toBe(false);
  });

  it('produce hashes distintos para el mismo secreto (salt único)', async () => {
    const a = await hashSecret('1234');
    const b = await hashSecret('1234');
    expect(a).not.toBe(b);
    expect(await verifySecret('1234', a)).toBe(true);
    expect(await verifySecret('1234', b)).toBe(true);
  });

  it('rechaza formatos corruptos sin lanzar excepciones', async () => {
    expect(await verifySecret('x', 'texto-cualquiera')).toBe(false);
    expect(await verifySecret('x', 'scrypt:solo-dos-partes')).toBe(false);
    expect(await verifySecret('x', '')).toBe(false);
  });
});
