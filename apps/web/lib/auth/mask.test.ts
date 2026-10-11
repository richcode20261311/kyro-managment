import { describe, expect, it } from 'vitest';
import { maskEmail } from './mask';

describe('maskEmail', () => {
  it('enmascara dejando las dos primeras letras', () => {
    expect(maskEmail('admin@aki.co')).toBe('ad•••@aki.co');
    expect(maskEmail('ra@correo.com')).toBe('ra•••@correo.com');
  });

  it('devuelve el valor tal cual si no es un correo', () => {
    expect(maskEmail('sin-arroba')).toBe('sin-arroba');
    expect(maskEmail('@aki.co')).toBe('@aki.co');
  });
});
