import type { CanActivate} from '@nestjs/common';
import { ForbiddenException, Injectable, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { withTenant } from '../prisma.with-tenant';
import { PrismaService } from '../prisma.module';
import { REQUIRE_PERMISSIONS_KEY, type PermissionRequirement } from './require-permissions.decorator';
import type { AccessTokenPayload } from './token.types';

interface AuthedRequest extends Request {
  user?: AccessTokenPayload;
}

/**
 * Verifica que el rol del usuario tenga el permiso exigido por
 * `@RequirePermissions` contra la tabla Permission (aislada por RLS).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.getAllAndOverride<PermissionRequirement | undefined>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requirement) return true;

    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const user = request.user;
    if (!user) throw new ForbiddenException('Falta autenticación');

    const allowed = await withTenant(this.prisma, user.tenantId, (tx) =>
      tx.permission.count({
        where: {
          tenantId: user.tenantId,
          role: user.role,
          resource: requirement.resource,
          action: requirement.action,
        },
      }),
    );
    if (allowed === 0) {
      throw new ForbiddenException(
        `Tu rol no tiene permiso para ${requirement.resource}:${requirement.action}`,
      );
    }
    return true;
  }
}
