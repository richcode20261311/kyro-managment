import type { CanActivate} from '@nestjs/common';
import { Injectable, UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AccessTokenPayload } from './token.types';

interface AuthedRequest extends Request {
  user?: AccessTokenPayload;
}

/** Valida el access token Bearer y deja el payload en `req.user`. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el token de acceso');
    }
    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(header.slice(7), {
        secret: process.env['JWT_ACCESS_SECRET'],
      });
      // Exige los campos de una sesión real: descarta tokens firmados con
      // otra finalidad (p. ej. el reto de selección de restaurante).
      if (!payload.sub || !payload.tenantId || !payload.sid || !payload.role) {
        throw new Error('payload de acceso incompleto');
      }
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Sesión expirada, inicia de nuevo');
    }
    return true;
  }
}
