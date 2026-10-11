import { describe, expect, it } from 'vitest';
import { VERSION } from './index';

describe('@aki/shared', () => {
  it('expone su versión', () => {
    expect(VERSION).toBe('0.0.0');
  });
});
