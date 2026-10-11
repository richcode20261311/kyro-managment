import { beforeEach, describe, expect, it } from 'vitest';
import { keepSessionEnabled, setKeepSession } from './keep-session';

beforeEach(() => {
  localStorage.clear();
});

describe('mantener sesión iniciada', () => {
  it('por defecto restaura la sesión', () => {
    expect(keepSessionEnabled()).toBe(true);
  });

  it('respeta la preferencia guardada', () => {
    setKeepSession(false);
    expect(keepSessionEnabled()).toBe(false);

    setKeepSession(true);
    expect(keepSessionEnabled()).toBe(true);
  });
});
