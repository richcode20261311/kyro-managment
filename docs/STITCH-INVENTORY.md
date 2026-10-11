# Inventario canónico de pantallas Stitch

Proyecto Stitch: `projects/4125624347019376188`.
Fuente de verdad visual: `docs/DESIGN-CONTRACT.md` (manda sobre Stitch).
Códigos: los 93 de `docs/SCREEN-MAP.md`. Las variaciones de breakpoint **no** cuentan como pantallas distintas.

**Fecha:** 2026-10-10 · **Fase:** Paso 0 completado.

## Criterio de elección de la versión oficial

Cuando hay duplicadas, se elige la que **mejor cumple `DESIGN-CONTRACT.md`**, en este orden:

1. **Menú lateral de 16 ítems con los nombres exactos** del contrato (la mayoría de pantallas viejas traen menús antiguos: se descartan).
2. **Sin barras genéricas de Stitch** (pestañas "Woks & Calientes", "Sistema KDS // Central", chips "KDS En vivo", "Simulador", tabs de demostración).
3. **Sin `//` fuera del breadcrumb**.
4. **Ancho de frame 1280** (los frames rotulados 1440 o "Tablet 1280x800" son borradores previos: se re-maquetan a 1280/1024, nunca se copian).
5. **Sin texto partido ni desbordes horizontales en 1280.**
6. **Colores dentro de paleta AKI** (sin azul/marrón/morado; Outfit se sustituye por Poppins).

No se decide por antigüedad ni por fecha de generación. Si dos versiones empatan, se conserva la de **datos de ejemplo más completos** y la otra se marca duplicada (no se borra).

## Leyenda de estados y problemas

| Estado | Significado |
|---|---|
| ✅ Encontrada | Tiene pantalla en Stitch con contenido utilizable |
| 🔁 Duplicada | Varias versiones; se eligió la oficial y las demás quedan como referencia |
| 📝 Borrador | Existe pero es esqueleto/plantilla, no una pantalla completa |
| 📱 Responsive | Cubierta por el mismo sistema en viewport móvil con shell móvil de F2 |
| ⚠️ Sin referencia | No existe en Stitch: se diseña desde cero (al final de su fase) |

Claves de problemas: `MS` Material Symbols · `OUT` fuente Outfit · `FF` fecha fija · `COP` "COP" junto a cifras · `//` fuera de breadcrumb · `DEM` botones/tabs de demostración · `BAR` barra o header genérico de Stitch · `COL` colores fuera de paleta · `MEN` menú distinto al oficial · `OV` desbordes/alturas fijas en 1280 · `TÉC` textos técnicos (PWA, latencia, servidor).

---

## 1. Tabla canónica — 93 códigos

### Fundamentos (3)

| Código | Pantalla Stitch | ID oficial | Alternativos | Estado | Problemas |
|---|---|---|---|---|---|
| F1 | Hoja Componentes v2 | `d7fa8ccd...` | — | ✅ | Es referencia canónica; no requiere normalización |
| F2 | Plantillas base (Panel, Mesas, Tablet, Móvil) | `c20dfaa9...` (panel), `c075a72a...` (mesas) | `01a3c2c0...`, `9390a585...` | ✅ | `BAR` variantes tablet/móvil se re-maquetan a 1024/390 |
| F3 | Estados globales | `376826c7...` (búsqueda vacía), variantes | `f6f25c2d...` | 📝 | Sin pantalla dedicada: se compone en Fase 1 desde F1/F2 |

### Acceso — sin shell (5)

| Código | Pantalla Stitch | ID oficial | Alternativos | Estado | Problemas |
|---|---|---|---|---|---|
| A1 | Login Correo y Contraseña (3 breakpoints) | `92147c08...` | `aa100f66...`, `ec231d67...`, `d1476318...`, `de88ce77...` | ✅ | `MS` `FF` `DEM` `BAR` `MEN` — versión oficial: la de 1280 sin tabs de demo |
| A2 | Login con PIN | `41f089c0...` | `ea981c3a...` (movida a `design/stitch/_archivo/`) | 🔁 | `MS` `FF` `DEM` — se conserva la de selección de empleado + teclado, sin demo |
| A3 | Recuperar contraseña (4 pasos + expirado) | `38e14b93...` (paso 1) | `10dc52ad...` (paso 2), `44a2e5e5...` (paso 3), `81997d2c...` (paso 3 éxito), `3cdf3110...`, `53c1b1b4...` (expirado) | ✅ | `MS` `OUT` `FF` — un solo componente con estados |
| A4 | Selección de sede | `321149d3...` | — | ✅ | `MS` `FF` `TÉC` |
| A5 | Apertura de turno y caja | `afe2c20b...` | — | ✅ | `MS` `FF` `COP` |

### Centro de control (4)

| Código | Pantalla Stitch | ID oficial | Alternativos | Estado | Problemas |
|---|---|---|---|---|---|
| C1 | Panel principal (real, con datos) | `34f15bd3...` | `b08f3f84...`, `e9c54c5b...`, `ab701db0...`, `3ccaf53e...` (Panel General, vieja) | 🔁 | `MS` `FF` `//` `COL` — "Plantilla Base - Panel principal" es esqueleto F2, no sirve como C1 |
| C2 | Notificaciones (panel + página) | `99811388...` (página) | `5c2c17a2...` (panel campana) | ✅ | `MS` `FF` `BAR` |
| C3 | Búsqueda global (Ctrl+K + resultados) | `9adcb367...` (resultados) | `14255f1f...`, `376826c7...`, `f6f25c2d...` (plantillas) | ✅ | `MS` `BAR` `MEN` — las plantillas "Búsqueda Rápida 1440" se descartan |
| C4 | Mi perfil | `9e704902...` | — | ✅ | `MS` `FF` `OUT` |

### Salón y pedidos (10)

| Código | Pantalla Stitch | ID oficial | Alternativos | Estado | Problemas |
|---|---|---|---|---|---|
| P1 | Mapa de mesas | `c7ef4387...` | `a1c37be7...`, `4dbeb403...`, `b808560b...` | 🔁 | `MS` `FF` `COL` `//` `OV` `MEN` |
| P2 | Editor de plano | `bab755fe...` | — | ✅ | `MS` `FF` `COL` |
| P3 | Abrir mesa (modal) | `5dc8dd84...` | — | ✅ | `MS` `FF` `COP` |
| P4 | Toma de pedido (POS) | `8ef39d6f...` | `1a97635a...`, `172ed6f1...` | 🔁 | `MS` `FF` `COP` `//` `MEN` |
| P5 | Modificadores y notas (modal) | `943f638c...` | — | ✅ | `MS` `FF` `OV` |
| P6 | Revisión y envío a cocina | `ac31b836...` | — | ✅ | `MS` `FF` `COP` |
| P7 | Mover, unir y transferir mesas | `f085dcc2...` | — | ✅ | `MS` `FF` `COP` `//` `MEN` `BAR` (ver auditoría) |
| P8 | Lista de pedidos | `61bea48e...` | `a99a5c47...`, `f95914e4...` | 🔁 | `MS` `FF` — versión "1280px" de título `Pedidos / POS` es la más antigua |
| P9 | Detalle de pedido | `901280eb...` | `b89ce034...` | 🔁 | `MS` `FF` `COL` |
| P10 | Pedido para llevar | `f46c26f6...` | — | ✅ | `MS` `FF` `COP` |

### Domicilios (4)

| Código | Pantalla Stitch | ID oficial | Alternativos | Estado | Problemas |
|---|---|---|---|---|---|
| P11 | Nuevo domicilio | `8f59018a...` | — | ✅ | `MS` `FF` `COP` |
| P12 | Tablero de domicilios (4 columnas) | `7ce5bdf6...` | `644fb848...`, `e7a794ea...` (plantilla 1440) | 🔁 | `MS` `FF` `COL` — la de 1440 se descarta |
| P13 | Detalle de domicilio | `25b9579f...` | — | ✅ | `MS` `FF` `COP` |
| P14 | Módulo domiciliario (5 pantallas PWA) | `99b95565...` (panel), `e6962dc4...`, `a4845c03...`, `f1c7013c...`, `9a523980...` | `cde337d3...` (instalación PWA) | ✅ | `MS` `FF` `TÉC` (`cde337d3` es pantalla de instalación: se elimina el texto técnico) |

### Cocina — sin shell, oscura, 1280×800 (5)

| Código | Pantalla Stitch | ID oficial | Alternativos | Estado | Problemas |
|---|---|---|---|---|---|
| K1 | KDS todas las estaciones ("Cocina") | `a7e529e7...` | `9b9df06b...`, `504e6572...`, `79d1c819...`, `84cbdaa6...`, `f3833c7f...` | 🔁 | `DEM` `TÉC` `//` `COL` — título "Cocina" correcto; quitar simulaciones |
| K2 | KDS por estación | `193e5416...` (Sushi) | `29ba15b9...` (Caliente), `799c5d17...` (Bebidas) | ✅ | `DEM` `//` `TÉC` |
| K3 | Pantalla de despacho | `0392fc89...` | — | ✅ | `//` (ver auditoría) |
| K4 | Agotados (panel 480 px) | `551ea4d1...` | — | ✅ | `//` `FF` `COL` (ver auditoría) |
| K5 | Historial de despachadas (modal 880×640) | `58a5a0fa...` | `adaa7f27...` | 🔁 | `MS` `FF` |

### Caja (8)

| Código | Pantalla Stitch | ID oficial | Alternativos | Estado | Problemas |
|---|---|---|---|---|---|
| B1 | Cuenta de la mesa | `800d351a...` | — | ✅ | `MS` `FF` `COP` |
| B2 | Dividir cuenta | `0ccb9491...` | — | ✅ | `MS` `FF` `COP` |
| B3 | Cobro | `fa897c42...` | — | ✅ | `MS` `FF` `COP` |
| B4 | Datos de facturación | `f095ce65...` | — | ✅ | `MS` `FF` |
| B5 | Cobro exitoso | `4934b005...` | — | ✅ | `MS` `FF` `TÉC` |
| B6 | Movimientos de caja | `63e7de1e...` | — | ✅ | `MS` `FF` `COP` |
| B7 | Arqueo y cierre de turno | `5e8d6c95...` | `5edf7d59...` | 🔁 | `MS` `OUT` `FF` `COP` `//` `COL` — elegir la que tenga desglose por medio de pago |
| B8 | Reporte de cierre | `4c773a41...` | — | ✅ | `MS` `FF` `//` `DEM` `BAR` (ver auditoría) |

### Facturación DIAN (5)

| Código | Pantalla Stitch | ID oficial | Alternativos | Estado | Problemas |
|---|---|---|---|---|---|
| D1 | Lista de documentos | `1cbf0e3b...` | `7c387606...` | 🔁 | `MS` `FF` `COP` |
| D2 | Detalle del documento | `77243d86...` | `c3da034a...` | 🔁 | `MS` `FF` `TÉC` |
| D3 | Nota crédito | `66574db3...` | `9c7b03cf...` | 🔁 | `MS` `FF` `COP` |
| D4 | Numeración y resolución | `488474ee...` | `7aada698...` | 🔁 | `MS` `FF` |
| D5 | Conexión con el proveedor | `7c2dda47...` | `8a921198...` | 🔁 | `MS` `FF` `TÉC` |

### Menú, inventario y compras (15)

| Código | Pantalla Stitch | ID oficial | Alternativos | Estado | Problemas |
|---|---|---|---|---|---|
| M1 | Lista de productos | `4e181a01...` | `b39a9759...` | 🔁 | `MS` `FF` `//` |
| M2 | Editor de producto | `73e48294...` | — | ✅ | `MS` `FF` `COP` |
| M3 | Categorías | `86f76a25...` | — | ✅ | `MS` `FF` |
| M4 | Grupos de modificadores | `26ce6460...` | — | ✅ | `MS` `FF` |
| M5 | Combos y promociones | `7a4f04d5...` | — | ✅ | `MS` `FF` `COP` |
| M6 | Recetas y costos | `650e33c7...` | — | ✅ (nueva) | `MS` `OUT` `//` `FF` — pantalla completa con editor + catálogo |
| I1 | Existencias | `4ecebc65...` | `e7e1326d...` | 🔁 | `MS` `FF` |
| I2 | Detalle de insumo | `75d08c96...` | — | ✅ | `MS` `FF` `COP` |
| I3 | Entrada, merma y ajuste | `b6fe0ecdc...` | — | ✅ | `MS` `FF` |
| I4 | Conteo físico | `83eafb2e...` | — | ✅ | `MS` `FF` |
| I5 | Consumo teórico vs. real | `3dac7675...` | — | ✅ | `MS` `FF` `COL` |
| I6 | Proveedores | `1ec8749b...` | — | ✅ | `MS` `FF` `COP` |
| I7 | Orden de compra | `9a7acc3d...` | — | ✅ | `MS` `FF` `COP` |
| I8 | Recepción de mercancía | `7e144f67...` | — | ✅ | `MS` `FF` `OUT` (ver auditoría) |
| I9 | Cuentas por pagar | `728fc37e...` | — | ✅ | `MS` `FF` `COP` |

### Reportes (5)

| Código | Pantalla Stitch | ID oficial | Alternativos | Estado | Problemas |
|---|---|---|---|---|---|
| R1 | Ventas | — | — | ⚠️ Sin referencia | Usar C1/X1 (`34f15bd3...`, `ab8c0b4f...`) como referencia visual (KPIs + tablas + Recharts) |
| R2 | Productos y rentabilidad | — | — | ⚠️ Sin referencia | Usar M6 (`650e33c7...`) por su enfoque de costos y márgenes |
| R3 | Caja y propinas | — | — | ⚠️ Sin referencia | Usar B8 (`4c773a41...`) por sus tablas de totales y cierre |
| R4 | Inventario y mermas | — | — | ⚠️ Sin referencia | Usar I5 (`3dac7675...`) por su comparación teórico vs real |
| R5 | Programar y exportar | — | — | ⚠️ Sin referencia | Usar S7 (`27085a27...`) por su patrón de programación de tareas |

### Clientes y WhatsApp (8)

Códigos oficiales según `SCREEN-MAP.md`: W1 lista de clientes · W2 perfil · W3 segmentos y campañas · W4 bandeja WhatsApp · W5 conversación con pedido · W6 config del bot · W7 plantillas y respuestas rápidas · W8 métricas del bot.

| Código | Pantalla Stitch | ID oficial | Alternativos | Estado | Problemas |
|---|---|---|---|---|---|
| W1 | Lista/directorio de clientes | `e845746e...` (vista directorio de "Directorio de clientes y perfil 360°") | — | ✅ | `MS` `FF` — misma pantalla cubre la vista lista |
| W2 | Perfil del cliente 360° | `e845746e...` (vista perfil) | — | ✅ | `MS` `FF` `COP` |
| W3 | Segmentos y campañas | `9af0c388...` ("Campañas fidelización") | — | ✅ | `MS` `FF` `COP` |
| W4 | Bandeja de WhatsApp | `79b310f4...` ("Bandeja WhatsApp") | — | ✅ | `MS` `FF` `TÉC` |
| W5 | Conversación con pedido detectado | `23832a42...` ("Detalle de conversación y pedidos") | — | ✅ | `MS` `FF` `COP` |
| W6 | Configuración del bot | `8eb23a12...` ("Constructor bot") | — | ✅ | `MS` `FF` |
| W7 | Plantillas y respuestas rápidas | `d3e841bf...` ("Reglas y respuestas automáticas", nueva) | — | ✅ (nueva) | `MS` `OUT` `FF` `//` |
| W8 | Métricas del bot | `dece38a2...` ("Indicadores WhatsApp") | — | ✅ | `MS` `FF` |

### Reservas (5)

| Código | Pantalla Stitch | ID oficial | Alternativos | Estado | Problemas |
|---|---|---|---|---|---|
| V1 | Calendario | `9960ee12...` | `a64ed027...` (detalle), `de3b0a59...` | 🔁 | `MS` `FF` `COL` `//` |
| V2 | Nueva reserva (modal) | `dc3cb8b5...` | — | ✅ (nueva) | `MS` `OUT` `FF` `//` `DEM` (tabs de variantes) — fondo de V1 difuminado, se limpia |
| V3 | Detalle y estados | `cda1e5d1...` | — | ✅ | `MS` `FF` |
| V4 | Lista de espera | `2c93a24d...` | — | ✅ | `MS` `FF` |
| V5 | Página pública de reservas | `49c053ab...` | — | ✅ | `MS` `FF` |

### Personal (6)

| Código | Pantalla Stitch | ID oficial | Alternativos | Estado | Problemas |
|---|---|---|---|---|---|
| E1 | Lista de empleados | `11eef84a...` | `614d2a16...`, `b39a9759...` | 🔁 | `MS` `OUT` `FF` |
| E2 | Perfil de empleado | `967ca284...` | — | ✅ | `MS` `FF` `OUT` (ver auditoría) |
| E3 | Turnos semanales | `3df190eb...` | — | ✅ | `MS` `FF` `OUT` `COL` (ver auditoría) |
| E4 | Asistencia | `29b4a794...` | — | ✅ | `MS` `FF` |
| E5 | Roles y permisos | `61e5eae6...` | — | ✅ | `MS` `FF` |
| E6 | Desempeño y propinas | `43292122...` | — | ✅ | `MS` `FF` `COP` |

### Configuración (8)

| Código | Pantalla Stitch | ID oficial | Alternativos | Estado | Problemas |
|---|---|---|---|---|---|
| S1 | Datos del restaurante | `65d61181...` | `eefee9f0...` | 🔁 | `MS` `FF` |
| S2 | Impuestos y propina | `1cc52fd9...` | — | ✅ | `MS` `FF` `COP` |
| S3 | Impresoras | `4ea4c5e9...` | — | ✅ | `MS` `FF` `TÉC` |
| S4 | Métodos de pago y pasarela | `1d407299...` | — | ✅ | `MS` `FF` |
| S5 | Integraciones (DIAN y WhatsApp) | `b4edaa14...` | — | ✅ (nueva) | `MS` `OUT` `//` `DEM` (simulador de estados) `TÉC` (ping, latencia, AES-256) `FF` |
| S6 | Usuarios | `5a1fa79a...` | — | ✅ | `MS` `FF` |
| S7 | Copias de seguridad | `27085a27...` | — | ✅ | `MS` `FF` `TÉC` |
| S8 | Preferencias | `2b2036dd...` | — | ✅ | `MS` `FF` |

### Móviles por rol (2)

| Código | Pantalla Stitch | ID oficial | Alternativos | Estado | Problemas |
|---|---|---|---|---|---|
| X1 | Dueño: resumen en vivo | Responsive de C1 (`34f15bd3...`) con shell móvil F2 | `ab8c0b4f...` ("Dashboard Gerencial", referencia de contenido) | 📱 Responsive | No falta: viewport móvil de `/panel`. `ab8c0b4f` aporta datos de ejemplo, no se copia su layout de 2858 px |
| X2 | Mesero: mesas y pedido | Responsive de P1/P4 con shell móvil F2 | — | 📱 Responsive | No falta: viewport móvil de `/mesas` y `/pedidos/nuevo` |

**Resumen: 88/93 con pantalla en Stitch · 5 sin referencia visual (R1–R5) · 0 faltantes en A, B, D, K, M, S, V, W (las nuevas M6, S5, V2, B7 y A3-paso-3 ya existen).**

---

## 2. Pantallas con contenido que no corresponden a ningún código

| ID | Título en Stitch | Clasificación |
|---|---|---|
| `3ccaf53e...` | Panel General // AKI Admin | Borrador (versión vieja de C1, menú antiguo) |
| `ab8c0b4f...` | Dashboard Gerencial // AKI Management | Borrador (2858 px, contenido útil para X1/R1) |
| `6801be5b...` | W8. Config WhatsApp Business | Duplicado temático: corresponde a W6 (config del bot) |
| `f6f25c2d...` / `376826c7...` | Búsqueda Rápida // Plantilla Base 1440 | Borrador (frame 1440, se descarta) |
| `9a523980...` | Resumen (390 px) | Variante móvil de P14 |
| `cde337d3...` | Instalación PWA y Permisos | Extra de P14 (quitar textos técnicos) |
| `d1476318...` / `de88ce77...` | Login // AKI Admin | Variantes de A1 (con `//` y textos técnicos) |
| `f95914e4...` | Lista de Pedidos 1280px (menú con breadcrumb `Pedidos / POS`) | Duplicado antiguo de P8 |
| K1/K2/K5 variantes `504e6572`, `84cbdaa6`, `f3833c7f`, `adaa7f27`, `79d1c819`, `9b9df06b` | Cocina KDS modo operativo | Duplicados/borradores de K1 y K5 |
| `172ed6f1`, `14255f1f`, `376826c7`, `4dbeb403`, `61bea48e`, `644fb848`, `79d1c819`, `84cbdaa6`, `99b95565`, `a64ed027`, `a99a5c47`, `ab701db0`, `ab8c0b4f`, `b808560b`, `b89ce034`, `de88ce77`, `e7a794ea`, `e9c54c5b`, `f3833c7f`, `d1476318` | (pantallas ocultas `hidden=true`) | Duplicadas ocultas: se conservan, no se borran |
| ~20 pantallas de imágenes/logos (filename `image.png`, `file_000*`, "Logo", "Akí Cocina") | — | Descartables (assets de marca) |

---

## 3. Diferencia: 138 pantallas con contenido vs ~110 carpetas en `design/stitch/`

Hay 151 instancias en Stitch: 22 con nombre visible, 122 "Generating Screen..." con contenido y 7 assets de imagen. De las ~138 con contenido utilizable, **~110 tienen carpeta propia** (HTML + PNG + meta.json). Las ~28 restantes quedan sin carpeta y se clasifican así:

| Clase | Cantidad aprox. | Motivo |
|---|---|---|
| Duplicada de una pantalla ya descargada | ~14 | Otras versiones de K1, P1, P4, P8, P12, C1, D1–D5, E1, I1, V1 (se eligió una oficial; las alternativas se consultan vía MCP) |
| Variante de breakpoint de un código ya descargado | ~6 | A1 tablet/móvil, P14 (390 px), F2 tablet/móvil — el contrato manda, no el frame |
| Borrador / plantilla base 1440 o menú antiguo | ~5 | `3ccaf53e`, `f6f25c2d`, `376826c7`, versiones viejas de panel/login |
| Oculta (`hidden=true`) con contenido duplicado | ~3 | Se conservan en Stitch como historial |

Ninguna pantalla con contenido única se pierde: toda la lista anterior de IDs permite volver a descargarla.

---

## 4. Auditorías completadas (pantallas "Revisar" + nuevas)

| Pantalla | Estado | Hallazgos |
|---|---|---|
| **P7** Gestionar mesa | ⚠️ Re-maquetar | `MEN` menú con items distintos, `BAR` header propio de Stitch, `//` en chips de zona, `COP` ("$198.500 COP"), `FF` fecha fija, `MS`, `OUT` |
| **K3** Despacho | ✅ Buena | Cumple spec KDS (header 72 px, columnas 500+708, checklist 64 px). Solo `//` en título |
| **K4** Agotados | ✅ Buena | Panel 480 px correcto, header 72 px, 3 columnas KDS. Solo `//` en título, `FF` fecha fija, tokens `kds.*` a mapear a paleta AKI |
| **B8** Reporte de cierre | ⚠️ Re-maquetar | Shell completo correcto; `DEM` 5 tabs "Simulador B8", `MS`, `FF` "10/10/2026 04:35 p. m.", `//`, `COL` |
| **E2** Perfil de empleado | ⚠️ Re-maquetar | `MS`, `FF`, `OUT`, header propio de Stitch |
| **E3** Turnos semanales | ⚠️ Re-maquetar | `MS`, `FF`, `OUT`, `COL`, header de Stitch |
| **I8** Recepción de mercancía | ⚠️ Re-maquetar | `MS`, `FF`, `OUT`, `COP` |
| **M6** Recetas (nueva) | ✅ Buena estructura | `MS` `OUT` `//` en breadcrumb y KPIs; sin desbordes; datos completos. Quitar `//` del cuerpo |
| **S5** Integraciones (nueva) | ⚠️ Re-maquetar | `DEM` "Simulador de estados QA", `TÉC` (ping, latencia, AES-256, HSM, token), `//` en badges, `OUT`, verde `#16a34a` fuera de paleta (usar aki-success `#2E7D4F`) |
| **V2** Nueva reserva (nueva) | ✅ Buena estructura | Modal 740 px correcto sobre V1 difuminado; `DEM` tabs de variantes (se convierten en estados), `//`, `OUT`, `FF`, colores emerald fuera de paleta |
| **B7** Arqueo (nueva) | ✅ Buena estructura | KPIs 6 tarjetas + tabla de denominaciones correctas; `//`, `MS`, `OUT`, `FF`, `COP` |
| **W4** Plantillas (nueva) | ⚠️ Re-maquetar | `MS`, `OUT`, `//`, `FF` |
| **X2** Instalación PWA | ⚠️ Re-maquetar | `TÉC` (texto de instalación PWA — el contrato prohíbe "PWA" visible) |
| **X1** Dashboard gerencial | ⚠️ No copiar layout | 2858 px, `//`, `COP`, fecha "24/10/2023". Servirá solo como fuente de datos de ejemplo para C1/X1 |

---

## 5. Faltantes reales

X1 y X2 **no faltan**: son el mismo sistema en viewport móvil con el shell móvil de F2 → estado 📱 Responsive.

Tras la última generación en Stitch, las pantallas que faltaban (M6, S5, V2, B7, A3 paso 3) **ya existen**.

| Faltante | Referencia visual temporal |
|---|---|
| R1 Ventas | C1 `34f15bd3...` |
| R2 Productos y rentabilidad | M6 `650e33c7...` |
| R3 Caja y propinas | B8 `4c773a41...` |
| R4 Inventario y mermas | I5 `3dac7675...` |
| R5 Programar y exportar | S7 `27085a27...` |

Regla aplicada: van **al final de su fase** y se marcan "sin referencia visual".
