# Progreso de AKI Admin

Actualiza este archivo al iniciar y al cerrar cada tarea. Es la memoria entre sesiones: cualquier sesión nueva debe leerlo antes de empezar.

**Última actualización:** 2026-10-12
**Fase actual:** 2 en curso — tareas 1–5 completadas (base de datos + RLS, API auth, infra sesión, A1/A3 login, A2/A4/A5 PIN/sede/turno); migración multi-tenant preparada sin ejecutar (espera aprobación, ver `docs/MIGRATION-MULTITENANT.md`)
**Rama:** fase-2-acceso

## Estado por fase

- [x] **Fase 0a:** reconocimiento inicial (22 pantallas nombradas)
- [x] **Fase 0b:** reconocimiento completo (116 "Generating Screen..." clasificadas, 138 totales)
- [x] **Fase 1:** cimientos (F1, F2, F3) — ver `docs/PLAN-FASE-1.md`
- [ ] **Fase 2:** acceso y centro de control (A1 a A5, C1 a C4) — en curso, plan aprobado en `docs/PLAN-FASE-2.md`
- [ ] **Fase 3:** salón y pedidos (P1 a P10)
- [ ] **Fase 4:** cocina (K1 a K5)
- [ ] **Fase 5:** domicilios (P11 a P14)
- [ ] **Fase 6:** caja y facturación DIAN (B1 a B8, D1 a D5)
- [ ] **Fase 7:** menú, inventario y compras (M1 a M6, I1 a I9)
- [ ] **Fase 8:** clientes, WhatsApp y reservas (W1 a W8, V1 a V5)
- [ ] **Fase 9:** personal, reportes, configuración y móviles (E1 a E6, R1 a R5, S1 a S8, X1, X2)
- [ ] **Fase 10:** transversal (PWA sin conexión, pagos, seguridad, despliegue)

## Pantallas (Cobertura Stitch → SCREEN-MAP.md)

| Código | Pantalla | Estado Stitch | Notas |
|---|---|---|---|
| A1 | Login Email/Pass (3 breakpoints) | ✅ Encontrada | 3 versiones en Stitch |
| A2 | Login PIN | ✅ Encontrada | 2 versiones (mover dup a _archivo/) |
| A3 | Recuperar contraseña (4 pasos) | ✅ Encontrada | 4 pasos + expirado |
| A4 | Selecciona tu Sede | ✅ Encontrada | |
| A5 | Apertura turno y caja | ✅ Encontrada | |
| B1 | Cuenta de la mesa | ✅ Encontrada | |
| B2 | Dividir cuenta | ✅ Encontrada | |
| B3 | Cobro | ✅ Encontrada | |
| B4 | Datos facturación | ✅ Encontrada | |
| B5 | Cobro exitoso | ✅ Encontrada | |
| B6 | Movimientos caja | ✅ Encontrada | |
| B7 | Arqueo/cierre turno | ✅ Encontrada (nueva) | `5e8d6c95...` + `5edf7d59...` (dos versiones) |
| B8 | Reporte cierre | ✅ Encontrada | Tabs demo Stitch |
| C1 | Panel principal (real) | ✅ Encontrada | 4 versiones en Stitch |
| C2 | Notificaciones | ✅ Encontrada | Panel + vista completa |
| C3 | Búsqueda | ✅ Encontrada | Panel Ctrl+K + resultados |
| C4 | Mi perfil | ✅ Encontrada | |
| D1 | Documentos electrónicos | ✅ Encontrada | 2 versiones |
| D2 | Detalle documento | ✅ Encontrada | 2 versiones |
| D3 | Nota crédito | ✅ Encontrada | 2 versiones |
| D4 | Numeración y resolución | ✅ Encontrada | 2 versiones |
| D5 | Conexión proveedor | ✅ Encontrada | 2 versiones |
| E1 | Lista empleados | ✅ Encontrada | 3 versiones |
| E2 | Perfil empleado | ✅ Encontrada | |
| E3 | Planificador turnos | ✅ Encontrada | |
| E4 | Asistencia y marcaciones | ✅ Encontrada | |
| E5 | Roles y permisos | ✅ Encontrada | |
| E6 | Desempeño y propinas | ✅ Encontrada | |
| F1 | Hoja de Componentes v2 | ✅ Encontrada | Referencia canónica |
| F2 | Plantillas base (4) | ✅ Encontrada | Panel, Mesas, Tablet, Móvil |
| I1 | Inventario general | ✅ Encontrada | 2 versiones |
| I2 | Detalle ingrediente | ✅ Encontrada | |
| I3 | Movimientos inventario | ✅ Encontrada | |
| I4 | Conteo físico | ✅ Encontrada | |
| I5 | Consumo teórico vs real | ✅ Encontrada | |
| I6 | Proveedores | ✅ Encontrada | |
| I7 | Órdenes de compra | ✅ Encontrada | |
| I8 | Recepción mercancía | ✅ Encontrada | |
| I9 | Cuentas por pagar | ✅ Encontrada | |
| K1 | KDS todas estaciones | ✅ Encontrada | 6 versiones |
| K2 | KDS por estación | ✅ Encontrada | 3 variantes (Sushi, Caliente, Bebidas) |
| K3 | Despacho | ✅ Encontrada | |
| K4 | Panel Agotados 480px | ✅ Encontrada | |
| K5 | Historial despachadas | ✅ Encontrada | 2 versiones |
| M1 | Lista productos | ✅ Encontrada | 2 versiones |
| M2 | Crear/editar producto | ✅ Encontrada | |
| M3 | Categorías | ✅ Encontrada | |
| M4 | Grupos modificadores | ✅ Encontrada | |
| M5 | Combos y promociones | ✅ Encontrada | |
| M6 | Recetas y costos | ✅ Encontrada (nueva) | `650e33c7...`; editor + catálogo completos |
| P1 | Mapa mesas | ✅ Encontrada | 4 versiones |
| P2 | Editor plano | ✅ Encontrada | |
| P3 | Modal abrir mesa | ✅ Encontrada | |
| P4 | Toma pedido POS | ✅ Encontrada | 3 versiones |
| P5 | Modificadores modal | ✅ Encontrada | |
| P6 | Revisión/envío cocina | ✅ Encontrada | |
| P7 | Panel gestionar mesa | ✅ Encontrada | |
| P8 | Lista pedidos | ✅ Encontrada | 3 versiones |
| P9 | Detalle pedido | ✅ Encontrada | 2 versiones |
| P10 | Pedido para llevar | ✅ Encontrada | |
| P11 | Nuevo domicilio | ✅ Encontrada | |
| P12 | Tablero domicilios | ✅ Encontrada | 3 versiones |
| P13 | Detalle domicilio | ✅ Encontrada | |
| P14 | Domiciliario PWA | ✅ Encontrada | 5 pantallas móviles |
| S1 | Info restaurante | ✅ Encontrada | 2 versiones |
| S2 | Impuestos y propinas | ✅ Encontrada | |
| S3 | Impresoras y comandas | ✅ Encontrada | |
| S4 | Métodos pago y pasarela | ✅ Encontrada | |
| S5 | Integraciones (DIAN + WhatsApp) | ✅ Encontrada (nueva) | `b4edaa14...`; limpiar simulador y textos técnicos |
| S6 | Usuarios y acceso | ✅ Encontrada | |
| S7 | Copias de seguridad | ✅ Encontrada | |
| S8 | Preferencias | ✅ Encontrada | |
| V1 | Calendario reservas | ✅ Encontrada | 3 versiones |
| V2 | Nueva reserva (modal) | ✅ Encontrada (nueva) | `dc3cb8b5...`; modal 740 px sobre V1 |
| V3 | Detalle reserva | ✅ Encontrada | |
| V4 | Lista espera | ✅ Encontrada | |
| V5 | Página pública reservar | ✅ Encontrada | |
| W1 | Bandeja WhatsApp | ✅ Encontrada | |
| W2 | Conversación + pedido | ✅ Encontrada | |
| W3 | Constructor bot | ✅ Encontrada | |
| W5 | Directorio 360° | ✅ Encontrada | |
| W6 | Campañas fidelización | ✅ Encontrada | |
| W7 | Indicadores WhatsApp | ✅ Encontrada | |
| W8 | Config WhatsApp Business | ✅ Encontrada | |
| X1 | Dueño móvil | 📱 Responsive | Viewport móvil de C1 con shell móvil F2; `ab8c0b4f...` aporta datos de ejemplo |
| X2 | Mesero PWA | 📱 Responsive | Viewport móvil de P1/P4 con shell móvil F2 |
| R1 | Reporte de ventas | ⚠️ Sin referencia | Diseñar en Fase 9; referencia C1 |
| R2 | Productos y rentabilidad | ⚠️ Sin referencia | Diseñar en Fase 9; referencia M6 |
| R3 | Caja y propinas | ⚠️ Sin referencia | Diseñar en Fase 9; referencia B8 |
| R4 | Inventario y mermas | ⚠️ Sin referencia | Diseñar en Fase 9; referencia I5 |
| R5 | Programar y exportar | ⚠️ Sin referencia | Diseñar en Fase 9; referencia S7 |

**Resumen: 88/93 códigos SCREEN-MAP cubiertos (95%) · X1/X2 cubiertos por responsive · 0 faltantes en A–S tras la última generación (M6, S5, V2, B7, A3-paso-3 ya existen) · Faltantes reales: R1 a R5 (sin referencia visual)**
**Tabla canónica definitiva: `docs/STITCH-INVENTORY.md`**

## Decisiones tomadas

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-10-10 | Stack: Next.js, NestJS, PostgreSQL, Redis, Socket.IO | Definido en `AGENTS.md` |
| 2026-10-10 | Marco escritorio 1280px / Tablet 1024px / Móvil 390px | Contrato §5; frames Stitch "1440" y "Tablet 1280" son borradores previos |
| 2026-10-10 | Domiciliario y mesero como PWA del mismo sistema | Un solo diseño y una sola base de código |
| 2026-10-10 | lucide-react como único set de iconos | Reemplazar Material Symbols en todas las pantallas Stitch |
| 2026-10-10 | Tokens Tailwind en packages/config (aki-bg, aki-red, etc.) | Contrato §2; no migrar HTML Stitch, reconstruir con componentes |
| 2026-10-10 | formatCOP, formatDate/es-CO, formatTime/es-CO en packages/shared | Contrato §9; eliminar "COP" escrito y fechas fijas |
| 2026-10-10 | AppShell único sin shell en: Acceso, Cocina/KDS, /reservar | Contrato §6, §10 |
| 2026-10-10 | A2-login-pin-dup movido a design/stitch/_archivo/ | No borrar, conservar historial |
| 2026-10-10 | Orden de fases según docs/PHASES.md | Pantallas sin referencia visual van al final de su fase |
| 2026-10-10 | Tabla canónica en `docs/STITCH-INVENTORY.md`; versión oficial se elige por cumplimiento del contrato, no por antigüedad | Múltiples duplicados en Stitch |
| 2026-10-11 | Serwist vía `@serwist/turbopack` (no `@serwist/next`) | Mismo stack; el paquete `next` no soporta Turbopack. Riesgo: integración experimental |
| 2026-10-11 | Ajustes de contraste AA: `aki-muted #5C6470`, texto activo en `aki-error`, `aki-success-ink #1F5E3C` | AGENTS.md exige AA; los valores originales daban 4.1–4.4:1 |
| 2026-10-11 | `design/` y scripts de descarga fuera de git y de todos los builds | `.gitignore` + `tsconfig.base.json`; `.dockerignore` en Fase 10 |
| 2026-10-11 | Prisma fijado en **7.10.0** (estable): `prisma@latest` apunta al RC de v8 con CLI nueva de contratos | Evitar RC; en v7 la URL vive en `prisma.config.ts` y el cliente usa driver adapter `@prisma/adapter-pg` |
| 2026-10-11 | Rol de PostgreSQL `aki_app` (no superusuario) para runtime; `aki` (superuser) para migraciones/seed | RLS no aplica a superusers; políticas con `FORCE` y variable `app.tenant_id` fijada por transacción (`withTenant`) — sin variable no se ve ninguna fila |
| 2026-10-11 | Seed de desarrollo: tenant AKI, 2 sedes, 5 usuarios (uno por rol) con credenciales conocidas, matriz de permisos y notificaciones | Probable el flujo login → sede → turno; solo corre en local |
| 2026-10-11 | Recursos (16 ids) y acciones de permiso en `@aki/shared` con test de paridad contra el menú de `@aki/ui` | Fuente única para guard de permisos y seed |
| 2026-10-11 | Captura visual del panel congela el reloj (`page.clock`) además de enmascarar la fecha | La máscara no cubría el cambio de ancho diario del texto de fecha |
| 2026-10-11 | Aviso operativo: no ejecutar builds/servidores como root | Una sesión root creó `apps/api/dist` y `apps/web/.next` con dueño root; se corrigió con un contenedor Docker con `chown 1000:1000` |
| 2026-10-11 | Correo de usuario único GLOBAL (no por tenant); login resuelve el tenant con funciones SQL `SECURITY DEFINER` (`resolve_login_identity`, `resolve_user_identity`, `list_kiosk_employees`, EXECUTE solo para `aki_app`) | A1 solo pide correo + contraseña y corre sin contexto de tenant; RLS bloquearía la consulta. A2 (kiosco) lista empleados por slug: expone solo nombre, rol e id |
| 2026-10-11 | Refresh token en cookie httpOnly con sesión revocable (modelo `Session`); se rota en cada refresh y logout la revoca | Permite cerrar sesión real y expirar por tiempo; access token de 15 min solo con Bearer |
| 2026-10-11 | Recuperación A3: código de 6 dígitos, vigencia 15 min, hasheado con scrypt y de un solo uso; respuesta idempotente aunque el correo no exista | Sin fugas de información; `EMAIL_PROVIDER=log` en desarrollo y `brevo` (SMTP) en producción, interfaz intercambiable |
| 2026-10-11 | `@aki/shared` se compila a `dist/` (CommonJS) y `turbo dev` depende de `^build` | El API NestJS (CJS) no puede ejecutar el TypeScript fuente del paquete; Next y Vitest consumen `dist` sin cambios |
| 2026-10-11 | `consistent-type-imports` desactivado en `apps/api` | NestJS inyecta por constructor con `emitDecoratorMetadata`: las clases inyectadas deben importarse como valores o la DI falla en runtime |
| 2026-10-11 | Cliente HTTP de la web: un solo refresh en vuelo (dedupe), reintento único ante 401 y evento `aki:sesion-expirada` que dispara la salida al login; `middleware.ts` protege rutas por presencia de la cookie `aki_refresh` y guarda el destino en `?sigue=` | La validez la confirma la API al cargar datos; las specs e2e siembran la cookie con `e2e/helpers.ts` |
| 2026-10-11 | La cookie de refresh se emite con `Path=/` (no `/api/auth`) | El proxy de Next debe verla en las peticiones de página (`/sede`, `/panel`…) para decidir si hay sesión; con path restringido el login quedaba en bucle `/login?sigue=%2Fsede` |
| 2026-10-11 | `apps/web/middleware.ts` migrado a `proxy.ts` (función `proxy`) | Next 16 deprecó la convención `middleware`; misma lógica y matcher |
| 2026-10-11 | A3 usa el flujo por **código de 6 dígitos** (paso 2 incluye campo de código), no enlaces | Así lo define la API de la tarea 2 y el propio diseño de Stitch ("código de un solo uso válido por 15 minutos"); el estado "caducado" se muestra al vencer los 15 min en cliente |
| 2026-10-11 | "Mantener sesión iniciada" (A1) controla la restauración silenciosa al abrir la app (localStorage `aki:mantener-sesion`) | La cookie httpOnly vive 30 días; endurecer el recuerdo en la Fase 10 de seguridad |
| 2026-10-11 | Chip "Admin" con `text-aki-error` en lugar de `aki-red` | Sobre tinte rojo al 10% el rojo puro da 3.6:1 (axe lo marcó serious en /login móvil); aki-error mantiene el rojo y cumple AA |
| 2026-10-11 | El login entra al flujo por `/sede` (A4, tarea 5); `?sigue=` tiene prioridad | Orden del plan: `login → sede → apertura de turno → panel` |
| 2026-10-11 | Playwright levanta también la API (`webServer` con dos entradas); se añadieron `e2e/acceso.spec.ts` (flujos A1/A3 contra API real) y /login, /recuperar a la batería axe | La recuperación e2e usa un correo inexistente: la API responde idempotente (202) sin enviar correo |

## Fase 1 — Cimientos (plan en `docs/PLAN-FASE-1.md`, rama `fase-1-cimientos`)

| Tarea | Estado |
|---|---|
| 1. Scaffold Turborepo + tooling (tsconfig, eslint, vitest, playwright) | ✅ |
| 2. Tokens Tailwind + tipografía (Poppins/Inter locales) | ✅ |
| 3. `packages/shared` (formateadores, ids, catálogo) | ✅ |
| 4. `AppShell` F2 (16 ítems, 1280/1024/390, roles) | ✅ |
| 5. Primitivos `packages/ui` | ✅ |
| 6. Estados globales F3 | ✅ |
| 7. Hoja de componentes F1 | ✅ |
| 8. Pruebas (axe + visual + regresión) | ✅ |
| 9. Serwist + Dexie | ✅ |

## Fase 2 — Acceso y centro de control (plan en `docs/PLAN-FASE-2.md`, rama `fase-2-acceso`)

| Tarea | Estado |
|---|---|
| 1. Docker Compose + Prisma + schema multi-tenant + RLS + seed | ✅ |
| 2. API auth (correo, PIN, refresh, recuperación) + guards + auditoría | ✅ |
| 3. Infra frontend: TanStack Query, cliente HTTP con token, Zustand sesión, middleware de rutas | ✅ |
| 4. A1 + A3 (login y recuperar) | ✅ |
| 5. A2 + A4 + A5 (PIN, sede, turno) | ✅ |
| 6. API sedes, turnos/caja, notificaciones, búsqueda global | ⏳ |
| 7. C1 + C2 + C3 + C4 | ⏳ |
| 8. Pruebas: flujo completo 3 viewports, axe, visual | ⏳ |
| 9. Cierre y PROGRESS | ⏳ |
| M. Migración multi-tenant + onboarding base (archivos, código y **prueba completa en clon**; BD real sin tocar) | ⏸️ Espera aprobación para aplicar en BD real — `docs/MIGRATION-MULTITENANT.md` §16 |

## Bloqueos y preguntas abiertas

- **Migración multi-tenant**: preparada y **validada completa en clon** el 2026-10-11 (respaldo probado → `aki_admin_clone` → `migrate deploy` → seed → pruebas §11 11/11 → e2e 53/0 fallos, registro en `docs/MIGRATION-MULTITENANT.md` §16). **NO aplicada a la BD real**: sobre `aki_admin` no corrió ningún `migrate`, SQL ni seed (verificado al cierre: conteos y `User_email_key` intactos). Falta autorización explícita para §10.4–8 (ventana de mantenimiento, deploy en destino, verificación §12)
- **Rate limiting del login**: sin límite de intentos en Fase 2; guardarlo en la tarea de seguridad de la Fase 10
- **R1–R5 (Reportes)**: Sin referencia visual en Stitch — diseñar desde cero al final de la Fase 9 (referencias: C1, M6, B8, I5, S7)
- **Logo AKI**: Necesario archivo real en `apps/web/public/brand/aki-logo.png` (fondo transparente)
- **Cotización Factus**: Proveedor DIAN por WhatsApp pendiente

## Diferencias aceptadas respecto a Stitch (Contrato manda sobre Stitch)

| # | Corrección | Pantallas Afectadas |
|---|---|---|
| 1 | `//` solo en breadcrumb (eliminar de chips, títulos, columnas) | P1, P4, P7, K1, K3, K4, B8, C1, V1, M1, D1, E1, I1, W1, W2, W3, W5, W6, W7, W8, S1... |
| 2 | Material Symbols → lucide-react | Todas las pantallas Stitch |
| 3 | Outfit → Poppins (títulos) / Inter (cuerpo) | Todas las pantallas Stitch |
| 4 | Fechas fijas → Intl es-CO (hoy real) | Todas las pantallas Stitch |
| 5 | Eliminar "COP" junto a cifras ($48.000 sin "COP") | P4, P7, P8, P9, B8, K3, K4, W2, etc. |
| 6 | Eliminar botones demo Stitch ("Simular...", tabs estados) | A1, A2, A3, K1, B8, P7, etc. |
| 7 | Eliminar headers/barras genéricas Stitch | A1-A5, P1, P4, P7, B8, C1, V1, D1, E1, M1, I1, W1... |
| 8 | Eliminar textos técnicos ("PWA", "Terminal", "Modo Offline") | K1, K3, K4, B8, P7, etc. |
| 9 | Colores Stitch → tokens AKI (aki-bg, aki-red, aki-orange, etc.) | Todas |
| 10 | Alturas fijas tarjetas → auto / min-height | P1, K1, K3, K4, B8, etc. |
| 11 | Marco KDS fijo 1280×800, overflow:hidden, fondo #111111 | K1, K2, K3, K4, K5 |

## Pendientes externos

- [ ] Logo con fondo transparente en `apps/web/public/brand/aki-logo.png`.
- [ ] Cotización de Factus (proveedor DIAN) por WhatsApp.
- [ ] Confirmar con OVH si el precio del VPS está en USD o COP.
- [ ] Definir pedidos por día del restaurante para afinar costos.
- [ ] Verificar el nombre de marca final ante la SIC.

## Log de tareas completadas (Fase 2)

### Tarea 5 — A2 + A4 + A5 (2026-10-11)
- **A2 `/login/pin`**: Selección de empleado (grid responsive) + teclado PIN accesible (4 indicadores, borrar, confirmar, estados error/bloqueo/éxito, persistencia de bloqueo 30s en localStorage)
- **A4 `/sede`**: Grid de sedes asignadas con estado (abierta/cerrada/ocupada), selección con Chip, redirección a `/turno/apertura`
- **A5 `/turno/apertura`**: Wizard 3 pasos con stepper visual
  - Paso 1: Resumen caja/responsable/sede/fecha
  - Paso 2: Conteo billetes/monedas con controles +/- 48px, autocompletar base sugerida, totales en tiempo real
  - Paso 3: Confirmación con resumen detallado, nota opcional, botón "Confirmar y abrir caja", validación de descuadre
  - Sidebar derecho fijo con resumen, diferencia visual (verde/dorado/rojo), botones de navegación
  - Mobile: bottom bar con total y acción principal
  - Modal de éxito con resumen y navegación a `/panel`
- **Catálogo i18n**: Añadidas claves `auth.pin`, `auth.sede`, `auth.turno` en `packages/shared/src/catalog.ts`
- **Componentes nuevos**: `PinKeypad`, `PinLoginFlow`, `SedeSelection`, `CashCount`, `ConfirmacionApertura`, `AperturaTurno`
- **Tests**: Unit tests pasan (vitest), E2E pasan en 3 viewports (desktop-1280, tablet-1024, mobile-390)
- **Typecheck**: Pasa sin errores

### Migración multi-tenant + A1 selección de restaurante (2026-10-11) — archivos preparados, SIN ejecutar

- **Alcance ejecutado**: solo inspección, diseño y archivos de código. **No** corrió `prisma migrate deploy/dev`, SQL, seed ni ninguna operación sobre bases de datos; tampoco `pnpm e2e` (su webServer levanta la API contra la BD real).
- **Esquema**: `schema.prisma` con 5 enums, campos opcionales en `Tenant`/`Sede`, `User` con `@@unique([tenantId, email])` (cae el único global) y 6 tablas nuevas (`TenantBranding`, `TenantFiscalProfile`, `TenantDocument`, `InvoicingResolution`, `OnboardingProgress`, `ConsentRecord`). Se corrigió el conteo erróneo de «9 tablas» (mezclaba enums).
- **Migración**: `prisma/migrations/20261012000000_multi_tenant_onboarding/migration.sql` — sección Prisma generada offline con `prisma migrate diff` (solo lectura) y verificada sentencia a sentencia; guarda de duplicados `(tenantId, email)` antes de tocar índices; RLS de las 6 tablas nuevas (incluido `ConsentRecord` vía usuario); **único** ajuste de datos: `status=ACTIVO`/`plan=EMPRESARIAL` en AKI con guards que no pisan valores ya definidos; sin NIT/razón social/datos fiscales inventados y sin perfiles `VERIFICADO`.
- **Funciones SQL**: `resolve_login_identity` ahora retorna 4 columnas (slug/nombre) y filtra `status IN ('PRUEBA','ACTIVO')` (DROP+CREATE+re-GRANT); `resolve_user_identity` y `list_kiosk_employees` solo ganan ese filtro. Firmas idénticas → consumidores (`auth.service.ts`) compatibles.
- **A1 multi-tenant sin fugas**: sin endpoint público de correos→restaurantes; la lista sale solo cuando la contraseña cuadró en esos tenants; `POST /auth/login/select` valida token firmado (5 min) + `tenantId` perteneciente a los tenants verificados; guard endurecido para que el token de selección no sirva como access/refresh.
- **A2/A3**: PIN sin cambios; recuperación envía un código por cuenta y actúa solo sobre la cuenta cuyo código valide.
- **Pantalla nueva**: `/login/seleccionar` (solo aparece cuando el servidor la exige; reto en memoria de pestaña, sin localStorage). A1–A5 existentes intactos.
- **Gates reales**: `pnpm typecheck` ✅, `pnpm lint` ✅, `pnpm test` ✅ (106 pruebas), `prisma validate/generate` ✅.
- **Pendiente**: aplicar la migración y correr las pruebas de BD clonada (§10–§11 de `docs/MIGRATION-MULTITENANT.md`) — espera autorización.

### Validación en clon de la migración multi-tenant (2026-10-11) — ejecutada con autorización condicionada; BD real intacta

Continúa la entrada anterior. Registro completo en `docs/MIGRATION-MULTITENANT.md` §16.

- **Alcance ejecutado**: §10.1–3 sobre `aki_admin_clone` (OID 21359): respaldo → restauración probada → `prisma migrate deploy` → `db seed` (×2) → pruebas §11 y `pnpm e2e` **solo contra el clon**. Prohibiciones respetadas: ni `migrate deploy`, ni seed, ni escrituras, ni `migrate resolve` sobre `aki_admin`; sin integraciones externas y sin cambios de pantallas/identidad visual.
- **Respaldo**: `~/.aki-backups/…_premultitenant_pg16.dump` (herramientas v16 del contenedor, 107 objetos) restaurado con `--exit-on-error` y verificado: tablas, índices, restricciones, conteos y huellas md5 idénticos al origen. Descartado el dump del host (PG18) por `SET transaction_timeout` incompatible con PG16 (error documentado).
- **Migración en clon**: aplicada (5/5 en `_prisma_migrations`); `User_email_key` → `User_tenantId_email_key`; 6 tablas nuevas en 0 filas; AKI `ACTIVO`/`EMPRESARIAL`, `trialEndsAt`/`legalName`/`taxId` en NULL; 5 enums creados; `resolve_login_identity` con 4 columnas y `SECURITY DEFINER`; EXECUTE solo para `aki`/`aki_app` (PUBLIC revocado); RLS `enabled+force` con sus 6 políticas.
- **Pruebas §11: 11/11 aprobadas, 0 fallidas** — A1 (directo, 401 genérico, anti-enumeración `tenants-by-email` → 404), A2 (lista kiosco + PIN 1111), A3 (202→verify→reset→login nueva, vieja → 401, credenciales restauradas), correo en 2 tenants (reto con 2 opciones, `select` dentro → 200, fuera → 401, coincidencia única → directo), RLS negativa (6 tablas nuevas + `User`/`Session`: 0 sin contexto, A no ve B, cruces → error/0, positivos OK), 11 pruebas de tokens (manipulados/expirados/propósito incorrecto → 401; **sesión pre-migración → 200 rotada**; sesión revocada → 401), semilla idempotente sin sobrescribir ni inventar datos fiscales.
- **Regresión**: `pnpm e2e` → **53 pasaron / 16 omitidos / 0 fallaron** (A1/A2/A3, shell, visual, a11y, PWA; `dev-sheet` verde); `pnpm test` → **109/109**.
- **Errores**: solo de entorno y de mis guiones (PG18 vs PG16, `createdb` con URI, PID del logger contado como código, `SET app.tenant_id` olvidado) — todos corregidos y re-ejecutados; **ningún fallo del producto**.
- **Estado al cierre**: API dev restaurada en :3001 sobre `aki_admin` (`.env` sin modificar); origen verificado intacto (conteos originales, `User_email_key` presente, migración pendiente); en el clon queda documentado el fixture `clon-pruebas` (tenant de pruebas desechable con correo compartido que **no** coincide con `Admin1234!`, para no alterar A1/e2e).
- **Pendiente**: aplicar la migración en la **BD real** (§10.4–8: ventana de mantenimiento, deploy, código nuevo, verificación §12) — espera aprobación explícita posterior.

### Revisión final previa a producción (2026-10-11) — solo lectura, sin ejecutar la migración real

- **Auditoría del registro**: `docs/MIGRATION-MULTITENANT.md` §10–§16 ampliados con datos verificables: respaldo operativo (`aki_admin_20261011_173520_…_pg16.dump`, 48 873 bytes, sha256 `9bd0eb5d…`, restaurado y verificado) vs artefacto PG18 no restaurable en PG16; §16.7 con los comandos ejecutados sanitizados; aclaración de omitidos (16 saltos por condición, no fallos) vs pendientes (solo la aplicación real); conteo unitario final109 (§14 registró106 en su etapa).
- **Procedimiento de producción (§17, NO ejecutado)**: secuencia detener → respaldo final+restore probado → migración → puerta §12 → desplegar código → humo → observar; controles para que el código viejo no opere contra el esquema nuevo y el nuevo no arranque antes del esquema; criterios de éxito/parada y matriz de recuperación por momento de fallo. Hallazgo: **no hay runbook de despliegue en el repo** (medio real en el VPS por confirmar).
- **Seguridad (§18)**: confirmada ausencia total de rate limiting; PIN bloqueado solo en `localStorage`; código A3 sin contador de intentos ni consumo al fallar y generado con `Math.random`; `recovery/request` permite invalidar códigos y disparar envíos. **Mitigaciones mínimas documentadas como requisito previo al registro público (O1–O8)**, adelantando el hito de la Fase 10. Comportamiento durante el cambio confirmado: `sid` existía desde Fase 1 (`0f84a7f`) → tokens vigentes sobreviven; `RecoveryToken` idéntico al HEAD; RLS/`SECURITY DEFINER` sin cambios en lo previo (probados en clon).
- **Recuperación (§18.3)**: solo se garantiza full-restore en este servidor con el dump operativo; sin PITR, sin prueba en servidor fresco, RTO sin medir, restore del respaldo final pendiente hasta la ventana.
- **Límites respetados**: cero escrituras en `aki_admin` (solo `SELECT`, `pg_dump` y `migrate status`), cero despliegues, cero cambios de código; cambios únicamente documentales (§15–§18 de `MIGRATION-MULTITENANT.md` y esta entrada).

### Endurecimiento A1–A3, arreglo del filtro429 y verificación completa (2026-10-12)

- **Causa raíz del defecto que rompía la batería**: `RateLimitExceptionFilter` no llevaba `@Catch()`; Nest enrutaba **todas** las excepciones por ese filtro global y reescribía cada400/401 como429 con `Retry-After: undefined` (evidencia pre-fix:33 respuestas falsas vs8 reales). Arreglo: `@Catch(RateLimitException)` + regresión `apps/api/src/common/rate-limit-filter.test.ts` (rojo→verde demostrado) + `apps/api/vitest.config.mts` (`oxc.decorator.legacy`).
- **Limitadores A1–A3 en código** (`apps/api/src/common/rate-limit.ts`): ventanas deslizantes configurables por entorno (`RATE_LIMIT_<CLAVE>_{MAX,WINDOW,BLOCK}`, defaults en `.env.example`), IP del socket (no de cabeceras manipulables), bloqueos temporales,429 solo con `Retry-After`; A3 con CSPRNG, código vinculado a identidad+finalidad, consumo atómico y cooldown. Detalle en `docs/MIGRATION-MULTITENANT.md` §18.4 y runbook en `docs/OPERATIONS.md` (nuevo).
- **Batería HTTP:36 comprobaciones contra el clon (:3002) → 36/36 en dos corridas consecutivas** desde estados sucios (determinista entre ejecuciones). Cobertura: A1/A2/A3 completos, multi-tenant (reto, select, límites), refresh (rotación+revocación), higiene de logs/buzón e integridad de BD real y :3001.
- **Ajustes del harness (solo aislamiento; ningún control reducido)**: identidad distinta por escenario; limpieza de tokens sin usar **por correo del escenario** (el cooldown del emisor secuestraba escenarios); P0 «pizarra limpia» (hash inválido + un solo ciclo A3) para el email compartido entre tenants; prep MT que iguala la contraseña de los dos admins **vía la propia API** para poder emitir el reto de2; víctimas cuya contraseña no altera ningún escenario (evita dependencias entre corridas); `wait` acotado a los PID de curl (un `wait` libre colgaba la batería esperando al proceso de la API); `--max-time` en todos los curl.
- **Gates**: `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm test` ✅ **133** (api59, web27, ui23, shared24). BD real intacta: `aki_admin` OID16384 con4 migraciones, `RecoveryToken` 1→1 antes/después; clon OID21359 con la migración multi-tenant (5).
- **Entorno**: el equipo se reinició el 12/10 07:14 (borró `/tmp/opencode` — batería, logs y salidas de las corridas1–2 — y mató los servidores dev); se reconstruyó el entorno de pruebas (contenedor Postgres, dist aislado, entorno y batería). `:3001` quedó sin servidor dev (0 listeners antes y después; la batería no lo toca).
- **Pendiente/decisiones**: migración multi-tenant en la **BD real** (§17.1, espera autorización explícita); commit del trabajo de la rama (endurecimiento + fix + docs); versionar o no el harness de batería; Redis local con `requirepass` o acotado a localhost.

### Cierre técnico: batería versionada, filtro revisado y Redis (2026-10-12)

- **Batería versionada** en `apps/api/test/security/` (`battery.sh`, `launch-clone-api.js`, `clone.env.example`, `README.md`; atajo `pnpm run test:security`). Su preflight añade **tres puertas que abortan (`exit 90`) antes de la primera petición HTTP** si la configuración efectiva no demuestra uso exclusivo de `aki_admin_clone`: fichero sin claves duplicadas con URL exactas y `PORT=3002`; **sonda TCP con las credenciales propias de cada URL** exigiendo `current_database()=aki_admin_clone` con su `oid` en el servidor (el nombre escrito en el fichero no basta); `oid` de clon y BD real distintos con el fixture intacto. Demostración real de la puerta: un entorno mal generado fue **rechazado sin llegar a HTTP**. Corrida con el script del repo → **37/37**; limitaciones documentadas en el README (no prueba por sí sola que un cambio futuro del código ignore el entorno forzado: eso lo cubren la evidencia en cada arranque, la integridad final y el flujo P0, que cambia contraseñas en el clon y las verifica por HTTP). El entorno real y los artefactos siguen **fuera** del repo (`AKI_BATTERY_DIR`).
- **Revisión del filtro (B)**: regresión ampliada a4 comprobaciones —400/401 conservan código y cuerpo **sin** `Retry-After`; solo `RateLimitException` produce429 (cuerpo exacto `statusCode`+`message`, sin clave de límite ni ventana); un `Error` inesperado cae a500 genérico **sin** convertirse en429 ni filtrar el detalle. Decisión/efecto documentado: el filtro global atiende únicamente al limitador y todo lo demás vuelve al manejo por defecto de Nest (era el bug pre-fix).
- **Redis (C, sin actuar)**: el compose publica `6379:6379`, que binda a **todas** las interfaces cuando el contenedor corre (no está protegido por estar en Docker); estado verificado hoy: contenedor `aki-redis` **detenido** y sin listener; **ningún servicio lo necesita** (la API no usa Redis). Propuesta mínima segura en `docs/OPERATIONS.md` (loopback o red privada + secreto fuera del repo con `${REDIS_PASSWORD:?…}` o ACL) **sin aplicar ni reiniciar nada**. Nueva sección «Datos del VPS que debe confirmar el operador»: este entorno no tiene acceso ni evidencias del VPS.
- **Commits (D)**:4 convencionales en `fase-2-acceso`, sin push — `f7927cf` limitador+filtro · `aa514a5` endurecimiento A1–A3 con su base multi-tenant · `a59e908` batería de seguridad · G4 documentación. **Fuera** por ajenos y sin descartar: pantallas `pin`/`sede`/`turno`, `PinKeypad`/`PinLoginFlow`/`SedeSelection`, `components/turno/`, re-export de `@aki/ui` y las claves i18n `pin`/`sede`/`turno` del catálogo (hunk separado, working tree intacto).
- **Gates (E, sobre el árbol final)**: `pnpm typecheck` ✅ **6/6** · `pnpm lint` ✅ **5/5** · `pnpm test` ✅ **137** (api60 —10 limitador +4 filtro—, web27, ui23, shared24, config3) · batería **37/37** en el entorno aislado con el script del repo. BD real intacta (solo lectura: `RecoveryToken` 1→1, `aki_admin` OID16384); `:3001` sin tocar; `:3002` detenida al cierre.
- **Residual/decisiones**: migración multi-tenant en la **BD real** → requiere autorización explícita e independiente (§17.1); aplicación de la propuesta de Redis → decisión humana; registro público O1–O8 sigue bloqueado hasta la validación formal de este endurecimiento.

### Entrega 2: selección de sede conectada a datos reales (2026-10-12)

- **Diagnóstico**: el modelo `Sede` ya existía con `tenantId`, `active` y RLS `FORCE tenant_isolation`; faltaba el endpoint y la conexión del frontend. Los estados `open/closed/busy` y `cajaCount` del frontend eran **simulados** (no existen en el schema) y el filtro usaba el slug `cajica` como autoridad (eliminado).
- **Endpoint nuevo** `GET /api/auth/sedes` (`auth.controller.ts` + `AuthService.sedes`): el tenant sale del token validado por `JwtAuthGuard` (`req.user.tenantId`, nunca del cliente); corre dentro de `withTenant` y filtra `active: true` con `orderBy: { name: 'asc' }`; devuelve solo `{id, name, active}` (nuevo tipo `SedeOption` en `@aki/shared`, junto a `KioskEmployee`/`TenantOption`). **Sin `PermissionsGuard`**: el proyecto no define el recurso `sede` en la matriz `Permission` (`VISIBLE_RESOURCES`/`WRITE_RESOURCES`); el aislamiento lo garantizan guard + `withTenant` + RLS. Bloqueo documentado: la autorización fina por rol requiere que una decisión humana añada el recurso.
- **Frontend** (`SedeSelection.tsx`): `mockSedes` eliminado; carga real vía `getSedes()` (cliente HTTP existente, token Bearer); flag `cancelled` para no pintar datos de una sesión anterior; estados de carga (skeleton), vacío, error con **Reintentar** y éxito; `localStorage` queda solo como preferencia de interfaz (el servidor revalida); continuar deshabilitado con carga/error o si la selección no está en la lista recibida. Se quitó el contador de cajas (sin dato real) y el estado `Ocupada` (inventado). Se conservan diseño, textos y branding.
- **Pruebas**: +3 unitarias (`AuthService.sedes`: filtro tenant+active, orden, vacío) → api63; 4 checks HTTP en clon (`:3002`, dist aislado reconstruido): **401** sin token; **200** con exactamente las 2 sedes activas de `aki` (verificadas contra BD); **200 lista vacía** con sesión del tenant `clon-pruebas` (aislamiento real: no ve sedes ajenas); **401** con Bearer inválido. Log de la API: 0 códigos completos y 0 contraseñas. BD real intacta (oid16384, `RecoveryToken` 1, 4 migraciones).
- **Gates**: `pnpm typecheck` ✅ 6/6 · `pnpm lint` ✅ 5/5 · `pnpm test` ✅ **140** (api63, web27, ui23, shared24, config3).
- **Limitaciones**: la selección no persiste en BD (solo preferencia de interfaz); no hay validación POST de la selección (quedó fuera: la apertura de turno es otra entrega); el recurso `sede` en `Permission` sigue pendiente de decisión.
