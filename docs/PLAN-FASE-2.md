# Plan de Fase 2 — Acceso y centro de control (A1–A5, C1–C4)

**Aprobado:** 2026-10-11 · **Rama:** `fase-2-acceso` · **Según `PHASES.md`:** autenticación (correo y PIN), roles y permisos, sedes, apertura de turno y caja, notificaciones, búsqueda global. Primera fase con backend real.

## Alcance de pantallas

| Código | Ruta | Contenido |
|---|---|---|
| A1 | `/login` | Correo + contraseña (RHF + Zod), estados de error |
| A2 | `/login/pin` | Selección de empleado + teclado numérico |
| A3 | `/recuperar` | 4 pasos en una ruta con estados + enlace expirado |
| A4 | `/sede` | Selección de sede |
| A5 | `/turno/apertura` | Apertura de turno con fondo de caja |
| C1 | `/panel` | KPIs con datos (MSW → API) |
| C2 | Panel campana + `/notificaciones` | No leídas/leídas, marcado, paginación |
| C3 | Panel Ctrl+K + `/buscar` | Buscador global con resultados agrupados |
| C4 | `/perfil` | Datos, cambio de contraseña, cierre de sesión |

Flujo protegido: `login → sede → apertura de turno → panel` (middleware redirige según falte).

## Tareas (orden por riesgo)

| # | Tarea | Riesgo | Est. |
|---|---|---|---|
| 1 | Docker Compose + Prisma + schema multi-tenant + RLS + seed AKI | **Alto** (RLS con pool) | 1 d |
| 2 | API auth (correo, PIN, refresh, recuperación) + guards + auditoría | **Alto** | 1.5 d |
| 3 | Infra frontend: TanStack Query, cliente HTTP con token, Zustand sesión, middleware de rutas | Alto | 1 d |
| 4 | A1 + A3 | Medio | 1 d |
| 5 | A2 + A4 + A5 | Medio | 1.5 d |
| 6 | API sedes, turnos/caja, notificaciones (BullMQ), búsqueda global | Medio | 1 d |
| 7 | C1 + C2 + C3 + C4 | Medio | 1.5 d |
| 8 | Pruebas: flujo completo Playwright 3 viewports, axe, visual | Alto | 1 d |
| 9 | Cierre: PROGRESS y decisiones | Bajo | 0.25 d |

**Total ≈ 10.25 días** · un commit por pantalla o módulo.

## Decisiones

| Fecha | Decisión |
|---|---|
| 2026-10-11 | Plan aprobado por el usuario |
| 2026-10-11 | Recuperación de contraseña por **correo SMTP vía interfaz `EmailProvider`** con adaptador **Brevo** (credenciales en `.env`) y adaptador `LogEmailProvider` en desarrollo. El proveedor es intercambiable sin tocar la lógica |
| 2026-10-11 | **Seed de desarrollo**: tenant AKI, 2 sedes, 5 usuarios (uno por rol) con PINs conocidos; nunca se ejecuta en producción |
| 2026-10-11 | Búsqueda global por índice extensible: Fase 2 indexa usuarios, sedes, notificaciones y ajustes; cada fase añade los suyos |
| 2026-10-11 | Notificaciones por REST + polling en Fase 2; Socket.IO entra en Fase 4 y se reutiliza aquí |
| 2026-10-11 | IDs de negocio (pedidos, líneas) se generan en cliente con UUIDv7 (ya listo en `@aki/shared`) |

## Definición de terminado

- typecheck, lint, unitarios, build y Playwright en verde (1280/1024/390).
- Flujo completo `login → sede → turno → panel` probado de extremo a extremo contra la API real.
- axe sin errores críticos; estados (cargando, vacío, error, sin conexión, sin permisos) en las 9 pantallas.
- Menú/topbar idénticos al `AppShell`; ítems activos según `SCREEN-MAP`.
- `docs/PROGRESS.md` actualizado.
