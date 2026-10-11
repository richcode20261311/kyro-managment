import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma.module';

/**
 * Carcasa de la API — se llena por vertical a partir de la Fase 2
 * (autenticación, roles, sedes, turnos y caja).
 */
@Module({
  imports: [PrismaModule],
})
export class AppModule {}
