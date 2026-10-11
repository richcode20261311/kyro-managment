import { Module } from '@nestjs/common';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { PrismaModule } from './prisma.module';

/**
 * API de AKI Admin. Fase 2: autenticación, roles, sedes, turnos y caja.
 */
@Module({
  imports: [PrismaModule, AuditModule, EmailModule, AuthModule],
})
export class AppModule {}
