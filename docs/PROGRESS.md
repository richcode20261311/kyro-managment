# Progreso de AKI Admin

Actualiza este archivo al iniciar y al cerrar cada tarea. Es la memoria entre sesiones: cualquier sesión nueva debe leerlo antes de empezar.

**Última actualización:** 2026-10-10
**Fase actual:** 0c completada — tabla canónica en `docs/STITCH-INVENTORY.md`; pendiente plan de Fase 1
**Rama:** main

## Estado por fase

- [x] **Fase 0a:** reconocimiento inicial (22 pantallas nombradas)
- [x] **Fase 0b:** reconocimiento completo (116 "Generating Screen..." clasificadas, 138 totales)
- [ ] **Fase 1:** cimientos (F1, F2, F3)
- [ ] **Fase 2:** acceso y centro de control (A1 a A5, C1 a C4)
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

## Bloqueos y preguntas abiertas

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
