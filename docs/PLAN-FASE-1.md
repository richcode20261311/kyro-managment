# Plan de Fase 1 — Cimientos (F1, F2, F3)

**Aprobado:** 2026-10-11 · **Rama:** `fase-1-cimientos` · **Alcance según `PHASES.md`:** monorepo, tokens, componentes, `AppShell`, estados globales, pruebas visuales. **Sin backend** (arranca en Fase 2).

## 1. Estructura del monorepo

```
AKI/
├── apps/
│   ├── web/          Next.js App Router (PWA con Serwist)
│   └── api/          NestJS (carcasa vacía en Fase 1; se llena en Fase 2)
├── packages/
│   ├── ui/           Componentes React reutilizables (lucide-react + Radix)
│   ├── shared/       Tipos, esquemas Zod, formateadores, catálogo es-CO, ids
│   └── config/       Preset Tailwind con tokens AKI, tsconfig, eslint
├── docs/             Contrato, mapa de pantallas, fases, progreso, inventario
├── design/           Referencia Stitch (excluida de git y de todos los builds)
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example      (sin secretos)
```

**Exclusión de `design/` de builds (doble barrera):**
- `.gitignore` ✅ hecho
- `tsconfig.json` → `exclude: ["design"]`
- `next.config.ts` → `ignorePatterns`
- `.dockerignore` (se crea en Fase 10)
- Verificación final: `pnpm build` sin que nada de `design/` entre a TypeScript, Next, Docker ni bundles.

## 2. Tokens y diseño (`packages/config` + `packages/shared`)

- Preset Tailwind: `aki-bg #F5F5F5`, `aki-red #E80008`, `aki-orange #F87800`, `aki-gold #F89800`, `aki-success #2E7D4F`, `aki-error #B3001B`.
- Tipografía: Poppins (títulos), Inter (cuerpo), `tabular-nums` para cifras.
- Breakpoints: `1280` (escritorio) / `1024` (tablet) / `390` (móvil).
- `packages/shared`: `formatCOP(48000) → "$48.000"`, `formatDate → 10/10/2026`, `formatTime → 1:26 p. m.` (Intl `es-CO`), catálogo único de textos, `newId()` UUIDv7, tipo `IdempotencyKey`.

## 3. `AppShell` (F2) — componente de mayor riesgo

- Sidebar 264 px con **menú oficial de 16 ítems** (nombres exactos del contrato) + ítem activo según `SCREEN-MAP`.
- Topbar 72 px con slots para campana (C2) y buscador Ctrl+K (C3) — contenido en Fase 2.
- Breadcrumb `AKI Admin // Sección` — **único lugar del sistema con `//`**.
- Responsive: en 390 el sidebar pasa a hoja "Más"; sin desbordes ni texto partido en 1280/1024/390.
- Variantes: shell completo (app), shell móvil con menú filtrado (X1/X2/P14), **sin shell** (Acceso A1–A5, Cocina K1–K5, `/reservar` V5).

## 4. Inventario de componentes (`packages/ui`)

| Grupo | Componentes |
|---|---|
| Primitivos | Button, Input, Select, Textarea, Checkbox, Radio, Badge, Chip, Card, Table, Tabs, Tooltip, Dialog, Drawer, Toast, Pagination |
| Shell | `AppShell`, `Sidebar`, `Topbar`, `Breadcrumb`, `MobileSheet`, `PageHeader` |
| Estados (F3) | `Skeleton`, `EmptyState`, `ErrorState` (Reintentar), `OfflineBanner`, `ForbiddenState`, `SessionExpiredDialog`, `ConfirmDestructive`, `NotFound404` |
| Datos | `StatCard` (KPI), `FormField`, `SearchInput`, `FilterBar` |

Reglas: TypeScript estricto sin `any`, <250 líneas, una responsabilidad, ARIA + foco visible + contraste AA.

## 5. Árbol de rutas (93 códigos → rutas)

```
app/
├── (acceso)/    sin shell: /login (A1), /login/pin (A2), /recuperar (A3),
│                /sede (A4), /turno/apertura (A5)
├── (app)/       con AppShell:
│   ├── /panel (C1/X1), /notificaciones (C2), /buscar (C3), /perfil (C4)
│   ├── /mesas, /mesas/editor (P1,P2,P3,P7) · /pedidos/... (P4–P6,P8–P10)
│   ├── /domicilios/... (P11–P13) · /repartidor (P14, shell móvil)
│   ├── /caja/... (B1–B8) · /facturacion/... (D1–D5)
│   ├── /menu/... (M1–M6) · /inventario/... (I1–I5) · /compras/... (I6–I9)
│   ├── /reportes/... (R1–R5) · /clientes/... (W1–W3) · /whatsapp/... (W4–W8)
│   ├── /reservas/... (V1–V4) · /personal/... (E1–E6) · /configuracion/... (S1–S8)
├── (cocina)/    sin shell, oscuro 1280×800: /cocina, /cocina/[estacion],
│                /cocina/despacho (K1–K3) + paneles K4/K5
├── (publico)/   sin shell: /reservar (V5)
└── dev/         /dev/componentes (F1, solo desarrollo)
```

En Fase 1 se crea el **esqueleto de rutas con placeholder**; cada pantalla se implementa en su fase.

## 6. Modelo de datos y offline (convenciones, no esquema completo)

- Convención `tenant_id` + RLS documentada; auditoría (`created_at`, `updated_at`, `deleted_at`); UUIDv7 **generado en cliente** → helpers y tipos en `packages/shared`.
- PWA: Serwist configurado + cola `outbox` en Dexie con claves de idempotencia **como interfaz** (lógica completa en Fase 10) + `OfflineBanner` de F3.

## 7. Pruebas

- Vitest + Testing Library por paquete.
- Playwright en 1280/1024/390, axe sin errores críticos, regresión visual con capturas propias normalizadas (las de Stitch son referencia, no baseline).
- Comandos Turborepo: `pnpm typecheck && pnpm lint && pnpm test && pnpm e2e`.

## 8. Secuencia ordenada por riesgo

| # | Tarea | Riesgo | Est. |
|---|---|---|---|
| 1 | Scaffold Turborepo + tooling (tsconfig, eslint, vitest, playwright) | Integración de versiones | 0.5 d |
| 2 | Tokens Tailwind + tipografía | Alto: si cambia, cambia todo | 0.5 d |
| 3 | `packages/shared` (formateadores, catálogo, ids) | Medio | 0.5 d |
| 4 | **`AppShell` F2** (16 ítems + responsive 3 breakpoints) | **Alto** | 1.5 d |
| 5 | Primitivos `packages/ui` (~20 componentes) | Medio | 2 d |
| 6 | Estados globales F3 | Medio | 1 d |
| 7 | Hoja de componentes F1 | Bajo | 0.5 d |
| 8 | Pruebas (unit + e2e + axe + visual) | Alto: 3 viewports | 1.5 d |
| 9 | Serwist + Dexie stub | Medio | 0.5 d |

**Total ≈ 8.5 días** · commits por componente o módulo.

## Definición de terminado

- `typecheck`, `lint` y unitarios en verde.
- Playwright en 1280/1024/390 sin desbordamiento horizontal ni texto partido.
- `AppShell` idéntico al `DESIGN-CONTRACT` (menú 16 ítems, breadcrumb, ítems activos).
- Estados F3 cubiertos: cargando, vacío, error, sin conexión, sin permisos.
- axe sin errores críticos.
- `docs/PROGRESS.md` actualizado.

## Decisiones

| Fecha | Decisión |
|---|---|
| 2026-10-11 | Plan aprobado por el usuario |
| 2026-10-11 | `aki-logo.png` se mueve a `apps/web/public/brand/` en esta fase |
| 2026-10-11 | `design/` excluida de git y de todos los builds |
