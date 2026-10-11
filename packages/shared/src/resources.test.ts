import { describe, expect, it } from 'vitest';
import {
  PERMISSION_ACTIONS,
  RESOURCE_IDS,
  ROLES,
  VISIBLE_RESOURCES,
  WRITE_RESOURCES,
  type ResourceId,
} from './resources';

describe('recursos y permisos', () => {
  it('hay exactamente 16 recursos, únicos', () => {
    expect(RESOURCE_IDS).toHaveLength(16);
    expect(new Set(RESOURCE_IDS).size).toBe(16);
  });

  it('5 acciones de permiso', () => {
    expect(PERMISSION_ACTIONS).toEqual(['VER', 'CREAR', 'EDITAR', 'ANULAR', 'APROBAR']);
  });

  it('los 5 roles tienen visibilidad definida y solo usan recursos existentes', () => {
    expect(ROLES).toHaveLength(5);
    for (const role of ROLES) {
      const visible = VISIBLE_RESOURCES[role];
      expect(visible.length).toBeGreaterThan(0);
      for (const resource of visible) {
        expect(RESOURCE_IDS).toContain(resource);
      }
    }
  });

  it('el administrador ve los 16 recursos', () => {
    expect([...VISIBLE_RESOURCES.administrador]).toEqual([...RESOURCE_IDS]);
  });

  it('las acciones de escritura solo referencian recursos existentes', () => {
    for (const actions of Object.values(WRITE_RESOURCES)) {
      for (const resources of Object.values(actions ?? {})) {
        for (const resource of resources as readonly ResourceId[]) {
          expect(RESOURCE_IDS).toContain(resource);
        }
      }
    }
  });
});
