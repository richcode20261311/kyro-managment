import { SetMetadata } from '@nestjs/common';
import type { PermissionAction, ResourceId } from '@aki/shared';

export const REQUIRE_PERMISSIONS_KEY = 'requirePermissions';

export interface PermissionRequirement {
  resource: ResourceId;
  action: PermissionAction;
}

/** Exige el permiso `<resource>:<ACTION>` del rol del usuario (guard PermissionsGuard). */
export function RequirePermissions(resource: ResourceId, action: PermissionAction) {
  return SetMetadata(REQUIRE_PERMISSIONS_KEY, { resource, action } satisfies PermissionRequirement);
}
