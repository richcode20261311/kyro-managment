# AKI Admin: reglas del proyecto

Lee este archivo completo al iniciar cada sesión. Los detalles viven en `docs/`.

## Producto

SaaS de gestión de restaurantes para **AKI Cocina Oriental** (Cajicá, Colombia), en reemplazo de Fudo.
Módulos: POS y pedidos, mesas, domicilios, cocina (KDS), caja, facturación electrónica DIAN, menú, inventario, compras, clientes, WhatsApp, reservas, personal, reportes y configuración.
Multi-tenant desde el día 1 (otros restaurantes se añadirán después). PWA instalable con modo sin conexión. Interfaz en español de Colombia.

## Documentos del proyecto

| Archivo | Cuándo leerlo |
|---|---|
| `docs/DESIGN-CONTRACT.md` | Antes de tocar cualquier interfaz (colores, tipografía, rejilla, shell, responsive, excepciones por pantalla) |
| `docs/SCREEN-MAP.md` | Antes de convertir una pantalla de Stitch (código, ruta, ítem activo del menú) |
| `docs/PHASES.md` | Al planear una fase (orden, backend requerido, reglas de negocio, definición de terminado) |
| `docs/PROGRESS.md` | Al iniciar y al cerrar cada tarea (estado, decisiones, bloqueos) |

## Fuentes de verdad (orden de prioridad)

1. `docs/DESIGN-CONTRACT.md` manda sobre lo que traiga Stitch cuando haya conflicto.
2. Las pantallas de Stitch (servidor MCP) mandan para layout, jerarquía, componentes y datos de ejemplo.
3. Nunca copies el HTML de Stitch tal cual: conviértelo en componentes React reutilizables.
4. Si el MCP de Stitch no responde, o una pantalla es ambigua, detente y pregunta. No inventes.

## Stack (no lo cambies sin preguntar)

- **Monorepo** pnpm + Turborepo: `apps/web`, `apps/api`, `packages/ui`, `packages/shared` (tipos, esquemas Zod, formateadores), `packages/config`.
- **Web:** Next.js (App Router), React, TypeScript estricto, Tailwind CSS, Radix UI, lucide-react (único set de iconos), TanStack Query, Zustand, React Hook Form, Zod, Recharts, Dexie (IndexedDB) y Serwist (PWA).
- **API:** NestJS, TypeScript, PostgreSQL 16 con Prisma, Redis con BullMQ, Socket.IO y OpenAPI (Swagger).
- **Pruebas:** Vitest, Testing Library y Playwright (incluye regresión visual y accesibilidad con axe).
- **Local:** Docker Compose (postgres, redis). Sin secretos en el repositorio: solo `.env.example`.

## Normalización obligatoria al convertir pantallas de Stitch

Elimina siempre:

- Barras superiores o inferiores genéricas de Stitch (pestañas tipo "Woks & Calientes", "Sistema KDS // Central Cajicá", chips "KDS En vivo").
- Textos técnicos: servidor, latencia, versión, nodo, buffer, terminal, PWA, impresora "OK".
- Botones de demostración ("Simular offline", "Simular vacío", "Vista") y frases como "Toque una tarjeta para interactuar".
- "COP" junto a cifras y "//" fuera del breadcrumb.
- Fechas fijas: usa la fecha real con `Intl` en `es-CO`.
- Menús con nombres, orden o iconos distintos al oficial.
- Colores fuera de paleta (azul, marrón, morado) y fuentes distintas a Poppins e Inter (si Stitch usa Outfit, usa Poppins).
- Iconos Material Symbols: unifícalos a lucide-react.
- Alturas fijas, clases responsivas que oculten elementos de encabezados y cualquier desbordamiento horizontal en 1280.

## Reglas de código

- TypeScript estricto, sin `any`. Componentes de menos de 250 líneas, con una sola responsabilidad. Lo compartido va a `packages/ui`.
- Todos los textos de UI en un solo catálogo es-CO. Formateadores únicos: `formatCOP(48000)` devuelve `$48.000`; fechas `10/10/2026`; horas `1:26 p. m.`.
- Accesibilidad: roles y etiquetas ARIA, foco visible, navegación por teclado, contraste AA.
- Cada pantalla cubre estos estados: cargando (skeleton), vacío, error con "Reintentar", sin conexión y sin permisos.
- No hagas cambios fuera del alcance de la tarea. Una rama por fase y un commit por pantalla o módulo, con mensaje convencional.

## Reglas de dominio (Colombia)

- Moneda COP sin decimales. Impuesto Nacional al Consumo (INC) 8%. Propina sugerida 10%, voluntaria (el cliente puede quitarla).
- Facturación electrónica DIAN mediante una interfaz `InvoicingProvider` con adaptadores intercambiables (MATIAS, Nextpyme, Factus, Facturalatam). Se guarda CUFE, resolución de numeración, prefijo, rango y vigencia. Notas crédito.
- Consentimiento de datos para clientes y WhatsApp según la Ley 1581 (habeas data).
- Aislamiento por restaurante (tenant): `tenant_id` en todas las tablas y Row Level Security en PostgreSQL.

## Flujo de trabajo

1. Empieza cada fase en **modo Plan**: propón y espera aprobación.
2. Implementa por vertical: pantallas (con datos simulados vía MSW hasta tener la API), esquemas compartidos, módulo de API, eventos en tiempo real y pruebas.
3. Antes de cerrar una tarea: typecheck, lint, pruebas unitarias y Playwright en verde.
4. Actualiza `docs/PROGRESS.md` al terminar (hecho, pendiente, decisiones, bloqueos).

## Seguridad

- Ninguna llave, token ni contraseña en el repositorio (incluida la del MCP de Stitch y las de DIAN, WhatsApp y Wompi). Solo variables de entorno.
- Verifica la firma de los webhooks (WhatsApp, Wompi) y usa claves de idempotencia en operaciones de dinero y de sincronización sin conexión.
- Registra auditoría de anulaciones, descuentos, cambios de precio, cierres de caja y cambios de permisos.

## Cuando dudes

Pregunta antes de decidir. Es preferible una pregunta corta a una suposición que haya que deshacer después.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
