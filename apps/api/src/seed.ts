import { config } from 'dotenv';
import type { $Enums } from '@prisma/client';
// Script de consola: el resultado del seed se imprime en terminal.
/* eslint-disable no-console */
import {
  formatCOP,
  PERMISSION_ACTIONS,
  RESOURCE_IDS,
  ROLES,
  VISIBLE_RESOURCES,
  WRITE_RESOURCES,
} from '@aki/shared';
import { hashSecret } from './common/password.util';
import { createPrisma } from './prisma.client';

// Carga .env cuando el script corre fuera de la CLI de Prisma.
config();

/**
 * Seed de DESARROLLO (nunca se ejecuta en producción): tenant AKI, 2 sedes,
 * los 5 usuarios (uno por rol) con credenciales conocidas, matriz de permisos
 * y notificaciones de ejemplo. Idempotente: se puede re-ejecutar.
 */

const DEV_USERS = [
  {
    email: 'admin@aki.co',
    name: 'Andrea Ramírez',
    role: 'ADMINISTRADOR',
    password: 'process.env[SEED_ADMIN_PASSWORD] ?? 'Admin1234!'',
    pin: 'process.env[SEED_ADMIN_PIN] ?? '1111'',
    sedes: ['Sede Cajicá', 'Sede Chía'],
  },
  {
    email: 'cajero@aki.co',
    name: 'Camilo Torres',
    role: 'CAJERO',
    password: 'process.env[SEED_CAJERO_PASSWORD] ?? 'Cajero1234!'',
    pin: 'process.env[SEED_CAJERO_PIN] ?? '2222'',
    sedes: ['Sede Cajicá'],
  },
  {
    email: 'mesero@aki.co',
    name: 'Valentina Rojas',
    role: 'MESERO',
    password: 'process.env[SEED_MESERO_PASSWORD] ?? 'Mesero1234!'',
    pin: 'process.env[SEED_MESERO_PIN] ?? '3333'',
    sedes: ['Sede Cajicá'],
  },
  {
    email: 'cocinero@aki.co',
    name: 'Julián Ospina',
    role: 'COCINERO',
    password: 'process.env[SEED_COCINERO_PASSWORD] ?? 'Cocina1234!'',
    pin: 'process.env[SEED_COCINERO_PIN] ?? '4444'',
    sedes: ['Sede Cajicá'],
  },
  {
    email: 'domiciliario@aki.co',
    name: 'Stiven Martínez',
    role: 'DOMICILIARIO',
    password: 'process.env[SEED_DOMICILIARIO_PASSWORD] ?? 'Domi1234!'',
    pin: 'process.env[SEED_DOMICILIARIO_PIN] ?? '5555'',
    sedes: ['Sede Cajicá'],
  },
] as const;

const SEDES = [
  { name: 'Sede Cajicá', address: 'Cra. 15 #12-45, Cajicá, Cundinamarca' },
  { name: 'Sede Chía', address: 'Cl. 9 #11-20, Chía, Cundinamarca' },
] as const;

function permissionRows(
  tenantId: string,
): { tenantId: string; role: $Enums.Role; resource: string; action: $Enums.PermissionAction }[] {
  const rows: {
    tenantId: string;
    role: $Enums.Role;
    resource: string;
    action: $Enums.PermissionAction;
  }[] = [];
  for (const role of ROLES) {
    const dbRole = role.toUpperCase() as $Enums.Role;
    if (role === 'administrador') {
      for (const resource of RESOURCE_IDS) {
        for (const action of PERMISSION_ACTIONS) {
          rows.push({ tenantId, role: dbRole, resource, action });
        }
      }
      continue;
    }
    for (const resource of VISIBLE_RESOURCES[role]) {
      rows.push({ tenantId, role: dbRole, resource, action: 'VER' });
    }
    for (const [action, resources] of Object.entries(WRITE_RESOURCES[role] ?? {})) {
      for (const resource of resources ?? []) {
        rows.push({ tenantId, role: dbRole, resource, action: action as $Enums.PermissionAction });
      }
    }
  }
  return rows;
}

async function main(): Promise<void> {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) throw new Error('Falta DATABASE_URL en el entorno');
  const prisma = createPrisma(connectionString);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'aki' },
    update: { name: 'AKI Cocina Oriental' },
    create: { name: 'AKI Cocina Oriental', slug: 'aki' },
  });

  for (const sede of SEDES) {
    await prisma.sede.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: sede.name } },
      update: { address: sede.address, active: true },
      create: { tenantId: tenant.id, ...sede },
    });
  }

  for (const dev of DEV_USERS) {
    await prisma.user.upsert({
      where: { email: dev.email },
      update: { name: dev.name, role: dev.role, active: true },
      create: {
        tenantId: tenant.id,
        email: dev.email,
        name: dev.name,
        role: dev.role,
        passwordHash: await hashSecret(dev.password),
        pin: await hashSecret(dev.pin),
      },
    });
  }

  await prisma.permission.createMany({
    data: permissionRows(tenant.id),
    skipDuplicates: true,
  });

  const [users, sedes] = await Promise.all([
    prisma.user.findMany({ where: { tenantId: tenant.id }, select: { id: true, email: true } }),
    prisma.sede.findMany({ where: { tenantId: tenant.id }, select: { id: true, name: true } }),
  ]);
  const sedeIds = new Map(sedes.map((s) => [s.name, s.id]));
  await prisma.userSede.createMany({
    data: DEV_USERS.flatMap((dev) => {
      const user = users.find((u) => u.email === dev.email);
      if (!user) return [];
      return dev.sedes.map((name) => ({ userId: user.id, sedeId: sedeIds.get(name)! }));
    }),
    skipDuplicates: true,
  });

  const existing = await prisma.notification.count({ where: { tenantId: tenant.id } });
  if (existing === 0) {
    const admin = users.find((u) => u.email === 'admin@aki.co');
    await prisma.notification.createMany({
      data: [
        {
          tenantId: tenant.id,
          userId: admin?.id ?? null,
          kind: 'SUCCESS',
          title: 'Bienvenido a AKI Admin',
          body: 'Completa tu perfil y revisa aquí los avisos importantes del restaurante.',
        },
        {
          tenantId: tenant.id,
          kind: 'WARNING',
          title: 'Producto por agotarse',
          body: `Quedan 5 porciones de Arroz Jazmín en Sede Cajicá (${formatCOP(48000)} el costal).`,
        },
        {
          tenantId: tenant.id,
          kind: 'INFO',
          title: 'Resumen de ayer',
          body: 'Cerraste 42 pedidos por $1.284.000 en las dos sedes.',
        },
      ],
    });
  }

  await prisma.$disconnect();

  console.log('Seed completado: tenant "aki" con 2 sedes, 5 usuarios, permisos y notificaciones.');
  for (const dev of DEV_USERS) {
  }
}

void main().catch((error: unknown) => {
  console.error('Error en el seed:', error);
  process.exitCode = 1;
});
