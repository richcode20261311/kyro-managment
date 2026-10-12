-- Fase 2 multi-tenant + modelos base de onboarding (O1–O8).
-- Plan completo de aplicación, verificación, reversión y recuperación:
--   docs/MIGRATION-MULTITENANT.md  (NO aplicar hasta que ese documento lo autorice).
--
-- Orden de este archivo (una sola transacción; Prisma envuelve la migración):
--   0. Guarda de duplicados de correo (antes de tocar índices).
--   1. Sentencias generadas por Prisma (enums, columnas, tablas, índices, FK).
--   2. RLS de las 6 tablas nuevas.
--   3. Datos existentes: solo AKI, sin inventar información fiscal/legal.
--   4. Funciones SQL de identidad (login A1, PIN A2, recuperación A3).
--
-- La sección 1 salió de `prisma migrate diff --from-schema=<old> --to-schema=<new>
-- --script` (comando de solo lectura) y coincide con schema.prisma.

-- ── 0. Guarda previa: unicidad de correo ────────────────────────────────────
-- La migración 20261011055743 dejó `User_email_key` (email global único), lo
-- que implica que (tenantId, email) también es único: el cambio de unicidad no
-- puede fallar por duplicados. Esta guarda protege contra una base cuyo
-- histórico no coincida (p. ej. si el índice global se eliminó a mano): si
-- hubiera duplicados, la migración falla aquí, antes de alterar índices.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "User"
    GROUP BY "tenantId", "email"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Existen correos duplicados en (tenantId, email); resolverlos antes de migrar';
  END IF;
END
$$;

-- ── 1. Sentencias Prisma (datamodel) ────────────────────────────────────────

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('PENDIENTE_CORREO', 'PENDIENTE_APROBACION', 'PRUEBA', 'ACTIVO', 'SUSPENDIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('TRIAL', 'BASICO', 'PROFESIONAL', 'EMPRESARIAL');

-- CreateEnum
CREATE TYPE "FiscalVerificationStatus" AS ENUM ('SIN_DATOS', 'EN_REVISION', 'VERIFICADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RUT', 'OTRO');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('SUBIDO', 'EN_REVISION', 'APROBADO', 'RECHAZADO');

-- DropIndex
-- Se elimina la unicidad GLOBAL de email y, en la misma transacción, se crea la
-- compuesta (tenantId, email). El orden es seguro: el índice global garantizaba
-- la unicidad compuesta hasta este punto.
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "personType" TEXT,
ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "status" "TenantStatus" NOT NULL DEFAULT 'PENDIENTE_CORREO',
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "taxIdDv" TEXT,
ADD COLUMN     "taxIdType" TEXT,
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Sede" ADD COLUMN     "departmentCode" TEXT,
ADD COLUMN     "hours" JSONB,
ADD COLUMN     "municipalityCode" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "services" TEXT[] DEFAULT ARRAY['SALON', 'PARA_LLEVAR', 'DOMICILIOS']::TEXT[],
ADD COLUMN     "tablesCount" INTEGER;

-- CreateTable
CREATE TABLE "TenantBranding" (
    "tenantId" TEXT NOT NULL,
    "logoKey" TEXT,
    "accentColor" TEXT,
    "website" TEXT,
    "socialMedia" JSONB,
    "hasTrademark" BOOLEAN NOT NULL DEFAULT false,
    "trademarkName" TEXT,
    "trademarkNumber" TEXT,

    CONSTRAINT "TenantBranding_pkey" PRIMARY KEY ("tenantId")
);

-- CreateTable
CREATE TABLE "TenantFiscalProfile" (
    "tenantId" TEXT NOT NULL,
    "personType" TEXT,
    "taxRegime" TEXT,
    "taxResponsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ciiuCode" TEXT,
    "incEnabled" BOOLEAN NOT NULL DEFAULT true,
    "incRate" DECIMAL(5,2) NOT NULL DEFAULT 8,
    "fiscalAddress" TEXT,
    "fiscalEmail" TEXT,
    "legalRepName" TEXT,
    "legalRepDocType" TEXT,
    "legalRepDocNumber" TEXT,
    "mercantileRegistry" TEXT,
    "verificationStatus" "FiscalVerificationStatus" NOT NULL DEFAULT 'SIN_DATOS',
    "verificationNote" TEXT,
    "provider" TEXT,

    CONSTRAINT "TenantFiscalProfile_pkey" PRIMARY KEY ("tenantId")
);

-- CreateTable
CREATE TABLE "TenantDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'SUBIDO',
    "reviewerId" TEXT,
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "TenantDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoicingResolution" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "prefix" TEXT NOT NULL,
    "rangeStart" INTEGER NOT NULL,
    "rangeEnd" INTEGER NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "environment" TEXT NOT NULL,
    "provider" TEXT NOT NULL,

    CONSTRAINT "InvoicingResolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingProgress" (
    "tenantId" TEXT NOT NULL,
    "completedSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "percentage" INTEGER NOT NULL DEFAULT 0,
    "pendingFields" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingProgress_pkey" PRIMARY KEY ("tenantId")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TenantDocument_tenantId_type_idx" ON "TenantDocument"("tenantId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "InvoicingResolution_tenantId_number_key" ON "InvoicingResolution"("tenantId", "number");

-- CreateIndex
CREATE INDEX "ConsentRecord_userId_document_idx" ON "ConsentRecord"("userId", "document");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- AddForeignKey
ALTER TABLE "TenantBranding" ADD CONSTRAINT "TenantBranding_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantFiscalProfile" ADD CONSTRAINT "TenantFiscalProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantDocument" ADD CONSTRAINT "TenantDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoicingResolution" ADD CONSTRAINT "InvoicingResolution_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingProgress" ADD CONSTRAINT "OnboardingProgress_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── 2. RLS de las tablas nuevas (mismo patrón que 20261011052339_rls) ────────
-- Rol de aplicación `aki_app` (no superuser): sin app.tenant_id definido no ve
-- NINGUNA fila (NULLIF → NULL → comparación nunca cierta). Seguro por defecto.
-- Permisos de tabla: ALTER DEFAULT PRIVILEGES en docker/postgres-init/01-roles.sql
-- ya otorga SELECT/INSERT/UPDATE/DELETE a aki_app para tablas creadas por `aki`.

-- Tablas con tenantId propio: lectura, inserción, actualización y borrado solo
-- del tenant activo (WITH CHECK impide escribir filas de otro tenant).
ALTER TABLE "TenantBranding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantBranding" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "TenantBranding"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''))
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''));

ALTER TABLE "TenantFiscalProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantFiscalProfile" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "TenantFiscalProfile"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''))
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''));

ALTER TABLE "TenantDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantDocument" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "TenantDocument"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''))
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''));

ALTER TABLE "InvoicingResolution" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoicingResolution" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "InvoicingResolution"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''))
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''));

ALTER TABLE "OnboardingProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OnboardingProgress" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "OnboardingProgress"
  USING ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''))
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.tenant_id', true), ''));

-- ConsentRecord no tiene tenantId: se aísla a través de su usuario dueño
-- (mismo patrón que UserSede y RecoveryToken). Sin WITH CHECK explícito, el
-- USING también rige INSERT/UPDATE, lo que impide registrar consentimientos
-- de usuarios de otro tenant.
ALTER TABLE "ConsentRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConsentRecord" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "ConsentRecord"
  USING (EXISTS (
    SELECT 1 FROM "User" u
    WHERE u."id" = "ConsentRecord"."userId"
      AND u."tenantId" = NULLIF(current_setting('app.tenant_id', true), '')
  ));

-- ── 3. Datos existentes: solo AKI, sin inventar nada ────────────────────────
-- NO se crean filas de TenantBranding, TenantFiscalProfile, TenantDocument,
-- InvoicingResolution, OnboardingProgress ni ConsentRecord: no hay datos
-- reales verificados que insertar (sin NIT, razón social, responsabilidades
-- tributarias ni representante legal inventados), y sus relaciones son
-- opcionales: nacen vacías hasta que los formularios de esas pantallas
-- rellenen campos reales. verificationStatus queda en su default SIN_DATOS
-- (nadie es VERIFICADO sin evidencia) y provider queda NULL (ningún
-- proveedor de facturación se marca operativo).
--
-- Se ajustan únicamente `status` y `plan` de AKI, que hasta ahora eran los
-- defaults recién añadidos (los campos no existían antes de esta migración,
-- es decir, no estaban definidos por nadie):
--   * status = ACTIVO: es obligatorio para que A1/A2 sigan entrando, porque
--     las funciones de identidad solo autorizan tenants en PRUEBA/ACTIVO.
--     AKI Cocina Oriental ya opera el sistema; quedaría bloqueada si la fila
--     conservara el default PENDIENTE_CORREO.
--   * plan = EMPRESARIAL: AKI es el restaurante para el que se construyó el
--     sistema, no una cuenta en prueba. trialEndsAt queda NULL porque no hay
--     ningún mecanismo de vigencia de prueba que vencer. Si la decisión
--     comercial dice otra cosa, un único UPDATE por `slug = 'aki'` lo cambia
--     (ver docs/MIGRATION-MULTITENANT.md · Reversión).
-- Los guards solo tocan valores que siguen en default: un estado o plan ya
-- definido para AKI se conserva sin sobrescribir.
UPDATE "Tenant" SET "status" = 'ACTIVO'
  WHERE "slug" = 'aki' AND "status" = 'PENDIENTE_CORREO';
UPDATE "Tenant" SET "plan" = 'EMPRESARIAL'
  WHERE "slug" = 'aki' AND "plan" = 'TRIAL' AND "trialEndsAt" IS NULL;

-- ── 4. Funciones de identidad (SECURITY DEFINER) ────────────────────────────
-- Consumidor único de las tres: apps/api/src/auth/auth.service.ts.
--   * resolve_login_identity  → identityByEmail(): login A1 y recuperación A3.
--     Cambia el RETORNO (añade tenantSlug/tenantName para el selector de
--     restaurante y exige tenants en PRUEBA/ACTIVO). Postgres no permite
--     CREATE OR REPLACE con otro tipo de retorno, por eso DROP + CREATE.
--     La firma (p_email TEXT) no cambia y el único llamador hace
--     `SELECT * FROM resolve_login_identity($1)`, así que es compatible.
--   * resolve_user_identity   → identityById(): login con PIN A2. Misma
--     firma y mismo retorno; solo se añade el filtro de estado del tenant.
--   * list_kiosk_employees    → kioskEmployees(): grilla del kiosco A2. Mismo
--     caso: misma firma/retorno, filtro de estado del tenant.
-- Sin contexto de tenant, el login no puede leer estas tablas vía RLS: por eso
-- las funciones corren con SECURITY DEFINER (dueño `aki`, que sí bypass-ea RLS)
-- y el EXECUTE queda solo para `aki_app`.

DROP FUNCTION IF EXISTS resolve_login_identity(TEXT);

CREATE FUNCTION resolve_login_identity(p_email TEXT)
RETURNS TABLE ("userId" TEXT, "tenantId" TEXT, "tenantSlug" TEXT, "tenantName" TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u."id", u."tenantId", t."slug", t."name"
  FROM "User" u
  JOIN "Tenant" t ON t."id" = u."tenantId"
  WHERE u."email" = p_email
    AND u."active" = true
    AND t."status" IN ('PRUEBA', 'ACTIVO')
$$;

CREATE OR REPLACE FUNCTION resolve_user_identity(p_user_id TEXT)
RETURNS TABLE ("userId" TEXT, "tenantId" TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u."id", u."tenantId"
  FROM "User" u
  JOIN "Tenant" t ON t."id" = u."tenantId"
  WHERE u."id" = p_user_id
    AND u."active" = true
    AND t."status" IN ('PRUEBA', 'ACTIVO')
$$;

CREATE OR REPLACE FUNCTION list_kiosk_employees(p_slug TEXT)
RETURNS TABLE (id TEXT, name TEXT, "role" "Role")
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u."id", u."name", u."role"
  FROM "User" u
  JOIN "Tenant" t ON t."id" = u."tenantId"
  WHERE t."slug" = p_slug
    AND u."active" = true
    AND u."pin" IS NOT NULL
    AND t."status" IN ('PRUEBA', 'ACTIVO')
  ORDER BY u."name"
$$;

REVOKE ALL ON FUNCTION resolve_login_identity(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION resolve_user_identity(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION list_kiosk_employees(TEXT) FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'aki_app') THEN
    GRANT EXECUTE ON FUNCTION resolve_login_identity(TEXT) TO aki_app;
    GRANT EXECUTE ON FUNCTION resolve_user_identity(TEXT) TO aki_app;
    GRANT EXECUTE ON FUNCTION list_kiosk_employees(TEXT) TO aki_app;
  END IF;
END
$$;
