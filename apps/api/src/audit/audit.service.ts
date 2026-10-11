import { Injectable } from '@nestjs/common';
import { withTenant } from '../prisma.with-tenant';
import { PrismaService } from '../prisma.module';

export interface AuditEvent {
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  entityId?: string;
  reason?: string;
  data?: Record<string, string>;
}

/**
 * Auditoría obligatoria (AGENTS.md): anulaciones, descuentos, cambios de
 * precio, cierres de caja y cambios de permisos. También eventos de acceso.
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(event: AuditEvent): Promise<void> {
    await withTenant(this.prisma, event.tenantId, (tx) =>
      tx.auditLog.create({
        data: {
          tenantId: event.tenantId,
          userId: event.userId,
          action: event.action,
          resource: event.resource,
          entityId: event.entityId ?? null,
          reason: event.reason ?? null,
          data: event.data ?? undefined,
        },
      }),
    );
  }
}
