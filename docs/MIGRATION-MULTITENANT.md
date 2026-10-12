# Migración multi-tenant (Fase 2) — plan, verificación y reversión

**Estado: PREPARADA, NO APLICADA.** Este documento y los archivos referidos están listos, pero
**no se ha ejecutado ningún `prisma migrate`, SQL, seed ni operación sobre ninguna base de datos**.
La aplicación de la migración requiere una autorización explícita posterior (ver §10).

Rama: `fase-2-acceso`. Migración: `apps/api/prisma/migrations/20261012000000_multi_tenant_onboarding/`.

---

## 1. Archivos de este cambio

| Archivo | Acción |
|---|---|
| `apps/api/prisma/schema.prisma` | Modificado: enums, campos de `Tenant`/`Sede`, unicidad `User` por tenant, 6 modelos nuevos |
| `apps/api/prisma/migrations/20261012000000_multi_tenant_onboarding/migration.sql` | Nuevo: SQL completo (Prisma + RLS + datos + funciones) |
| `apps/api/src/auth/auth.service.ts` | Modificado: login multi-tenant, `loginSelect`, recuperación multi-cuenta |
| `apps/api/src/auth/auth.controller.ts` | Modificado: `POST /auth/login/select` y tipo de respuesta de login |
| `apps/api/src/auth/jwt-auth.guard.ts` | Modificado: exige `sub`/`tenantId`/`sid`/`role` en el access token |
| `apps/api/src/seed.ts` | Modificado: AKI con `status=ACTIVO`, `plan=EMPRESARIAL`; upsert por `(tenantId, email)` |
| `packages/shared/src/schemas/auth.ts` | Modificado: `TenantOption`, `TenantSelectionChallenge`, `LoginResult`, `tenantSelectSchema`, `isTenantSelection` |
| `packages/shared/src/schemas/auth.test.ts` | Modificado: pruebas de los nuevos esquemas |
| `packages/shared/src/index.ts` | Modificado: exporta los tipos/esquemas nuevos |
| `packages/shared/src/catalog.ts` | Modificado: textos `t.auth.tenant` |
| `apps/web/lib/api/auth.ts` | Modificado: `login()` devuelve sesión o reto; nuevo `selectTenant()` |
| `apps/web/lib/auth/tenant-selection.ts` | Nuevo: reto en memoria de la pestaña (sin persistir) |
| `apps/web/components/auth/LoginForm.tsx` | Modificado: deriva a `/login/seleccionar` cuando el servidor lo pide |
| `apps/web/components/auth/LoginForm.test.tsx` | Modificado: pruebas del nuevo camino |
| `apps/web/components/auth/TenantSelection.tsx` | Nuevo: pantalla de selección de restaurante (solo si el servidor la exige) |
| `apps/web/components/auth/TenantSelection.test.tsx` | Nuevo: pruebas de la pantalla |
| `apps/web/app/login/seleccionar/page.tsx` | Nueva ruta pública (sin shell de AKI Admin) |
| `docs/PHASES.md` | Modificado: O1–O8 queda como fase funcional independiente |
| `docs/PROGRESS.md` | Modificado: estado y bloqueo de aprobación |

No se toca ninguna pantalla operativa existente: A1–A5, C1–C4 y el menú de 16 ítems conservan
nombre, logo, paleta, tipografía, textos y flujos.

## 2. Esquema (corregido y validado offline)

Se generó la parte Prisma de la migración con `prisma migrate diff --from-schema=<schema viejo>
--to-schema=<schema nuevo> --script`, comando **de solo lectura** que no abre la base. El archivo
`migration.sql` reproduce esa salida **sentencia por sentencia** (verificado con `diff`; solo
diferencian 3 líneas de comentario explicativo). Además: `prisma validate` y `prisma generate`
ejecutados con éxito.

Cambios:

- **Enums nuevos**: `TenantStatus`, `Plan`, `FiscalVerificationStatus`, `DocumentType`, `DocumentStatus`.
- **`Tenant` +columnas**: `legalName`, `businessType`, `taxIdType`, `taxId`, `taxIdDv`, `personType`
  (todas `TEXT` nulables → se dejan en `NULL`, no se inventa ningún dato fiscal/legal),
  `status` (`NOT NULL DEFAULT 'PENDIENTE_CORREO'`), `plan` (`NOT NULL DEFAULT 'TRIAL'`), `trialEndsAt` (`NULL`).
- **`Sede` +columnas**: `municipalityCode`, `departmentCode`, `neighborhood`, `phone`, `hours`
  (`JSONB` nulo), `services` (`TEXT[]` con default), `tablesCount`.
- **`User`**: se elimina `User_email_key` (email único **global**) y se crea
  `User_tenantId_email_key` (`(tenantId, email)`). El mismo correo puede existir en varios
  restaurantes; dentro de un tenant sigue siendo único.
- **6 tablas nuevas** (corrección de la discrepancia anunciada): `TenantBranding`,
  `TenantFiscalProfile`, `TenantDocument`, `InvoicingResolution`, `OnboardingProgress` y
  `ConsentRecord`. La cifra «9 tablas» del diseño inicial era un error de conteo que mezclaba
  tablas con enums: los otros objetos del diseño son los **5 enums** ya listados
  (`TenantStatus`, `Plan`, `FiscalVerificationStatus`, `DocumentType`, `DocumentStatus`) y
  **columnas nuevas en tablas existentes** (`Tenant` y `Sede`), no tablas adicionales. El SQL
  crea exactamente las 6 tablas del esquema corregido.
- Todos los modelos nuevos tienen clave foránea (`ON DELETE CASCADE`), índices
  (`TenantDocument(tenantId,type)`, `ConsentRecord(userId,document)`, única
  `InvoicingResolution(tenantId,number)`), defaults y nulabilidad definidos en `schema.prisma`;
  el SQL y el datamodel coinciden porque el SQL salió del propio datamodel.
- `INSERT`s: todos los campos obligatorios de las tablas nuevas son o bien la clave/tenantId, o
  tienen default; los campos sin dato real son nulables y se dejan pendientes (`NULL`).

**Un solo `INSERT`/`UPDATE` de datos** en la migración: el de §5. Ningún otro dato se crea.

## 3. Tratamiento de los datos existentes (AKI Cocina Oriental)

Se conserva todo: usuarios, sedes, permisos, sesiones, turnos, notificaciones y auditoría no se
tocan. Los únicos cambios de datos:

```sql
UPDATE "Tenant" SET "status" = 'ACTIVO'
  WHERE "slug" = 'aki' AND "status" = 'PENDIENTE_CORREO';
UPDATE "Tenant" SET "plan" = 'EMPRESARIAL'
  WHERE "slug" = 'aki' AND "plan" = 'TRIAL' AND "trialEndsAt" IS NULL;
```

Justificación:

- `status`: los campos no existían antes; la fila quedará con el default `PENDIENTE_CORREO` justo
  agregado por la migración. Las funciones de identidad solo autorizan `PRUEBA`/`ACTIVO`, así que
  sin este ajuste AKI quedaría **bloqueada para entrar**. AKI ya opera el sistema → `ACTIVO`.
- `plan`: mismo caso; AKI no es una cuenta en prueba → `EMPRESARIAL`. `trialEndsAt` queda `NULL`
  (no hay mecanismo de vigencia de prueba que vencer). Si la decisión comercial distinta, basta un
  `UPDATE "Tenant" SET "plan" = ... WHERE "slug" = 'aki'` (§13).
- Los guards solo actúan si el valor **sigue en default** (nadie lo definió): un estado o plan ya
  definido para AKI no se sobrescribe.
- **No se crea** ninguna fila de `TenantBranding`, `TenantFiscalProfile`, `TenantDocument`,
  `InvoicingResolution`, `OnboardingProgress` ni `ConsentRecord`: no hay NIT, dígito de
  verificación, razón social, responsabilidades tributarias, régimen ni representante legal
  verificables; `verificationStatus` queda en `SIN_DATOS` (nadie queda `VERIFICADO` sin evidencia)
  y `provider` queda `NULL` (ningún proveedor de facturación se marca operativo).
- Filas nuevas nacen cuando los formularios de esas pantallas guarden datos reales
  (fase de onboarding O1–O8 y fase fiscal).

## 4. Funciones SQL: consumidores y compatibilidad

Consumidor único de las tres: `apps/api/src/auth/auth.service.ts`.

| Función | Consumidor / flujo | Cambio | Compatibilidad |
|---|---|---|---|
| `resolve_login_identity(TEXT)` | `identitiesByEmail()` → login **A1** y recuperación **A3** | Firma igual; retorno **ensanchado** a `(userId, tenantId, tenantSlug, tenantName)` + filtro de estado del tenant. Postgres no permite `CREATE OR REPLACE` con otro retorno → `DROP FUNCTION IF EXISTS` + `CREATE` + re-`GRANT` en la misma migración | El único llamador hace `SELECT * ... FROM resolve_login_identity($1)` y lee por nombre de columna: las columnas extra no rompen lecturas viejas; el código nuevo usa las nuevas |
| `resolve_user_identity(TEXT)` | `identityById()` → login con **PIN A2** | `CREATE OR REPLACE`: misma firma y retorno; solo se añade `Tenant.status IN ('PRUEBA','ACTIVO')` | Idéntica firma/retorno → sin cambios en llamadores |
| `list_kiosk_employees(TEXT)` | `kioskEmployees()` → grilla **A2** | `CREATE OR REPLACE`: mismo caso (filtro de estado) | Idéntica firma/retorno |

`REVOKE ALL ... FROM PUBLIC` + `GRANT EXECUTE ... TO aki_app` (en bloque `DO` idempotente) se
reaplican para las tres, igual que en las migraciones `auth_sessions` y `auth_identity_by_id`.

Coherencia: A1, A2 y A3 respetan el estado del tenant (un tenant suspendido/cancelado no entra por
ninguna vía), y como la columna `status` y el `UPDATE` de AKI están en la **misma transacción** que
reescribe las funciones, no hay ventana en la que AKI quede bloqueada.

## 5. Selección de restaurante sin filtrar correos (A1)

Diseño (aprobado como condición 1):

1. `POST /auth/login {email, password}` sin `tenantId`. El servidor resuelve **todas** las
   identidades del correo y verifica la contraseña en cada candidato:
   - 0 coincidencias → `401 «Correo o contraseña incorrectos»` (mismo mensaje que hoy);
   - 1 coincidencia → sesión directa (**flujo actual de AKI: no cambia absolutamente nada**);
   - N coincidencias → respuesta `{requiresTenantSelection, tenants, selectionToken}` **sin cookie**.
2. **No existe** `GET /auth/tenants-by-email` ni ningún endpoint público que asocie correos con
   restaurantes. La lista solo sale después de que la contraseña cuadró en esos tenants, así que
   quien no tiene la contraseña recibe siempre el mismo 401 (ni siquiera sabe si el correo existe).
   Solo se listan los tenants donde la contraseña **sí** coincide, no todos los del correo.
3. `selectionToken`: JWT firmado con `JWT_ACCESS_SECRET`, `kind: 'tenant_select'`, 5 minutos,
   con `email` y los `tenants` verificados. Vive solo en memoria de la pestaña
   (`lib/auth/tenant-selection.ts`, sin `localStorage`/`sessionStorage`).
4. `POST /auth/login/select {selectionToken, tenantId}`: el servidor verifica firma y caducidad,
   que `kind` sea el correcto y **que `tenantId` esté dentro de los tenants firmados** (nunca se
   confía en el id del cliente), reconsulta que el usuario siga activo en ese tenant con
   `resolve_login_identity` y solo entonces crea la sesión y la cookie.
5. Endurecimiento relacionado: `JwtAuthGuard` y `verifyRefresh` ahora exigen los campos reales de
   un token de sesión (`sub`, `tenantId`, `sid`, `role`), de modo que un token de selección no
   sirve como access ni como refresh.
6. **A2 (PIN)**: sin cambios — `resolve_user_identity(userId)` con `userId` globalmente único.
   **A3 (recuperación)**: `requestRecovery` envía un código por cuenta (nombrando el restaurante
   cuando hay varias, al buzón que ya es dueño del correo); `verifyRecovery`/`resetRecovery`
   recorren las identidades y actúan **solo** sobre la cuenta cuyo código valide, dentro de su
   transacción con su `app.tenant_id`. Sin identidades: misma respuesta genérica de siempre.

## 6. Matriz de políticas RLS (tablas nuevas)

Mismo patrón que `migrations/20261011052339_rls`: `ENABLE` + `FORCE` + `NULLIF(current_setting('app.tenant_id', true), '')`
(sin contexto → no se ve **ninguna** fila). Permisos de tabla: el `ALTER DEFAULT PRIVILEGES` de
`docker/postgres-init/01-roles.sql` ya otorga `SELECT, INSERT, UPDATE, DELETE` a `aki_app` para
todo lo que cree el rol `aki` (dueño de las migraciones).

| Tabla | SELECT | INSERT | UPDATE | DELETE | Base de la política |
|---|---|---|---|---|---|
| `TenantBranding` | solo `tenantId = app.tenant_id` | idem (`WITH CHECK`) | idem | idem | columna propia `tenantId` |
| `TenantFiscalProfile` | idem | idem | idem | idem | columna propia `tenantId` |
| `TenantDocument` | idem | idem | idem | idem | columna propia `tenantId` |
| `InvoicingResolution` | idem | idem | idem | idem | columna propia `tenantId` |
| `OnboardingProgress` | idem | idem | idem | idem | columna propia `tenantId` |
| `ConsentRecord` | solo si su `userId` pertenece a `app.tenant_id` | idem (el `USING` rige el `WITH CHECK`: no se puede registrar un consentimiento de un usuario ajeno) | idem | idem | `EXISTS` sobre `"User"` (mismo patrón que `UserSede`/`RecoveryToken`) |

- Escrituras administrativas (p. ej. crear el perfil fiscal de un tenant) ocurren dentro de
  `withTenant(prisma, tenantId, ...)` con el `tenantId` de la sesión validada → la `WITH CHECK`
  solo admite filas del tenant activo.
- `app.tenant_id` se fija con `set_config(..., true)` (**local a la transacción**): al terminar
  cada `$transaction` (commit o rollback) PostgreSQL restaura el valor, por lo que una conexión
  devuelvida al pool **no arrastra** el contexto de otro tenant; y si una consulta corre sin
  `withTenant`, `NULLIF` da `NULL` y no matchea filas (seguro por defecto). Esto se demostrará con
  las pruebas negativas de §11 (no se da por seguro sin ejecutarlas).

## 7. Almacenamiento de documentos fiscales

- `TenantDocument.storageKey` es una **clave permanente** en almacenamiento privado; nunca se
  guarda una URL temporal como ubicación permanente. Las URLs firmadas de corta duración se
  generarán al autorizar el acceso (futura implementación).
- **No se agrega S3, MinIO ni ningún servicio externo.** No existe infraestructura de subida en el
  repo (hoy solo `docker-compose` con postgres y redis) y no se justifica aún un blob store:
  decisiones **pendientes y sin implementar**: límites de tamaño, permisos por rol, ciclo de vida y
  retención, cifrado en reposo y proveedor (disco local vs. objeto). Requieren aprobación antes de
  construir cualquier solución de blobs.

## 8. Facturación (preparación, sin integración)

Solo la tabla `InvoicingResolution` y `TenantFiscalProfile.provider` (nullable, `NULL`). **No se
instala, despliega ni invoca FacturaLatam, APIDIAN ni ningún otro proveedor; no hay facturas reales
ni simuladas.** El `InvoicingProvider` con adaptadores intercambiables sigue siendo trabajo de la
Fase 6.

## 9. Onboarding O1–O8: fase independiente

O1–O8 queda registrado en `docs/PHASES.md` como fase funcional propia (páginas públicas, sin shell
de AKI Admin). En esta migración **solo** se preparan sus modelos base (`Tenant.status/plan`,
`TenantBranding`, `TenantFiscalProfile`, `OnboardingProgress`, `ConsentRecord`, campos de
`Sede`). **No se implementan sus pantallas ni se alteran pantallas operativas existentes.**

---

## 10. Procedimiento de aplicación (§10.1–3 ejecutados en clon 2026-10-11; §10.4–8 requieren autorización — NO ejecutados)

Orden seguro (el código nuevo necesita las columnas nuevas; el código viejo tolera el esquema
nuevo):

1. **Respaldo** (obligatorio, en destino):
   `pg_dump -Fc -d aki_admin -f aki_admin_$(date +%Y%m%d_%H%M%S).dump`
2. **Comprobar el respaldo en una copia** (esto sí modifica solo la copia):
   `createdb aki_admin_restore_test` → `pg_restore -d aki_admin_restore_test aki_admin_….dump` →
   verificar conteos (`SELECT COUNT(*) FROM "User";` etc.). **Un dump sin prueba de restauración
   no es un respaldo.**
3. **Probar la migración en un clon** (nunca en la base real):
   `createdb aki_admin_clone` → `pg_restore -d aki_admin_clone aki_admin_….dump` →
   `DATABASE_URL=…aki_admin_clone pnpm --filter @aki/api exec prisma migrate deploy` →
   `… prisma db seed` → ejecutar las pruebas de §11 sobre el clon.
4. **Ventana de mantenimiento**: detener la API y el web.
5. **Aplicar en destino**: `pnpm --filter @aki/api exec prisma migrate deploy`
   (la migración corre en una transacción: o aplica completa o no aplica).
6. **Desplegar el código nuevo** (API + web) y arrancar.
7. **Verificación post-aplicación** (§12).
8. Si algo falla en 5 o 6 → §13 (reversión/recuperación).

## 11. Pruebas (clon de base de datos — ejecutadas el 2026-10-11; resultados en §16)

Todas corrieron sobre `aki_admin_clone`, nunca sobre la BD real. **Si hay que tocar una base de
datos real, se detiene y se ejecuta solo en el clon descrito en §10.3.**

| # | Prueba | Cómo | Criterio de aceptación |
|---|---|---|---|
| 1 | Migración limpia | §10.3 | `prisma migrate deploy` termina sin error; `prisma migrate status` reporta aplicada |
| 2 | A1 login AKI | `POST /auth/login` con `admin@aki.co`/`Admin1234!` | 200 con sesión + cookie; el cuerpo **no** trae `requiresTenantSelection` |
| 3 | A1 credencial mala | mismo con contraseña distinta | 401 con mensaje genérico |
| 4 | A2 PIN | `POST /auth/pin-login` con `admin@aki.co`… (user del seed, PIN 1111) | 200 con sesión |
| 5 | A3 recuperación | `POST /auth/recovery/request` → verificar código → `reset` | 202 → 200 → 200; login con la contraseña nueva |
| 6 | Correo compartido | en el clon: `INSERT` de un 2.º tenant + usuario con el **mismo email**; login con la contraseña válida en ambos | respuesta `requiresTenantSelection` con 2 tenants y token; `POST /auth/login/select` con un `tenantId` **fuera** del token → 401; con uno dentro → 200 y sesión de ese tenant |
| 7 | RLS negativa (tablas nuevas) | como `aki_app` sin contexto y cruzado (SQL abajo) | 0 filas en todos los casos |
| 8 | RLS negativa (tablas viejas) | idem sobre `"User"`, `"Session"`, `"Shift"` | 0 filas sin contexto; solo el propio tenant con `set_config` del tenant A |
| 9 | Aíslamiento de sesión | login en tenant A, intentar leer datos del tenant B con el token de A | el `JwtAuthGuard` exige `tenantId` del token y RLS no devuelve filas de B |
| 10 | Regresión operativa | e2e Playwright en 1280/1024/390 (login → sede → turno → panel) | verdes, sin desbordamiento |
| 11 | Semilla | `prisma db seed` sobre el clon | idempotente; AKI `ACTIVO`/`EMPRESARIAL`; sin filas fiscales inventadas |

Pruebas negativas de RLS (ejecutar en el clon, sesión `psql` como `aki_app`):

```sql
-- 7a. Sin contexto de tenant: nada visible (todas las tablas nuevas).
SELECT set_config('app.tenant_id', '', true);
SELECT COUNT(*) FROM "TenantBranding";      -- 0
SELECT COUNT(*) FROM "TenantFiscalProfile"; -- 0
SELECT COUNT(*) FROM "TenantDocument";      -- 0
SELECT COUNT(*) FROM "InvoicingResolution"; -- 0
SELECT COUNT(*) FROM "OnboardingProgress";  -- 0
SELECT COUNT(*) FROM "ConsentRecord";       -- 0
SELECT COUNT(*) FROM "User";                -- 0
SELECT COUNT(*) FROM "Session";             -- 0

-- 7b. Contexto del tenant A: solo filas de A; escribir hacia B falla.
SELECT set_config('app.tenant_id', '<tenant A>', true);
SELECT COUNT(*) FROM "TenantBranding" WHERE "tenantId" <> '<tenant A>';  -- 0
INSERT INTO "TenantBranding" ("tenantId") VALUES ('<tenant B>');         -- ERROR por WITH CHECK
-- ConsentRecord: registrar un consentimiento de un usuario de B → ERROR por USING/WITH CHECK
```

Pruebas unitarias **ya ejecutadas** en esta etapa (sin base de datos): ver §14.

## 12. Verificación post-aplicación (en destino)

```sql
-- Estructura
SELECT indexname FROM pg_indexes WHERE tablename = 'User';
--  ..._User_email_key no existe; User_tenantId_email_key sí
SELECT COUNT(*) FROM pg_proc WHERE proname = 'resolve_login_identity'; -- 1 (firma de 4 columnas)
SELECT relrowsecurity, relforcerowsecurity FROM pg_class
 WHERE relname IN ('TenantBranding','TenantFiscalProfile','TenantDocument',
                   'InvoicingResolution','OnboardingProgress','ConsentRecord');
-- 6 filas con t/t
-- Datos
SELECT "slug", "status", "plan", "trialEndsAt" FROM "Tenant";       -- aki: ACTIVO, EMPRESARIAL, NULL
SELECT COUNT(*) FROM "TenantFiscalProfile";                          -- 0 (sin datos inventados)
```

Más el smoke de A1/A2/A3 (§11.2–5).

## 13. Reversión y recuperación (límites honestos)

- **La transacción de la migración garantiza atomicidad de aplicación** (o queda todo o nada), pero
  **por sí sola no garantiza recuperación**: no sustituye al respaldo ni a la prueba de restauración.
- **Antes de habilitar el flujo nuevo**, si la migración no gusta: `prisma migrate resolve
  --rolled-back 20261012000000_multi_tenant_onboarding` + desplegar el código anterior. Válido solo
  si **nadie escribió** en las tablas/columnas nuevas.
- **Si el nuevo esquema ya tiene datos** (p. ej. tenants creados por onboarding): la única
  reversión completa es `pg_restore` del respaldo a la base previa; las filas escritas después del
  respaldo se pierden (no hay archivado WAL/PITR configurado → **limitación documentada**). Por eso
  el respaldo se toma justo antes de migrar y se prueba su restauración.
- Ajustes puntuales que **no** requieren reversión de migración:
  `UPDATE "Tenant" SET "plan" = … , "status" = … WHERE "slug" = 'aki';`
- El índice de correo vuelve con una migración de reversión que elimine
  `User_tenantId_email_key` y recree `User_email_key` (fallaría si ya existen correos repetidos
  entre tenants: verificar con la consulta de §0 del `migration.sql` antes).

## 14. Pruebas ejecutadas en esta etapa (resultado real, sin BD)

| Comando | Resultado |
|---|---|
| `pnpm typecheck` | ✅ 6/6 paquetes (incluye `tsc -p tsconfig.e2e.json`) |
| `pnpm lint` | ✅ 5/5 paquetes |
| `pnpm test` | ✅ 6 paquetes, **106 pruebas** en verde (api 32, web 24, shared 24, ui 23, config 3) |
| `prisma validate` / `prisma generate` | ✅ esquema válido, cliente regenerado |
| `prisma migrate diff` (solo lectura, sin BD) | ✅ la sección Prisma de `migration.sql` coincide sentencia a sentencia |

**En esta etapa no se ejecutó** ninguno de esos comandos sobre una BD. Posteriormente, con
autorización condicionada, `prisma migrate deploy`, `prisma db seed` y `pnpm e2e` **sí corrieron,
pero únicamente sobre el clon** `aki_admin_clone` (registro completo en §16); sobre la BD real
siguen sin ejecutarse.

## 15. Riesgos, decisiones comerciales y operaciones irreversibles

**Requieren decisión comercial (bloquean trabajo futuro, no esta migración):**

- Plan y precios reales por tenant; duración del trial y `trialEndsAt`.
- Aprobación manual de restaurantes (`status = PENDIENTE_APROBACION`): el estado existe, el
  interruptor **no** está implementado y AKI no queda sujeto a él.
- Proveedor de facturación operativo (`TenantFiscalProfile.provider`): queda `NULL` hasta contrato;
  «cotización Factus» sigue siendo un pendiente externo (WhatsApp), ajeno a FacturaLatam.
- Almacenamiento de documentos (§7): proveedor, límites, permisos y ciclo de vida.

**Riesgos técnicos pendientes:**

- Rate limiting de `POST /auth/login` y del selector: sin límite en Fase 2 (Fase 10), como ya
  estaba anotado. La verificación de contraseña por cada candidato añade ~1 scrypt por coincidencia
  (N pequeño acotado por tenants del correo). **Actualizado el 2026-10-11**: la revisión previa a
  producción detectó que el alcance completo es login + PIN + recuperación A3 (sin contador de
  intentos y con `Math.random`); las mitigaciones mínimas y su nuevo hito —**previo al registro
  público**— están en §18.1.
- El orden **migración → código** es obligatorio: el código nuevo lee columnas nuevas (`status`,
  `plan` en cada `Tenant` incluido en login/refresh); desplegarlo antes de migrar rompe A1.
- El `?sigue=` y el reto viven en memoria: recargar `/login/seleccionar` regresa a `/login`
  (comportamiento intencional, documentado en la pantalla).
- Flaky conocido previo: baseline visual `dev-sheet` (no relacionado).

**Operaciones irreversibles sin respaldo:** aplicar la migración en una base sin respaldo
probado; eliminar filas de las tablas nuevas; cambiar `status`/`plan` de AKI manualmente después
de migrar (reversible con `UPDATE`, pero fuera del control de este documento).

## 16. Registro de ejecución autorizada — respaldo, clon y pruebas (2026-10-11)

Autorización condicionada del usuario: respaldo + clon + migración **solo en clon** + pruebas de
§11 y e2e **solo contra el clon**. Prohibido en esta ronda: `migrate deploy`/seed sobre la BD real,
`migrate resolve`, operaciones destructivas, integraciones externas y cambios de UI. Todo lo de esta
sección corrió sobre `aki_admin_clone` (OID 21359); `aki_admin` (OID 16384) quedó intacto y así se
verificó al cierre.

### 16.1 Artefactos y bases

| Artefacto | Datos | Estado |
|---|---|---|
| `~/.aki-backups/aki_admin_20261011_173520_premultitenant_pg16.dump` | 2026-10-11 17:35:20 (-0500), 48 873 bytes, sha256 `9bd0eb5d909c…823e029`, 107 objetos | **Respaldo operativo válido**: `pg_dump -Fc` v16 dentro del contenedor `aki-postgres`; restaurado con `pg_restore --exit-on-error --no-owner` en `aki_admin_clone` y verificado (tablas, índices, restricciones, conteos y huellas md5 idénticos al origen). Procedimiento de restauración **probado en este servidor**. |
| `~/.aki-backups/aki_admin_20261011_173425_premultitenant.dump` | 2026-10-11 17:34:25 (-0500), 49 455 bytes, sha256 `ab86ce113172…a3b5aad`, 107 objetos | **Artefacto NO usable para recuperación en PG16**: `pg_dump` 18 del host emite `SET transaction_timeout` (parámetro PG17+) y el `pg_restore --exit-on-error` falló. Se conserva solo como evidencia; **no usar en un DR**. |

- Bases: origen `aki_admin` (OID 16384) y clon `aki_admin_clone` (OID 21359), ambas en `localhost:5432`
  (PostgreSQL 16.15); migraciones/seed corren como `aki` (owner), la API corre como `aki_app` (RLS).
- Restauración verificada: tablas, índices, restricciones y conteos idénticos al origen; huellas
  md5 de `Tenant`/`Sede`/`User`/`Session` idénticas. Diferencia de OID confirma BD separada.
- **Límite honesto**: la restauración probada es *full-restore en el mismo servidor*. No hay PITR
  (sin archivado WAL), no está probado el restore en servidor fresco, y el RTO no se ha medido
  (§18.4).

### 16.2 Resultados de las pruebas §11 (aprobadas: 11/11, fallidas: 0)

| # | Prueba | Resultado |
|---|---|---|
| 1 | Migración limpia en clon | ✅ `migrate deploy` aplicó `20261012000000_multi_tenant_onboarding`; `migrate status` = *up to date* (5) |
| 2 | A1 login AKI | ✅ 200 + cookie, sin `requiresTenantSelection`, rol ADMINISTRADOR, tenant `aki` |
| 3 | A1 credencial mala / correo inexistente | ✅ 401 con el mismo mensaje genérico en ambos |
| 4 | A2 PIN (1111) y PIN malo | ✅ 200 + cookie / 401; kiosco 200 con los 5 roles |
| 5 | A3 recuperación completa | ✅ 202 → verify 200 (código malo → 400) → reset 200 → login con la contraseña nueva (200) y la vieja (401); al final se restauró `Admin1234!` |
| 6 | Correo compartido (2 tenants) | ✅ reto con 2 tenants + token; `select` dentro del token → 200 (`aki` y `clon-pruebas`); tenant fuera del token → 401; coincidencia única → login directo sin reto |
| 7 | RLS negativa (6 tablas nuevas) | ✅ sin contexto → 0 filas en las 6; con contexto A → solo filas de A (1 cada una); INSERT/DELETE/UPDATE cruzado → `row-level security` o 0 filas; controles positivos OK; `ConsentRecord` aislado vía `User.tenantId` |
| 8 | RLS negativa (tablas viejas) | ✅ `User`/`Session`: 0 sin contexto; A no ve B (0); positivo OK |
| 9 | Tokens (propósito/expiración/manipulación) | ✅ 11/11: select manipulado / con access / con refresh / expirado → 401; refresh con selection token / manipulado / expirado / sesión revocada / payload sin `sid` → 401; **sesión pre-migración → 200 y rotada**; `GET /auth/tenants-by-email` → 404 (sin endpoint de enumeración) |
| 10 | e2e Playwright (1280/1024/390) | ✅ **53 pasaron, 16 omitidos, 0 fallaron** (A1/A2/A3, shell, visual, a11y, PWA); `dev-sheet` verde en esta corrida. Los 16 omitidos son **saltos por condición de proyecto/viewport** (p. ej. specs de escritorio en el proyecto móvil), **no fallos ni pruebas pendientes** |
| 11 | Semilla en clon (ejecutada 2 veces) | ✅ idempotente; hashes de credenciales/tenant/sedes intactos (no sobrescribe); AKI `ACTIVO`/`EMPRESARIAL`; 6 tablas nuevas en 0; sin filas fiscales ni de consentimiento inventadas |

Extras verificados: con correo compartido la recuperación emitió **2 correos, cada uno nombrando su
restaurante** con su propio código; el reset con un código cambió **solo esa cuenta** (hash de la
otra intacto). La API corre como `aki_app` (`APP_DATABASE_URL`) → toda la batería HTTP validó RLS
en runtime; migración/seed corren como `aki` (owner).

**Pruebas unitarias**: §14 registró 106 pruebas en su etapa; el conteo final verificado tras la
cobertura multi-tenant (`TenantSelection`/`LoginForm`) es **109/109** (api 32, web 27, shared 24,
ui 23, config 3). En esta revisión se re-ejecutaron `typecheck` ✅, `lint` ✅ y `test` ✅.

### 16.3 Conteos (solo números, sin datos personales)

| Tabla | Origen pre | Tras migración en clon | Tras pruebas en clon |
|---|---|---|---|
| Tenant | 1 | 1 | 2 (+1 fixture documentado) |
| Sede | 2 | 2 | 2 |
| User | 5 | 5 | 6 (+1 fixture) |
| UserSede / Permission / Shift / Notification | 6 / 98 / 0 / 3 | idénticos | idénticos |
| Session | 64 | 64 | 83 (sesiones de los tests/e2e) |
| AuditLog | 66 | 66 | 94 (auditoría de los tests/e2e) |
| RecoveryToken | 1 | 1 | 5 (códigos de A3) |
| 6 tablas nuevas | — | 0,0,0,0,0,0 | 0,0,0,0,0,0 (fixtures retirados) |

Origen al cierre: conteos y `User_email_key` sin cambios, migración **pendiente** (no se tocó).

### 16.4 Errores encontrados (del entorno y de los guiones de prueba; ninguno del producto)

1. `pg_dump` 18 del host vs servidor 16 → `SET transaction_timeout` no reconocido; resuelto con las
   herramientas v16 del contenedor.
2. `createdb`/`dropdb` no aceptan la URI de conexión como otros utilitarios → parámetros `PG*`.
3. Bugs de mis guiones de prueba (SQL concatenado mal, comilla desbalanceada, PID del logger de
   Nest confundido con un código de recuperación, `SET app.tenant_id` olvidado, `psql -At` con
   `read` sin `IFS`) → corregidos y re-ejecutados en verde.
4. Ningún fallo de RLS, funciones, tokens ni flujos de negocio.

### 16.5 Estado dejado

- `aki_admin`: intacta (verificación de cierre en16.3).
- `aki_admin_clone`: esquema migrado + seed; fixture documentado: 2.º tenant `clon-pruebas` con un
  usuario de correo compartido cuyo hash **no** coincide con `Admin1234!` (para que A1 siga siendo
  de coincidencia única en el e2e). El clon es desechable.
- API dev restaurada en :3001 sobre `aki_admin`; web en :3000 sin tocar; `.env` sin modificar.
- Respaldos en `~/.aki-backups/` (fuera del repositorio, no se commitean).

### 16.6 No ejecutado (pendiente de aprobación expresa)

`prisma migrate deploy` y `prisma db seed` sobre la BD real (§10.4–8), `migrate resolve`,
cualquier escritura en `aki_admin`, instalaciones/integraciones externas, cambios de pantallas o
identidad visual.

### 16.7 Comandos ejecutados en esta ronda (sanitizados — sin secretos)

```
# Respaldo (herramientas del contenedor, v16)
docker exec aki-postgres pg_dump -U aki -Fc -d aki_admin > ~/.aki-backups/<archivo>_pg16.dump
docker exec -i aki-postgres pg_restore --list < dump                    # 107 objetos
# (intento previo con pg_dump/pg_restore 18 del host → falló por SET transaction_timeout)
createdb aki_admin_clone                                               # parámetros PG*, no URI
docker exec -i aki-postgres pg_restore -U aki -d aki_admin_clone --exit-on-error --no-owner < dump
# Verificaciones (solo SELECT): conteos, índices, restricciones, md5 origen vs clon, OID
# Migración SOLO en clon (prisma apuntó a aki_admin_clone — lo reporta su propia salida)
cd apps/api && DATABASE_URL=…aki_admin_clone pnpm exec prisma migrate status   # 1 pendiente
cd apps/api && DATABASE_URL=…aki_admin_clone pnpm exec prisma migrate deploy   # aplicada
cd apps/api && DATABASE_URL=…aki_admin_clone pnpm exec prisma migrate status   # up to date
# Seed solo en clon (2 veces) + snapshots de conteos/hashes antes-después
# API de pruebas: DATABASE_URL=…clone APP_DATABASE_URL=…clone PORT=3001 pnpm dev
# Batería HTTP (~30 requests curl): login, pin-login, recovery, login/select, refresh
# Tokens (node + @nestjs/jwt leyendo .env sin imprimir): expirados/propósito incorrecto → 401
# RLS: psql -U aki_app (PGPASSWORD tomado en tiempo de ejecución del script de init) → §11.7-8
# Gates: pnpm e2e (API sobre clon) · pnpm test · pnpm typecheck · pnpm lint
# Restauración del entorno: fuser -k 3001/tcp + pnpm dev sin overrides → .env → aki_admin
# Revisión posterior (solo lectura): sha256sum de respaldos, pg_policies, git show HEAD:…
```

Comandos con lectura de la BD real: únicamente `SELECT`/`pg_dump` (no destructivos) y
`prisma migrate status` (solo lectura). Ninguna escritura en `aki_admin`.

## 17. Procedimiento de producción propuesto (revisión previa — NO ejecutado)

Orden irrestricto: **detener código viejo → respaldo final (+ prueba de restore) → migración →
verificar esquema → desplegar código nuevo → humo → observar**. El orden existe por dos
dependencias:

- **Código nuevo + esquema viejo = ROTO**: el cliente Prisma se genera del esquema nuevo y en cada
  login/refresh selecciona `Tenant.status`/`Tenant.plan` → error P2022 y A1 cae. El despliegue de
  código va **siempre después** de `migrate deploy` + verificación.
- **Código viejo + esquema nuevo = compatible analizado (no probado en vivo)**: el consumidor
  antiguo hace `SELECT * FROM resolve_login_identity(…)`, no lee `status`/`plan`, Prisma viejo solo
  pide columnas viejas y `RecoveryToken` no cambió. Aun así **no se deja correr el código viejo
  contra el esquema nuevo**: la secuencia lo detiene antes de migrar y no lo vuelve a arrancar salvo
  decisión explícita de aborto (fila 2 de §17.2).

### 17.1 Secuencia con ventana de mantenimiento (30–45 min estimados, RTO sin medir)

0. **Preparación (sin tocar producción)**: commits de `fase-2-acceso` + gates en verde; `pnpm
   build` (api `nest build` + web `next build`) → artefactos listos **sin arrancar**; confirmar el
   medio de despliegue real (cómo corren los procesos en el VPS — **no está documentado en el
   repo**), el `.env` de producción (`JWT_*`, `EMAIL_PROVIDER=brevo`, `APP_URL`) y la autorización
   de ventana por escrito.
1. **Congelar escrituras**: detener API y web (verificado: no hay cron ni colas, solo HTTP).
   PostgreSQL sigue corriendo. Confirmar `SELECT current_database()` en la URL de destino y las
   conexiones de aplicación en `pg_stat_activity` (lectura).
2. **Respaldo final**: `pg_dump -Fc` con las herramientas v16 del contenedor + `pg_restore --list`
   + **prueba de restauración en `aki_admin_restore_test`** + conteos. (§16.1 probó el procedimiento
   con el dump de las 17:35; el respaldo **final** es un archivo nuevo que requiere su propia
   prueba — «un dump sin prueba de restauración no es un respaldo».)
3. **Registro de conteos base** (SELECT sobre el origen) para el paso 5.
4. **Migración**: `DATABASE_URL=… prisma migrate deploy` (transaccional: o aplica completa o no
   aplica).
5. **Verificación de esquema §12 (lectura) = puerta de lanzamiento**: `prisma migrate status` en
   *up to date*; índice `User_tenantId_email_key` presente y `User_email_key` ausente;
   `resolve_login_identity` de 4 columnas con EXECUTE solo `aki`/`aki_app`; RLS `enabled+force` en
   las 6 tablas; AKI `ACTIVO`/`EMPRESARIAL` con `legalName`/`taxId` NULL; 6 tablas en 0 filas;
   conteos de tablas previas = paso 3.
6. **Desplegar código nuevo** (artefactos ya compilados): arrancar API → humo: `GET
   /api/auth/employees?tenant=aki` → 200; `POST /auth/login` (credencial de prueba) → 200;
   `POST /auth/refresh` con la cookie → 200; `GET /login/seleccionar` → 200 público; logs sin
   P2022 ni denegaciones RLS. Luego subir el web.
7. **Observación 15–30 min**: sin errores Prisma/RLS; si hay cookie vigente de un operador, su
   refresh (token previo a la migración) → 200.
8. **Cerrar ventana** y registrar el resultado en `PROGRESS.md`.

### 17.2 Criterios de aborto y recuperación

| Momento del fallo | Estado de la BD | Recuperación |
|---|---|---|
| Paso 4 (`migrate deploy` falla) | **Sin cambios** (transacción revertida) | El código viejo sigue sirviendo. Ojo: Prisma puede dejar la fila en `_prisma_migrations` marcada como fallida → diagnosticar y `migrate resolve --rolled-back` (**requiere autorización aparte**) antes de reintentar |
| Paso 5 falla (esquema inesperado) | Migrada | **No** lanzar código nuevo. Como la ventana congela escrituras, `pg_restore` del respaldo final pierde **≈0 filas**; después, volver a arrancar el código viejo |
| Paso 6 humo falla | Migrada | Subir el código viejo (compatible con el esquema nuevo, analizado) para restaurar servicio e investigar; o restore del respaldo si el esquema se juzga inválido |
| Paso 7 (observación) falla | Migrada + escrituras reales | Decisión explícita: parchar el código nuevo, o restore = **pierde las escrituras posteriores al respaldo** (no hay PITR) → requiere aprobación |

**Éxito**: §12 en verde + humo A1/A2/refresh en 200 + 15–30 min sin P2022/RLS + conteos base
intactos. **Parada inmediata**: cualquier error de `migrate deploy`; conteo base que no coincide;
índice o función ausente; A1 con 500/P2022 en humo; duda sobre la BD de destino.

## 18. Revisión de seguridad previa a ampliar acceso (2026-10-11, solo lectura)

### 18.1 Rate limiting ausente — mitigación exigible antes de registro público (O1–O8)

Verificado en el código: **no hay throttler ni contadores de intentos en la API**. Superficies:

| Superficie | Estado actual | Riesgo |
|---|---|---|
| `POST /auth/login` | Sin límite por IP/usuario; mensaje genérico único (✅ no enumera); coste scrypt por intento | Fuerza bruta/spray |
| `POST /auth/pin-login` | Sin límite en servidor; el bloqueo 30 s es **solo `localStorage` del cliente** | PIN de 4 dígitos brute-forceable por empleado |
| `POST /auth/recovery/request` | Sin límite; cada llamada genera código y **borra el anterior** | Invalidar códigos de una víctima + envíos masivos cuando `EMAIL_PROVIDER=brevo` |
| `POST /auth/recovery/verify` | El código **no se consume al fallar** y **no hay contador de intentos**: dentro de la ventana de 15 min se pueden probar los 10⁶ códigos a la velocidad que soporte el servidor | Robo de código de recuperación |
| Generación del código | `Math.random()` de 6 dígitos (no criptográfico) | Predictibilidad |
| `POST /auth/login/select` | Token de 5 min sin límite | Menor (requiere acertar la contraseña antes) |

**Mínimo requerido ANTES de habilitar el registro público o ampliar acceso a clientes**:

1. Throttler con store Redis por IP+ruta: login 5/15 min, pin 10/5 min (IP+usuario),
   recovery/request 3/60 min (IP+correo), recovery/verify+reset 6/15 min (correo), select 10/5 min.
2. Contador de intentos **en servidor** para códigos A3: ≥5 fallos → invalidar código + auditar.
3. Código con CSPRNG (`randomInt` de `node:crypto`).
4. Bloqueo progresivo de PIN en servidor (usuario+IP), no solo en `localStorage`.
5. Auditoría/alerta sobre ráfagas de fallos `auth.*`.

Estaba previsto para la Fase 10; **el hito cambia: es requisito previo al onboarding público**.

### 18.2 Comportamiento durante el cambio (confirmado en código y probado en el clon)

- **Sesiones**: filas intactas; revocación igual; `resetRecovery` cierra todas las sesiones (✅).
- **Refresh**: mismo secreto y forma `sub`/`tenantId`/`sid` — `sid` existía desde Fase 1
  (commit `0f84a7f`); TTL 30 d → cookies vigentes sobreviven (✅ probado en clon: sesión
  pre-migración → 200 y rotada).
- **Access tokens**: mismo secreto y forma → los ≤15 min vigentes siguen válidos.
- **A3**: `RecoveryToken` idéntico al HEAD (md5 igual) → códigos pendientes sobreviven; aislamiento
  por `EXISTS (User.tenantId = app.tenant_id)` confirmado en `pg_policies`; aislamiento por cuenta
  con correo compartido probado en el clon.
- **Selección de tenant**: solo con N coincidencias; token de 5 min; el guard exige
  `sub`/`tenantId`/`sid` → no sirve como sesión (✅ 4 combinaciones → 401).
- **RLS**: políticas existentes sin tocar; la migración solo añade las 6 nuevas con `FORCE`;
  runtime `aki_app` + `withTenant` sin cambios (✅ negativas en clon).
- **`SECURITY DEFINER`**: DROP+CREATE dentro de la ventana con la API detenida; EXECUTE solo
  `aki`/`aki_app` con `PUBLIC` revocado (✅ en clon); consumidor único `auth.service.ts` y el
  `SELECT *` del código viejo sigue compatible.

### 18.3 Respaldo y recuperación — límites honestos

- **Probado**: full-restore del dump operativo (§16.1) en **este mismo servidor**, con verificación
  de estructura y datos.
- **No probado / inexistente**: restore en servidor fresco; PITR (no hay archivado WAL → RPO = la
  última copia completa); RTO medido; la prueba de restore del **respaldo final** (se hace en el
  paso 2 de §17.1); restaurar configuración/secretos de aplicación (fuera del alcance del dump).
- El dump PG18 (§16.1) **no cuenta** como respaldo: no restaura en PG16.
- Conclusión: la recuperación **no está garantizada en todos sus componentes**; queda reducida a
  «full-restore en este servidor, probado una vez, con pérdida de lo escrito tras el dump».

### 18.4 Endurecimiento implementado y verificado (2026-10-12)

Las mitigaciones exigidas en §18.1 quedan **implementadas en código** (sin aplicar la migración
multi-tenant ni tocar la BD real) y **verificadas** con pruebas unitarias y una batería HTTP
contra el clon:

- **Limitación de intentos** (`apps/api/src/common/rate-limit.ts`): ventanas deslizantes tras la
  interfaz `RateLimitStore`, configurables por `RATE_LIMIT_<CLAVE>_{MAX,WINDOW,BLOCK}` (defaults
  documentados en `.env.example`). Claves por IP del socket (`req.ip` de Express; las cabeceras
  del cliente, p. ej. `X-Forwarded-For`, se ignoran salvo `trust proxy`) y por identidad cruda
  (correo o userId): una cuenta inexistente acumula los mismos intentos que una existente.
  Bloqueos **temporales** —nunca permanentes—; el acierto borra solo el contador de la cuenta.
  El429 lleva únicamente `Retry-After` (segundos), sin revelar clave, límite ni ventana.
- **Superficies cubiertas**: login (IP+cuenta), PIN (IP+usuario), `recovery/request` (IP+cuenta,
  con cooldown: un código vigente no se borra ni se reenvía), verify+reset (presupuesto de
  fallos compartido IP+cuenta), `login/select` (IP).
- **A3 endurecido**: código con CSPRNG (`randomInt` de `node:crypto`), vinculado a identidad y
  finalidad (se hashea `recovery:<userId>:<código>` con scrypt), TTL 15 min, consumo atómico
  (`updateMany` condicionado a `usedAt: null`: dos resets concurrentes con el mismo código cambian
  la contraseña exactamente una vez) y presupuesto de intentos; los fallos **no** modifican
  cuentas ni tokens ajenos; las respuestas públicas del flujo son genéricas e idénticas.
- **Filtro429**: `RateLimitExceptionFilter` lleva ahora `@Catch(RateLimitException)`. Sin ese
  decorador, Nest enruta **todas** las excepciones por el filtro global y reescribe cada400/401
  como429 con `Retry-After: undefined` (evidencia pre-fix de la batería:33 respuestas falsas vs8
  reales). Regresión automatizada: `apps/api/src/common/rate-limit-filter.test.ts` (rojo→verde
  demostrado) con `apps/api/vitest.config.mts` (`oxc.decorator.legacy`).
- **Verificación (2026-10-12)**: batería HTTP de **36 comprobaciones** contra `aki_admin_clone`
  (instancia propia en :3002 con evidencia de BD efectiva en cada arranque) → **36/36 en dos
  corridas consecutivas** desde estados sucios (determinista entre ejecuciones). Cubre: A1 (login
  correcto; límite por cuenta real →429 con `Retry-After` numérico; expiración del bloqueo →200;
 401 idénticos sin `Retry-After` para existente e inexistente; cuenta fantasma limitada igual;
  `X-Forwarded-For` forjado **no** elude la IP del socket), A2 (userId inexistente →401 genérico;
  bloqueo por PIN fallido con el correcto incluido; PIN correcto tras expirar →200), A3 (cooldown
  sin reenvío; código ajeno/vencido/consumido no verifica ni resetea; presupuesto agotado →429 y
  bloqueo temporal que no invalida el código vigente; ciclo completo reset→200, vieja→401,
  nueva→200, reuso→400; concurrencia con exactamente un ganador; límites por IP y por cuenta con
  respuestas públicas idénticas y un solo correo por cooldown), multi-tenant (reto de2 con el
  correo compartido sin accessToken ni cookie; select dentro del listado →200, fuera o alterado
  →401 sin sesión; el token de selección no autentica; límite de select →429; coincidencia única
  → login directo), refresh (primer refresh rota; el token viejo →401 de revocación **sin**
  `Retry-After`), higiene (cero códigos de recuperación en los logs, cero
  `retry-after=undefined`, buzón de desarrollo en modo600) e integridad (`aki_admin` sin
  escrituras: `RecoveryToken` 1→1, OID16384 y4 migraciones intactas; `:3001` sin tocar).
- **Batería versionada (2026-10-12)**: el harness quedó en `apps/api/test/security/`
  (`battery.sh`, `launch-clone-api.js`, `clone.env.example`, `README.md` con requisitos,
  variables, aislamiento y pasos; atajo `pnpm run test:security`). Su preflight añade tres
  puertas que **abortan antes de la primera petición HTTP** si la configuración efectiva no
  demuestra el clon: fichero sin duplicados + URL exactas + `PORT=3002`; sonda TCP con las
  credenciales propias de cada URL exigiendo `current_database()=aki_admin_clone` con su `oid`
  en el servidor (el nombre en el fichero no basta); `oid` de clon y BD real distintos con el
  fixture intacto. Corrida con el script del repo → **37/37** (una línea de comprobación más
  por la sonda TCP); el entorno real y los artefactos siguen fuera del repo. Limitaciones
  documentadas en el README del directorio.
- **Pruebas unitarias**: `pnpm test` → **137 en verde** (api60, web27, ui23, shared24, config3;
  incluidas 10 del limitador y4 del filtro); `pnpm typecheck` y `pnpm lint` en verde.
- **Límites honestos de la verificación**: la batería corrió sobre el clon con límites de pruebas
  del entorno (p. ej. `LOGIN_IP_MAX=4`, `RECOVERY_ACCT_MAX=3`, bloqueos de10 s) para observable
  en minutos; **el código es el de producción** y sus defaults quedan en `.env.example`. El
  almacén de contadores es **en memoria**: se reinicia con el proceso y no se comparte entre
  instancias; el store Redis es el camino de escala antes de ampliar acceso (§ OPERATIONS).

---

### Comandos que requieren autorización posterior

> Ejecutados ya **solo sobre el clon** (§16): respaldo/clon (`pg_dump`/`createdb`/`pg_restore`),
> `prisma migrate deploy`, `prisma db seed`, `pnpm e2e`. Los siguientes siguen pendientes para la
> **BD real**:

```
pg_dump … / createdb … / pg_restore …          # respaldo y clon (§10.1–3)
pnpm --filter @aki/api exec prisma migrate deploy   # §10.5
pnpm --filter @aki/api exec prisma db seed          # §11.11
pnpm e2e                                            # §11.10 (levanta API sobre BD)
prisma migrate resolve --rolled-back 20261012000000_multi_tenant_onboarding   # §13
```
