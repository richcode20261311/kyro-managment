import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Cadena del rol de aplicación `aki_app` (no superusuario): Row Level Security
 * aplica. Si no está definida se cae a DATABASE_URL (solo aceptable cuando esa
 * conexión también es de un rol no privilegiado).
 */
export function appConnectionString(): string {
  const connectionString = process.env['APP_DATABASE_URL'] ?? process.env['DATABASE_URL'];
  if (!connectionString) {
    throw new Error('Falta APP_DATABASE_URL (rol de aplicación con RLS) en el entorno');
  }
  return connectionString;
}

export function createAdapter(connectionString: string = appConnectionString()): PrismaPg {
  return new PrismaPg({ connectionString });
}

/** Cliente para scripts (seed, migraciones) que necesitan otra conexión. */
export function createPrisma(connectionString: string): PrismaClient {
  return new PrismaClient({ adapter: createAdapter(connectionString) });
}
