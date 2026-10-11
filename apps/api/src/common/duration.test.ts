import { describe, expect, it } from 'vitest';
import { parseDuration } from './duration';

describe('parseDuration', () => {
  it('convierte segundos, minutos, horas y días', () => {
    expect(parseDuration('30s')).toBe(30_000);
    expect(parseDuration('15m')).toBe(900_000);
    expect(parseDuration('2h')).toBe(7_200_000);
    expect(parseDuration('30d')).toBe(2_592_000_000);
  });

  it('rechaza formatos inválidos', () => {
    expect(() => parseDuration('15')).toThrow();
    expect(() => parseDuration('15min')).toThrow();
    expect(() => parseDuration('x')).toThrow();
  });
});
