import type { $Enums } from '@prisma/client';

/** Contenido del access token (15 min). El tenant va dentro: RLS lo necesita. */
export interface AccessTokenPayload {
  sub: string;
  tenantId: string;
  role: $Enums.Role;
  name: string;
  sid: string;
}

/** Contenido del refresh token (30 d): apunta a una sesión revocable. */
export interface RefreshTokenPayload {
  sub: string;
  tenantId: string;
  sid: string;
}

/** Metadatos de la petición que se guardan en sesión y auditoría. */
export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}
