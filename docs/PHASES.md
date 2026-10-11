# Hoja de ruta de AKI Admin

Orden de construcción por fases. Cada fase es una **vertical**: pantallas, esquemas compartidos, módulo de API, tiempo real y pruebas. Una rama por fase (`fase-N-slug`) y un commit por pantalla o módulo.

## Fases

| Fase | Pantallas | Qué debe resolver el backend |
|---|---|---|
| 0 | Reconocimiento (solo lectura) | Inventario de pantallas de Stitch, auditoría contra el contrato, informe de inconsistencias |
| 1 | Cimientos: F1, F2, F3 | Monorepo, tokens, componentes, `AppShell`, estados globales, pruebas visuales |
| 2 | A1 a A5, C1 a C4 | Autenticación (correo y PIN), roles y permisos, sedes, apertura de turno y caja, notificaciones, búsqueda global |
| 3 | P1 a P3, P7, P4 a P6, P8 a P10 | Mesas y plano, pedidos con máquina de estados, líneas y modificadores, comanda dividida por estación, anulaciones con motivo y auditoría |
| 4 | K1 a K5 | Tickets por estación, tiempo real (Socket.IO), cronómetros, despacho, agotados, historial y devolución a cocina |
| 5 | P11 a P14 | Domicilios, zonas y costo de envío, asignación de domiciliarios, PWA del domiciliario con ubicación y cola sin conexión |
| 6 | B1 a B8, D1 a D5 | Cuentas, división, pagos mixtos, propina e INC, cierre y arqueo de caja, `InvoicingProvider` con adaptador de pruebas, numeración y notas crédito |
| 7 | M1 a M6, I1 a I9 | Catálogo, modificadores y recetas, descuento de inventario por receta, mermas, conteos, compras y cuentas por pagar |
| 8 | W1 a W8, V1 a V5 | Clientes con consentimiento, webhook de WhatsApp Cloud API, bot con entrega a humano, pedido detectado, reservas y página pública |
| 9 | E1 a E6, R1 a R5, S1 a S8, X1, X2 | Personal y turnos, reportes agregados, configuración, impresoras (ESC/POS), copias de seguridad, vistas móviles por rol |
| 10 | Transversal | PWA sin conexión (cola con claves de idempotencia), pasarela Wompi con verificación de firma, endurecimiento de seguridad, despliegue |

## Definición de terminado (aplica a cada pantalla)

- `typecheck`, `lint` y pruebas unitarias en verde.
- Pruebas Playwright en 1280, 1024 y 390 sin desbordamiento horizontal ni texto partido en botones, chips y cifras.
- Diferencia visual con la captura de Stitch dentro de la tolerancia, o explicada por una corrección intencional del contrato.
- Menú y barra superior idénticos a los del `AppShell`; ítem activo correcto (ver `SCREEN-MAP.md`).
- Estados cubiertos: cargando, vacío, error, sin conexión y sin permisos.
- Accesibilidad revisada con axe (sin errores críticos).
- `docs/PROGRESS.md` actualizado.

## Reglas de negocio y de arquitectura

### Multi-tenant y permisos
- `tenant_id` en todas las tablas y Row Level Security en PostgreSQL. Cada solicitud resuelve tenant, sede y usuario.
- Permisos por rol y por acción (ver, crear, editar, anular, aprobar). Roles base: Administrador, Cajero, Mesero, Cocinero, Domiciliario.
- Auditoría de: anulaciones, descuentos, cambios de precio, cierres y arqueos de caja, cambios de permisos y reimpresiones.

### Pedidos y mesas
- Estados de pedido: `nuevo` → `en_preparacion` → `listo` → (`en_camino` si es domicilio) → `entregado`; `anulado` desde cualquier estado previo a `entregado`, con motivo obligatorio.
- Cada línea del pedido pertenece a una estación (sushi, caliente, bebidas); el pedido genera un ticket por estación.
- Estados de mesa: `libre`, `ocupada`, `pidio_cuenta`, `reservada`, `por_limpiar`. Mover, unir y transferir mantienen el historial.
- Los IDs de pedido y de línea se generan en el cliente (UUID v7) para permitir trabajar sin conexión.

### Cocina y tiempo real
- Socket.IO con salas por restaurante, sede y estación. Eventos mínimos: `ticket.created`, `ticket.updated`, `ticket.dispatched`, `ticket.returned`, `stock.out_of_stock`, `orders.paused`, `orders.resumed`.
- Los cronómetros se calculan a partir de marcas de tiempo del servidor, no de contadores locales.
- Pausar pedidos detiene la recepción desde salón, domicilios y plataformas, con motivo opcional y aviso visible.

### Caja y pagos
- Cobro con pagos mixtos (efectivo, tarjeta, Nequi, Daviplata, QR, link de pago). Propina sugerida del 10%, editable o eliminable. INC del 8% desglosado.
- Cierre de caja: esperado vs. contado por denominación, diferencia resaltada, reporte imprimible.
- Toda operación de dinero usa clave de idempotencia.

### Facturación electrónica DIAN
- Interfaz `InvoicingProvider` con operaciones: emitir factura, consultar estado, emitir nota crédito, reintentar. Adaptadores: simulado (primero), luego MATIAS, Nextpyme, Factus o Facturalatam.
- Se guardan: CUFE, número, prefijo, resolución (rango, vigencia, consecutivo), XML y PDF, y el motivo de rechazo.
- Alerta cuando la numeración esté próxima a agotarse o a vencer. Las credenciales de cada tenant se guardan cifradas.

### Inventario y recetas
- El menú se vincula con insumos mediante recetas; cada venta descuenta inventario. Mermas y ajustes con motivo obligatorio.
- Alertas de stock bajo hacia el panel, las notificaciones y las compras sugeridas.
- Marcar un insumo como agotado deshabilita los productos que lo usan, con confirmación.

### WhatsApp
- WhatsApp Cloud API: webhook con verificación de firma, plantillas aprobadas y ventana de 24 horas. Estado de conversación (bot o humano) con botón "Tomar control".
- El bot detecta pedidos y los deja como "Pedido detectado" para confirmar o editar; nunca confirma pagos por sí mismo.
- Registro del consentimiento de contacto de cada cliente (Ley 1581).

### Pagos en línea
- Wompi (u otra pasarela) con verificación de firma de eventos, estado conciliado con el pedido y reintentos idempotentes.

### Modo sin conexión (PWA)
- Cola de acciones en IndexedDB (Dexie) con claves de idempotencia; sincronización automática al volver la conexión y resolución de conflictos (el servidor decide el estado final).
- Banner "Sin conexión: tus pedidos se sincronizarán al volver" con la lista de acciones pendientes.

### Impresión
- El navegador no puede enviar comandos ESC/POS directos. Define una interfaz `PrintService` con implementación por agente local o por impresora de red desde el backend. No dependas de `window.print()` para comandas ni tickets de caja.
- Impresoras configurables por estación (cocina, barra, caja), con impresión de prueba.

### Seguridad
- Secretos solo en variables de entorno. Sin llaves en el repositorio ni en los registros.
- Webhooks con firma verificada, límites de peticiones y validación de todas las entradas con Zod.
- Copias de seguridad automáticas y restauración probada.
