import { describe, expect, it } from 'vitest';
import { formatCOP, formatDate, formatDuration, formatPercent, formatTime } from './format';

describe('formatCOP', () => {
  it('formatea sin decimales y sin sufijo COP', () => {
    expect(formatCOP(48000)).toBe('$48.000');
    expect(formatCOP(0)).toBe('$0');
    expect(formatCOP(1234567)).toBe('$1.234.567');
  });

  it('formatea negativos con el signo antes del símbolo', () => {
    expect(formatCOP(-48000)).toBe('-$48.000');
  });

  it('no deja espacios entre símbolo y cifra', () => {
    expect(formatCOP(48000)).not.toMatch(/\s/);
  });
});

describe('formatDate', () => {
  it('usa el formato dd/mm/yyyy', () => {
    expect(formatDate(new Date(2026, 9, 10))).toBe('10/10/2026');
    expect(formatDate(new Date(2026, 0, 5))).toBe('05/01/2026');
  });
});

describe('formatTime', () => {
  it('usa el formato es-CO con p. m.', () => {
    expect(formatTime(new Date(2026, 9, 10, 13, 26))).toBe('1:26 p. m.');
    expect(formatTime(new Date(2026, 9, 10, 9, 5))).toBe('9:05 a. m.');
  });
});

describe('formatPercent', () => {
  it('formatea el INC y la propina', () => {
    expect(formatPercent(0.08)).toBe('8%');
    expect(formatPercent(0.1)).toBe('10%');
  });
});

describe('formatDuration', () => {
  it('formatea cronómetros de cocina', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(125)).toBe('2:05');
    expect(formatDuration(600)).toBe('10:00');
  });
});
