import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RateLimitService } from '../common/rate-limit';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * Autenticación (A1 a A3): correo+contraseña, PIN de kiosco, refresh con
 * sesión revocable y recuperación por correo (EmailProvider intercambiable).
 */
@Module({
  imports: [JwtModule.register({ global: true })],
  controllers: [AuthController],
  providers: [AuthService, RateLimitService],
  exports: [AuthService],
})
export class AuthModule {}
