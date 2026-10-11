# Progreso de AKI Admin

Actualiza este archivo al iniciar y al cerrar cada tarea. Es la memoria entre sesiones: cualquier sesión nueva debe leerlo antes de empezar.

**Última actualización:** 2026-10-11
**Fase actual:** 2 en curso — tareas 1 (base de datos + RLS), 2 (API de autenticación), 3 (infra frontend de sesión) y 4 (A1 login + A3 recuperar) completadas
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
| 5. A2 + A4 + A5 (PIN, sede, turno) | ⏳ |
| 6. API sedes, turnos/caja, notificaciones, búsqueda global | ⏳ |
| 7. C1 + C2 + C3 + C4 | ⏳ |
| 8. Pruebas: flujo completo 3 viewports, axe, visual | ⏳ |
| 9. Cierre y PROGRESS | ⏳ |

## Bloqueos y preguntas abiertas

- **Rate limiting del login**: sin límite de intentos en Fase 2;保驾护arlo en la tarea de seguridad de la Fase 10
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
