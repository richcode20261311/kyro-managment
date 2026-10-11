/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_tenantId_email_key";

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_tenantId_userId_revokedAt_idx" ON "Session"("tenantId", "userId", "revokedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS de Session (mismo patrón que el resto de tablas con tenantId).
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "Session"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''))
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''));

-- Funciones de identificación para el LOGIN, que corre sin contexto de tenant
-- (A1 solo pide correo + contraseña). SECURITY DEFINER bypass-ean RLS a
-- propósito y exponen lo mínimo: resolver correo -> (usuario, tenant) y listar
-- nombres/roles de empleados con PIN para el teclado kiosco (A2).
-- El EXECUTE está restringido: solo el rol de aplicación (ver bloque final).
CREATE FUNCTION resolve_login_identity(p_email TEXT)
RETURNS TABLE ("userId" TEXT, "tenantId" TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u."id", u."tenantId"
  FROM "User" u
  WHERE u."email" = p_email AND u."active" = true
$$;

CREATE FUNCTION list_kiosk_employees(p_slug TEXT)
RETURNS TABLE (id TEXT, name TEXT, "role" "Role")
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u."id", u."name", u."role"
  FROM "User" u
  JOIN "Tenant" t ON t."id" = u."tenantId"
  WHERE t."slug" = p_slug AND u."active" = true AND u."pin" IS NOT NULL
  ORDER BY u."name"
$$;

REVOKE ALL ON FUNCTION resolve_login_identity(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION list_kiosk_employees(TEXT) FROM PUBLIC;

-- En entornos con otro nombre de rol de aplicación, otorgar EXECUTE a mano.
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'aki_app') THEN
    GRANT EXECUTE ON FUNCTION resolve_login_identity(TEXT) TO aki_app;
    GRANT EXECUTE ON FUNCTION list_kiosk_employees(TEXT) TO aki_app;
  END IF;
END
$$;
