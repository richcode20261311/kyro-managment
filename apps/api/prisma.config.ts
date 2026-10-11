import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Configuración de la CLI de Prisma 7 (migraciones y seed).
// El cliente en runtime recibe el adapter en src/prisma.service.ts.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx src/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
