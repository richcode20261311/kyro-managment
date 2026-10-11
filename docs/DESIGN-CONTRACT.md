# Contrato de diseño de AKI Admin (v2)

Fuente de verdad visual del proyecto. Si una pantalla de Stitch contradice este documento, gana este documento.

## 1. Identidad

- **Logo:** archivo real en `apps/web/public/brand/aki-logo.png` (idealmente con fondo transparente). Nunca texto ni versiones redibujadas.
- Tamaños: menú lateral 56 px (44 px en el riel de tablet), login 180 px, barra móvil 36 px, reservas públicas 96 px.
- Solo sobre fondo blanco o `#F5F5F5`. En pantallas oscuras (Cocina), dentro de un círculo blanco de 44 px.
- Junto al logo va la etiqueta **"Admin"** (fondo rojo al 10%, texto rojo). El logo ya contiene el nombre del restaurante: no lo repitas.

## 2. Paleta (tokens de Tailwind; no uses HEX sueltos)

| Token | HEX | Uso |
|---|---|---|
| `aki-bg` | `#F5F5F5` | Fondo dominante (~70% de la interfaz) |
| `aki-surface` | `#FFFFFF` | Tarjetas |
| `aki-black` | `#000000` | Texto principal e iconos |
| `aki-red` | `#E80008` | Identidad, botones primarios, ítem activo, acentos |
| `aki-orange` | `#F87800` | Detalles y estados (en preparación) |
| `aki-gold` | `#F89800` | Detalles y advertencias |
| `aki-border` | `#E6E6E6` | Bordes |
| `aki-muted` | `#5C5C5C` | Texto secundario |
| `aki-disabled` | `#BDBDBD` | Deshabilitado |
| `aki-success` | `#2E7D4F` | Éxito |
| `aki-error` | `#B3001B` | Error y acciones destructivas (siempre con icono y texto) |

- **Degradado de marca:** rojo `#E80008` a naranja `#F87800`, 135°. Solo en: anillo del avatar, barras de progreso, línea superior de tarjetas destacadas y anillo del KPI principal. Nunca en fondos grandes.
- **Prohibido:** azul, marrón, morado y cualquier color fuera de la paleta.
- **Contraste:** el rojo sobre blanco solo en texto grande o en negrita (ratio aproximado 4.3:1). Texto blanco sobre rojo en botones.

## 3. Tipografía

- Títulos: **Poppins** 600/700. Cuerpo y cifras: **Inter**, con números tabulares.
- Escala: título de página 28, título de sección 20, cuerpo 16, auxiliar 14 (nunca menos). En tablet táctil el cuerpo es 18.
- La doble barra `//` se usa **solo** en el breadcrumb: `AKI Admin // Mesas`. Prohibida en etiquetas, chips, columnas, títulos y destinos (usa el punto medio: `Mesa 04 · Terraza`).

## 4. Espaciado y rejilla

- Escala 8: 8, 16, 24, 32, 48.
- Radio: 16 en tarjetas, 12 en botones e inputs.
- Tamaños mínimos: botón 48 (44 en móvil), input 48, fila de tabla 56, zona táctil 48x48, icono 24 con trazo 1.75 (lucide-react).
- Tarjetas con sombra muy suave y borde `#E6E6E6`.
- **Los elementos ocupan todo el ancho disponible.** Prohibidos los bloques pequeños flotando con espacio vacío a los lados.

## 5. Marcos de diseño y responsive

| Dispositivo | Marco | Menú | Contenido útil | Rejilla |
|---|---|---|---|---|
| Escritorio | 1280 px | 264 px | 952 px (contenido 1016 con márgenes de 32) | 12 columnas, separación 24 (columna de 57 px) |
| Tablet | 1024x768 horizontal | Riel de 88 px solo con iconos | 888 px (márgenes de 24) | 8 columnas |
| Móvil | 390 px | Barra inferior de 5 accesos | Margen de 16 | 4 columnas, separación 16 |

- Cero scroll horizontal en la página. Si un contenido es más ancho, el scroll vive dentro de su propio contenedor.
- Anchos mínimos de columna: 280 px en paneles, tablas y formularios; 220 px en tarjetas KPI de 3 columnas (cifra a 28 px). Excepción documentada: el tablero de domicilios (sección 12).
- En móvil: tablas convertidas en tarjetas apiladas, KPIs en 2x2, modales como hojas inferiores, botón primario fijo abajo a ancho completo.
- La misma pantalla conserva el orden de contenido, los componentes y los espaciados en los tres tamaños.

## 6. Shell único (un solo componente `AppShell`)

### Menú lateral (16 ítems; nombres, orden e iconos exactos)

| Sección | Ítem | Icono (lucide) |
|---|---|---|
| OPERACIÓN | Panel principal | `LayoutDashboard` |
| | Mesas | `Armchair` |
| | Pedidos / POS | `ClipboardList` |
| | Domicilios | `Bike` |
| | Cocina | `ChefHat` |
| | Caja | `Banknote` |
| GESTIÓN | Menú | `BookOpen` |
| | Inventario | `Package` |
| | Compras | `ShoppingBasket` |
| | Clientes | `Users` |
| | WhatsApp | `MessageCircle` |
| | Reservas | `CalendarDays` |
| ADMINISTRACIÓN | Facturación | `FileText` |
| | Personal | `UserCog` |
| | Reportes | `BarChart3` |
| | Configuración | `Settings` |

- Cabecera con el logo y la etiqueta "Admin". Pie con la tarjeta de usuario (avatar con anillo en degradado, nombre y rol). Sin versiones, estados de servidor ni textos técnicos.
- Alto 100% de la pantalla, fijo. Ítems de 48 px, texto de 16 px en una línea.
- Ítem activo: barra roja de 4 px a la izquierda, fondo rojo al 8%, icono y texto rojos. Inactivos en negro. Etiquetas de sección en mayúsculas, 12 px, gris, **sin `//`**.
- Tablet: riel de 88 px solo con iconos (etiqueta al tocar). Móvil: barra inferior de 5 accesos (Mesas, Pedidos, Caja, Clientes, Más); "Más" abre una hoja con los demás ítems agrupados en Operación, Gestión y Administración.

### Barra superior (72 px, una sola fila, todo en una línea)

Buscador `Buscar…` (Ctrl+K), selector `Sede Cajicá`, estado `Caja abierta` (punto verde, sin turno ni número), campana con punto rojo si hay avisos, botón rojo `Nuevo pedido` (un solo "+") y avatar. Si no cabe, se acorta el buscador, nunca el botón ni el avatar. Sin saldo de caja ni nombre largo del usuario.

### Encabezado de página

Breadcrumb `AKI Admin // [Sección]`, título a la izquierda con chip opcional ("En vivo") y fecha real, acciones a la derecha (un botón rojo primario y secundarios), barra de filtros debajo si aplica.

### Menú filtrado por rol

El menú es el mismo componente; se oculta lo que el rol no puede ver.

| Rol | Ve |
|---|---|
| Administrador | Todo |
| Cajero | Panel, Mesas, Pedidos / POS, Domicilios, Caja, Clientes |
| Mesero | Mesas, Pedidos / POS, Caja |
| Cocinero | Cocina (modo oscuro, sin shell) |
| Domiciliario | Domicilios y su perfil (PWA móvil) |

### Pantallas sin shell

Login y flujo de acceso, Cocina (KDS) en pantalla completa y modo oscuro, y la página pública de reservas.

## 7. Componentes

- **Botones:** primario rojo con texto blanco; secundario con borde negro; terciario solo texto; peligroso en `aki-error`. Texto en una línea.
- **Inputs:** foco con borde rojo de 2 px. Placeholders cortos.
- **Chips y estados:** siempre con icono o texto además del color.
- **Tablas:** anchos de columna fijos que suman el ancho útil; cada celda en una línea con elipsis; cabeceras de una línea; acción final con icono de 48 px.
- **Superposiciones:** capa negra al 40% (60% en Cocina) que cubre **toda** la pantalla (menú y barra superior incluidos), colocada **debajo** del panel; el panel es blanco opaco, sin transparencia ni desenfoque.
- **Estados obligatorios de cada pantalla:** cargando (skeleton), vacío, error con "Reintentar", sin conexión ("Sin conexión: tus pedidos se sincronizarán al volver") y sin permisos.

## 8. Estados de negocio y sus colores

| Entidad | Estado | Color / tratamiento |
|---|---|---|
| Mesa | Libre | Blanca, borde gris, punto verde |
| | Ocupada | Fondo rojo al 10%, borde rojo |
| | Pidió la cuenta | Dorado |
| | Reservada | Borde negro con icono de reloj |
| | Por limpiar | Gris |
| Pedido | Nuevo | Gris con texto negro |
| | En preparación | Dorado |
| | Listo | Verde |
| | En camino | Naranja |
| | Entregado | Gris |
| | Anulado | Carmesí |
| Pago | Pagado | Verde |
| | Sin pagar | Gris |
| | Contra entrega | Dorado |
| Factura DIAN | Aceptada | Verde |
| | Pendiente | Dorado |
| | Rechazada | Carmesí con motivo |
| Cronómetro | Menos de 8 min | Verde |
| | 8 a 15 min | Dorado |
| | Más de 15 min | Rojo |

## 9. Formatos

- Moneda COP sin decimales y sin escribir "COP" junto a las cifras: `$48.000`.
- Fechas `10/10/2026` (o `Sábado, 10/10/2026` en encabezados). Horas `1:26 p. m.`. Siempre con `Intl` en `es-CO`, nunca fechas fijas.

## 10. Modo cocina (KDS)

- Marco fijo de 1280x800, `overflow: hidden`, fondo `#111111`, tarjetas `#1C1C1C`, bordes `#2E2E2E`, texto blanco y secundario `#A6A6A6`. Sin menú, sin barra superior, sin barras genéricas.
- Tipografía legible a 1,5 m: cuerpo 18, ítems 20, número de pedido 24.
- Botones de 56 px o más. La cocina no muestra precios.
- **Encabezado idéntico en todas las pantallas de cocina** (72 px, margen de 24, una fila, sin clases responsivas que oculten elementos):
  - Izquierda: logo en círculo blanco de 44 px y título de una línea: `Cocina`, `Cocina · Caliente`, `Cocina · Sushi` o `Cocina · Bebidas` (sin subtítulos).
  - Centro: chips `En cola 8` y `Promedio 14:30`.
  - Derecha, con 8 px entre elementos: reloj (texto), chip `En línea`, timbre (56 px, solo icono), botón rojo `Pausar pedidos` (184x56) y botón de salida (56x56).
- Tablero de 3 columnas iguales de 394 px con 24 px de separación (Nuevos, En preparación, Listos), que llenan todo el alto; encabezado fijo y scroll vertical propio por columna.
- Tarjeta: número de pedido y cronómetro; destino y mesero; ítems con cantidad, nombre y estación; notas (naranja para modificaciones, carmesí con icono para alergias); botón de acción de 64 px de ancho completo.
- Barra inferior de 64 px: `Historial 20`, `Reimprimir comanda` y `Agotados 3` (carmesí). Sin textos técnicos.
- Modal de historial: 880x640, ancho interior de 832, tabla de columnas fijas (Pedido 120, Destino 240, Hora 120, Tiempo 120, Acciones 232), acciones como botones cuadrados de 48 px.

## 11. Reglas anti-deformación

- Números de pedido, etiquetas, chips, cronómetros, botones y cabeceras de tabla van en **una sola línea**. Si no caben: elipsis, scroll horizontal interno o bajar un paso de tamaño (nunca menos de 14 px).
- Cada zona de una tarjeta usa `min-width: 0` y elipsis; nada se superpone ni se sale del marco.
- Sin alturas fijas en tarjetas; las listas largas hacen scroll en su propia columna.
- Verifica cada pantalla en 1280, 1024 y 390: nada cortado, nada solapado, nada desbordado.

## 12. Excepciones y decisiones por pantalla

- **Lista de pedidos (P8):** 8 columnas con anchos fijos que suman exactamente 952: Pedido 112, Destino 200, Total 112, Hora 104, Espera 88, Estado 152, Pago 120, Acción 64. El tipo (mesa, llevar, domicilio) es un icono de 16 px antes del destino, sin columna propia; no hay columna de ítems. Sin insignias KDS, VIP, TAKE ni RAPPI y sin tarjetas KPI al pie.
- **Tablero de domicilios (P12):** en escritorio, 4 columnas de 226 px con 16 px de separación (Nuevo, En preparación, Listo, En camino), sin scroll; "Entregados" es una pestaña. Tarjetas con la misma estructura de 5 líneas, sin texto de botón (iconos de 48 px para asignar domiciliario y avanzar de estado).
- **Detalle de pedido (P9):** ítems en 8 columnas (627 px) y panel derecho en 4 columnas (301 px). Línea de tiempo a todo el ancho en verde, rojo y gris (nunca marrón).
- **Búsqueda (C3):** el panel rápido es blanco opaco por encima de la capa; la página de resultados organiza cada tarjeta en tres zonas sin superposición.
- **Domiciliario (P14):** no es una app aparte: es el mismo sistema como PWA con el menú filtrado por rol (barra inferior de 3 accesos: Domicilios, Mapa, Perfil).
- **Mesero (X2):** igual que P14, el mismo sistema en PWA con el menú filtrado para el rol Mesero.

## 13. Prohibido

Azul, marrón y morado; `//` fuera del breadcrumb; "COP" junto a cifras; texto técnico en la interfaz; fechas fijas; menús distintos al oficial; logo en texto; textos partidos en botones, chips y cifras; scroll horizontal en la página; alturas fijas en tarjetas; botones de demostración; barras genéricas de Stitch alrededor de la cocina.
