-- Aislamiento multi-tenant (AGENTS.md): Row Level Security en PostgreSQL.
-- El rol de aplicación `aki_app` (no superusuario) solo ve datos del tenant en
-- app.tenant_id; si la variable no está definida, no ve NINGUNA fila (seguro
-- por defecto). `aki` (owner superuser) sigue pudiendo migrar y sembrar.
-- El runtime fija la variable con set_config(..., true) dentro de cada
-- transacción (ver apps/api/src/prisma.with-tenant.ts).

-- Tenant: solo su propia fila.
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tenant" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_self ON "Tenant"
  USING ("id" = NULLIF(current_setting('app.tenant_id', true), ''))
  WITH CHECK ("id" = NULLIF(current_setting('app.tenant_id', true), ''));

-- Tablas con tenantId propio.
ALTER TABLE "Sede" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sede" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "Sede"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''))
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''));

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "User"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''))
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''));

ALTER TABLE "Permission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Permission" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "Permission"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''))
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''));

ALTER TABLE "Shift" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Shift" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "Shift"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''))
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''));

ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "Notification"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''))
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''));

ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "AuditLog"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''))
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''));

-- Tablas sin tenantId: aíslan a través de su usuario dueño.
ALTER TABLE "UserSede" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserSede" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "UserSede"
  USING (EXISTS (
    SELECT 1 FROM "User" u
    WHERE u."id" = "UserSede"."userId"
      AND u."tenantId" = NULLIF(current_setting('app.tenant_id', true), '')
  ));

ALTER TABLE "RecoveryToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecoveryToken" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "RecoveryToken"
  USING (EXISTS (
    SELECT 1 FROM "User" u
    WHERE u."id" = "RecoveryToken"."userId"
      AND u."tenantId" = NULLIF(current_setting('app.tenant_id', true), '')
  ));
