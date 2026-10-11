import type { Prisma, PrismaClient } from '@prisma/client';

/**
 * Ejecuta `fn` dentro de una transacción con `app.tenant_id` fijado, que es
 * lo que las políticas de RLS usan para aislar datos. Si la variable no se
 * fija, el rol de aplicación no ve ninguna fila (seguro por defecto).
 *
 * Todas las consultas con datos de tenant deben pasar por aquí.
 */
export async function withTenant<T>(
  db: Pick<PrismaClient, '$transaction'>,
  tenantId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
    return fn(tx);
  });
}
