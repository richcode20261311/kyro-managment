# Mapa de pantallas de AKI Admin

Relaciona cada pantalla de diseño (Google Stitch) con su código, ruta y comportamiento del shell. Si el nombre de una pantalla en Stitch no permite deducir su código, **pregunta** antes de asignarlo.

Convenciones:
- **Shell:** `Sí` = menú lateral + barra superior + encabezado de página. `No` = pantalla independiente.
- **Activo:** ítem del menú resaltado en rojo. `Ninguno` = no se resalta ninguno.
- Las vistas con varias variantes (por ejemplo A3 con 4 pasos) se implementan como una sola ruta con estados.

## Fundamentos

| Código | Pantalla | Ruta | Shell | Activo |
|---|---|---|---|---|
| F1 | Hoja de componentes | `/dev/componentes` (solo desarrollo) | No | n/a |
| F2 | Plantilla base (escritorio, tablet, móvil, hoja "Más") | Componente `AppShell` | Sí | n/a |
| F3 | Estados globales (sin conexión, sin permisos, 404, sesión expirada, skeletons, vacíos, error, confirmación destructiva) | Componentes transversales | n/a | n/a |

## Acceso (sin shell)

| Código | Pantalla | Ruta |
|---|---|---|
| A1 | Login con correo y contraseña | `/login` |
| A2 | Login con PIN (selección de empleado y teclado) | `/login/pin` |
| A3 | Recuperar contraseña (4 pasos y enlace expirado) | `/recuperar` |
| A4 | Selección de sede | `/sede` |
| A5 | Apertura de turno y caja | `/turno/apertura` |

## Centro de control

| Código | Pantalla | Ruta | Shell | Activo |
|---|---|---|---|---|
| C1 | Panel principal | `/panel` | Sí | Panel principal |
| C2 | Notificaciones (panel de la campana y página) | Panel flotante y `/notificaciones` | Sí | Ninguno |
| C3 | Búsqueda global (panel Ctrl+K y resultados) | Panel flotante y `/buscar` | Sí | Ninguno |
| C4 | Mi perfil | `/perfil` | Sí | Ninguno |

## Salón y pedidos

| Código | Pantalla | Ruta | Shell | Activo |
|---|---|---|---|---|
| P1 | Mapa de mesas | `/mesas` | Sí | Mesas |
| P2 | Editor de plano | `/mesas/editor` | Sí | Mesas |
| P3 | Abrir mesa (modal) | Modal sobre `/mesas` | Sí | Mesas |
| P4 | Toma de pedido (POS) | `/pedidos/nuevo` | Sí | Pedidos / POS |
| P5 | Modificadores y notas (modal) | Modal sobre P4 | Sí | Pedidos / POS |
| P6 | Revisión y envío a cocina | `/pedidos/nuevo/revisar` | Sí | Pedidos / POS |
| P7 | Mover, unir y transferir mesas (panel lateral) | Panel sobre `/mesas` | Sí | Mesas |
| P8 | Lista de pedidos | `/pedidos` | Sí | Pedidos / POS |
| P9 | Detalle de pedido | `/pedidos/[id]` | Sí | Pedidos / POS |
| P10 | Pedido para llevar | `/pedidos/llevar/nuevo` | Sí | Pedidos / POS |

## Domicilios

| Código | Pantalla | Ruta | Shell | Activo |
|---|---|---|---|---|
| P11 | Nuevo domicilio | `/domicilios/nuevo` | Sí | Domicilios |
| P12 | Tablero de domicilios | `/domicilios` | Sí | Domicilios |
| P13 | Detalle de domicilio y asignación | `/domicilios/[id]` | Sí | Domicilios |
| P14 | Módulo del domiciliario (PWA, rol Domiciliario) | `/repartidor` y subrutas | Shell móvil con menú filtrado | Domicilios |

## Cocina (sin shell, modo oscuro, pantalla completa 1280x800)

| Código | Pantalla | Ruta |
|---|---|---|
| K1 | KDS con todas las estaciones | `/cocina` |
| K2 | KDS por estación (Sushi, Caliente, Bebidas) | `/cocina/[estacion]` |
| K3 | Pantalla de despacho | `/cocina/despacho` |
| K4 | Agotados (panel lateral de 480 px) | Panel sobre `/cocina` |
| K5 | Historial de despachadas (modal de 880x640) | Modal sobre `/cocina` |

## Caja

| Código | Pantalla | Ruta | Activo |
|---|---|---|---|
| B1 | Cuenta de la mesa | `/caja/cuenta/[id]` | Caja |
| B2 | Dividir cuenta | `/caja/cuenta/[id]/dividir` | Caja |
| B3 | Cobro (métodos, efectivo y cambio) | `/caja/cuenta/[id]/cobro` | Caja |
| B4 | Datos de facturación del cliente | Paso del cobro | Caja |
| B5 | Cobro exitoso (imprimir y enviar) | Paso del cobro | Caja |
| B6 | Movimientos de caja | `/caja/movimientos` | Caja |
| B7 | Arqueo y cierre de turno | `/caja/cierre` | Caja |
| B8 | Reporte de cierre | `/caja/cierre/reporte` | Caja |

## Facturación electrónica DIAN

| Código | Pantalla | Ruta | Activo |
|---|---|---|---|
| D1 | Lista de documentos electrónicos | `/facturacion` | Facturación |
| D2 | Detalle del documento (CUFE, PDF, XML) | `/facturacion/[id]` | Facturación |
| D3 | Nota crédito | `/facturacion/[id]/nota-credito` | Facturación |
| D4 | Numeración y resolución | `/facturacion/numeracion` | Facturación |
| D5 | Conexión con el proveedor | `/facturacion/proveedor` | Facturación |

## Menú, inventario y compras

| Código | Pantalla | Ruta | Activo |
|---|---|---|---|
| M1 | Lista de productos | `/menu` | Menú |
| M2 | Editor de producto | `/menu/productos/[id]` | Menú |
| M3 | Categorías | `/menu/categorias` | Menú |
| M4 | Grupos de modificadores | `/menu/modificadores` | Menú |
| M5 | Combos y promociones | `/menu/combos` | Menú |
| M6 | Recetas y costos | `/menu/recetas` | Menú |
| I1 | Existencias | `/inventario` | Inventario |
| I2 | Detalle de insumo | `/inventario/[id]` | Inventario |
| I3 | Entrada, merma y ajuste | Modal sobre `/inventario` | Inventario |
| I4 | Conteo físico | `/inventario/conteo` | Inventario |
| I5 | Consumo teórico vs. real | `/inventario/consumo` | Inventario |
| I6 | Proveedores | `/compras/proveedores` | Compras |
| I7 | Orden de compra | `/compras/ordenes` | Compras |
| I8 | Recepción de mercancía | `/compras/recepcion` | Compras |
| I9 | Cuentas por pagar | `/compras/cuentas` | Compras |

## Reportes

| Código | Pantalla | Ruta | Activo |
|---|---|---|---|
| R1 | Ventas | `/reportes/ventas` | Reportes |
| R2 | Productos y rentabilidad | `/reportes/productos` | Reportes |
| R3 | Caja y propinas | `/reportes/caja` | Reportes |
| R4 | Inventario y mermas | `/reportes/inventario` | Reportes |
| R5 | Programar y exportar | `/reportes/programados` | Reportes |

## Clientes y WhatsApp

| Código | Pantalla | Ruta | Activo |
|---|---|---|---|
| W1 | Lista de clientes | `/clientes` | Clientes |
| W2 | Perfil del cliente | `/clientes/[id]` | Clientes |
| W3 | Segmentos y campañas | `/clientes/segmentos` | Clientes |
| W4 | Bandeja de WhatsApp | `/whatsapp` | WhatsApp |
| W5 | Conversación con pedido detectado | `/whatsapp/[id]` | WhatsApp |
| W6 | Configuración del bot | `/whatsapp/bot` | WhatsApp |
| W7 | Plantillas y respuestas rápidas | `/whatsapp/plantillas` | WhatsApp |
| W8 | Métricas del bot | `/whatsapp/metricas` | WhatsApp |

## Reservas

| Código | Pantalla | Ruta | Shell | Activo |
|---|---|---|---|---|
| V1 | Calendario | `/reservas` | Sí | Reservas |
| V2 | Nueva reserva | Modal sobre `/reservas` | Sí | Reservas |
| V3 | Detalle y estados | `/reservas/[id]` | Sí | Reservas |
| V4 | Lista de espera | `/reservas/espera` | Sí | Reservas |
| V5 | Página pública de reservas (móvil, 4 pasos y confirmación) | `/reservar` | No | n/a |

## Personal

| Código | Pantalla | Ruta | Activo |
|---|---|---|---|
| E1 | Lista de empleados | `/personal` | Personal |
| E2 | Perfil de empleado | `/personal/[id]` | Personal |
| E3 | Turnos semanales | `/personal/turnos` | Personal |
| E4 | Asistencia | `/personal/asistencia` | Personal |
| E5 | Roles y permisos | `/personal/roles` | Personal |
| E6 | Desempeño y propinas | `/personal/desempeno` | Personal |

## Configuración

| Código | Pantalla | Ruta | Activo |
|---|---|---|---|
| S1 | Datos del restaurante | `/configuracion/restaurante` | Configuración |
| S2 | Impuestos y propina | `/configuracion/impuestos` | Configuración |
| S3 | Impresoras | `/configuracion/impresoras` | Configuración |
| S4 | Métodos de pago y pasarela | `/configuracion/pagos` | Configuración |
| S5 | Integraciones (DIAN y WhatsApp) | `/configuracion/integraciones` | Configuración |
| S6 | Usuarios | `/configuracion/usuarios` | Configuración |
| S7 | Copias de seguridad | `/configuracion/respaldos` | Configuración |
| S8 | Preferencias | `/configuracion/preferencias` | Configuración |

## Móviles por rol (PWA)

| Código | Pantalla | Ruta | Notas |
|---|---|---|---|
| X1 | Dueño: resumen en vivo | `/panel` (viewport móvil) | Mismo sistema, shell móvil |
| X2 | Mesero: mesas y toma de pedido | `/mesas` y `/pedidos/nuevo` (viewport móvil) | Mismo sistema, menú filtrado para el rol Mesero |

## Pantallas con versiones duplicadas

Stitch puede tener varias versiones de una misma vista (por ejemplo, versiones viejas de P8, P9 y P12 con otro menú). Usa solo la versión corregida más reciente y repórtame los duplicados antes de descartarlos.
