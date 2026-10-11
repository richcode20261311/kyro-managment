import { describe, expect, it } from 'vitest';
import { isUuid, newId, uuidTimestamp, uuidVersion } from './ids';

describe('newId (UUID v7)', () => {
  it('genera IDs con forma de UUID', () => {
    expect(isUuid(newId())).toBe(true);
  });

  it('usa versión 7 y variante RFC 4122', () => {
    const id = newId();
    expect(uuidVersion(id)).toBe(7);
    expect(id.charAt(19)).toMatch(/[89ab]/);
  });

  it('embebe el timestamp enviado', () => {
    const at = Date.UTC(2026, 9, 10);
    expect(uuidTimestamp(newId(at))).toBe(at);
  });

  it('es único', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => newId()));
    expect(ids.size).toBe(1000);
  });

  it('es ordenable por tiempo (los nuevos son lexicográficamente mayores)', () => {
    const older = newId(1_700_000_000_000);
    const newer = newId(1_800_000_000_000);
    expect(newer > older).toBe(true);
  });

  it('es estrictamente monotónico dentro del mismo milisegundo', () => {
    const at = Date.UTC(2026, 9, 10, 12);
    const ids = Array.from({ length: 200 }, () => newId(at));
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
