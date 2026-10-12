# Registro de negocios (onboarding SaaS)

Especificación del formulario público con el que un restaurante o comercio de comidas se registra solo en la plataforma. Complementa la sección "Cuentas, registro y acceso" de `AGENTS.md`.

## 1. Principios

1. **Registro corto, perfil completo progresivo.** Pedir todo de golpe hace que la gente abandone. Se separa en tres niveles:
   - **Nivel 1: para crear la cuenta** (obligatorio, unos 3 minutos): dueño, negocio, marca y primera sede.
   - **Nivel 2: para operar** (se completa al empezar a usar el sistema): impuestos, propina, canales, impresoras.
   - **Nivel 3: para facturar a la DIAN** (obligatorio solo al activar facturación electrónica): datos fiscales y RUT.
2. **Minimización de datos (Ley 1581 de 2012).** Solo se pide lo que tiene un uso concreto. Cada campo tiene un motivo documentado.
3. **Verificar sin exponer.** Nunca se confirma ni se niega que un NIT o correo ya exista con mensajes distintos que permitan enumerarlos.
4. **Aislamiento total.** Cada registro crea un tenant nuevo; el formulario nunca permite unirse a un negocio existente (los empleados entran solo por invitación).
5. **Completitud visible.** El perfil del negocio muestra un porcentaje de avance y qué falta para poder facturar.

## 2. Estados

| Entidad | Estados |
|---|---|
| Negocio (tenant) | `pendiente_correo`, `pendiente_aprobacion` (si el interruptor de aprobación manual está activo), `prueba`, `activo`, `suspendido`, `cancelado` |
| Verificación fiscal | `sin_datos`, `en_revision`, `verificado`, `rechazado` (con motivo) |
| Documentos | `subido`, `en_revision`, `aprobado`, `rechazado` |

## 3. Campos por paso

Convenciones: **Req.** = obligatorio en el registro; **Fact.** = obligatorio para activar la facturación electrónica; "Opc." = opcional.

### Paso 1: Cuenta del dueño (O1)

| Campo | Tipo | Req. | Validación | Para qué |
|---|---|---|---|---|
| Nombre completo | Texto | Sí | 2 a 80 caracteres | Identidad del administrador |
| Correo electrónico | Correo | Sí | Formato válido; bloquear correos desechables | Acceso y verificación |
| Celular | Teléfono | Sí | 10 dígitos que empiezan por 3 | Alertas y recuperación; WhatsApp |
| Contraseña | Contraseña | Sí | Mínimo 10 caracteres, indicador de fortaleza | Acceso |
| Confirmar contraseña | Contraseña | Sí | Igual a la anterior | Evitar errores |
| Prueba anti-robots | CAPTCHA | Sí | Resuelto | Anti-abuso |

Después: verificación del correo (O2) con enlace de un solo uso y vigencia limitada, con reenvío (cuenta regresiva de 60 s).

### Paso 2: Tu negocio y tu marca (O3)

| Campo | Tipo | Req. | Validación | Para qué |
|---|---|---|---|---|
| Nombre comercial | Texto | Sí | 2 a 60 caracteres | Se muestra en el sistema, tickets y facturas |
| Razón social | Texto | Fact. | Hasta 120 caracteres | Factura electrónica |
| Tipo de persona | Opción | Sí | Natural o Jurídica | Define los datos fiscales |
| NIT | Número | Sí | 6 a 10 dígitos, sin puntos ni guiones | Identificación fiscal y unicidad del negocio |
| Dígito de verificación (DV) | Número | Sí | Calculado automáticamente, solo lectura | Validar el NIT |
| Tipo de negocio | Lista | Sí | Restaurante, Cafetería, Comidas rápidas, Panadería y pastelería, Cocina oculta (dark kitchen), Bar, Catering, Otro | Plantilla de menú, estaciones y módulos |
| ¿Tiene marca registrada ante la SIC? | Interruptor | Opc. | Si es sí: nombre de la marca y número de certificado | Dato de marca para documentos y soporte |
| Sitio web / redes | URL | Opc. | URL válida | Se usa en comprobantes y reservas públicas |
| Logo | Archivo | Opc. (recomendado) | PNG, JPG o SVG; hasta 2 MB; mínimo 512x512; fondo transparente recomendado | Menú lateral, login, tickets y facturas |
| Color de acento | Selector | Opc. | Debe cumplir contraste AA con blanco; por defecto rojo de marca | Personalización de la interfaz |

Cálculo del DV del NIT (módulo 11): con los dígitos del NIT de derecha a izquierda se multiplican por los pesos `3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71`; se suman los productos y se calcula el residuo de dividir entre 11. Si el residuo es 0 o 1, el DV es ese residuo; de lo contrario, el DV es `11 - residuo`.

### Paso 3: Primera sede y operación (O4)

| Campo | Tipo | Req. | Validación | Para qué |
|---|---|---|---|---|
| Nombre de la sede | Texto | Sí | 2 a 60 caracteres | Identificar la sede |
| Departamento | Lista con búsqueda | Sí | Catálogo DANE | Ubicación y facturación |
| Municipio | Lista con búsqueda | Sí | Catálogo DANE (código) | Ubicación y facturación |
| Dirección | Texto | Sí | Hasta 120 caracteres | Domicilios, facturas y reservas |
| Barrio o vereda | Texto | Opc. | Hasta 60 caracteres | Domicilios |
| Teléfono de la sede | Teléfono | Opc. | 10 dígitos (celular) o fijo con indicativo | Contacto con clientes |
| Horario de atención | Por día | Sí | Apertura y cierre por día, "Cerrado" | Reservas, bot de WhatsApp y turnos |
| Servicios que ofrece | Casillas | Sí | Salón, Para llevar, Domicilios | Activa módulos |
| Número aproximado de mesas | Número | Opc. | 0 a 200 | Plano inicial de mesas |
| Empleados aproximados | Rango | Opc. | 1-5, 6-15, 16-40, 40+ | Dimensionar el plan |
| Pedidos aproximados por día | Rango | Opc. | 0-30, 31-100, 101-300, 300+ | Dimensionar el plan |
| Software actual | Lista | Opc. | Fudo, Otro, Ninguno | Migración de datos |

La zona horaria es fija (`America/Bogota`) y no se pregunta.

### Paso 4: Datos fiscales (O5), se puede omitir y completar después

| Campo | Tipo | Fact. | Validación | Para qué |
|---|---|---|---|---|
| Régimen | Opción | Sí | Responsable de IVA, No responsable de IVA, Régimen simple de tributación | Cálculo de impuestos |
| Responsabilidades fiscales (RUT) | Casillas | Sí | Según catálogo DIAN | Factura electrónica |
| Actividad económica (CIIU) | Lista | Sí | Por ejemplo 5611, 5612, 5613, 5619, 5621, 5630, 1081 (confirmar con el contador) | Clasificación fiscal |
| ¿Es responsable del Impuesto Nacional al Consumo? | Interruptor | Sí | Por defecto sí, con tarifa 8% | Impuesto en la cuenta |
| Dirección fiscal | Texto | Sí | Igual a la de la sede (casilla "usar la misma") | Factura |
| Correo para facturación electrónica | Correo | Sí | Formato válido | Envío y notificaciones DIAN |
| Representante legal: nombre | Texto | Sí | 2 a 80 caracteres | Contrato y facturación |
| Representante legal: tipo y número de documento | Lista y número | Sí | CC, CE, Pasaporte, NIT | Contrato y facturación |
| Matrícula mercantil | Texto | Opc. | Hasta 20 caracteres | Verificación del negocio |
| Subir RUT (PDF) | Archivo | Sí | PDF, hasta 5 MB | Verificar que el negocio existe |
| Resolución de facturación DIAN | Número, fecha, prefijo, rango y vigencia | Sí | Rango inicial menor al final; vigencia futura | Numeración de facturas |
| Proveedor de facturación electrónica | Lista | Sí | Los adaptadores disponibles | Emisión de facturas |

### Paso 5: Plan y términos (O6)

| Campo | Tipo | Req. | Validación | Para qué |
|---|---|---|---|---|
| Plan | Selección | Sí | Prueba de 14 días con límites (una sede y 5 usuarios) | Facturación del servicio |
| Aceptación de los términos del servicio | Casilla | Sí | Se guarda versión, fecha, IP y usuario | Contrato |
| Aceptación de la política de privacidad | Casilla | Sí | Igual | Ley 1581 |
| Acuerdo de tratamiento de datos | Casilla | Sí | Igual (la plataforma es encargada, el negocio responsable) | Ley 1581 |
| Comunicaciones comerciales | Casilla | Opc. | Sin marcar por defecto | Consentimiento de marketing |

Después: revisión (O7) con resumen editable por secciones y envío. Luego, confirmación y estado "pendiente de aprobación" (O8).

### Nivel 2: se pide dentro de la aplicación (no en el registro)

Propina sugerida (10% por defecto, editable o eliminable), canales de venta (WhatsApp, Rappi y otros), impresoras por estación, medios de pago aceptados y datos de la pasarela de pago.

## 4. Archivos subidos

- Logo y RUT en almacenamiento privado, con URLs firmadas y de corta duración. El logo se sirve con caché; el RUT nunca es público.
- Validar el tipo real del archivo (no solo la extensión), el tamaño y escanear contra malware. Generar versiones del logo (círculo de 56 px, 180 px y 512 px).
- El logo se previsualiza sobre fondo blanco y sobre fondo oscuro para ver si es transparente; si el logo es de baja resolución o cuadrado mal recortado, se avisa.

## 5. Antiabuso y verificación del negocio

- Verificación de correo, bloqueo de correos desechables, CAPTCHA, límite de registros por IP y dispositivo.
- Si el NIT ya está registrado: mensaje genérico ("Ya existe una cuenta con estos datos. Contacta al administrador de tu negocio o a soporte"), sin decir quién la creó.
- Interruptor de aprobación manual: el superadministrador revisa nombre, NIT y, si existe, el RUT antes de pasar el negocio de `pendiente_aprobacion` a `prueba`.
- Verificación fiscal separada: el negocio puede operar en prueba sin ella, pero no puede emitir facturas electrónicas reales hasta quedar `verificado`.
- Los consentimientos se guardan con fecha, versión del documento, IP y usuario; no se pueden editar, solo se agregan nuevos registros.

## 6. Modelo de datos sugerido

| Tabla | Contenido |
|---|---|
| `tenants` | id, nombre comercial, razón social, NIT, DV, tipo de persona, tipo de negocio, estado, plan, fecha de fin de prueba |
| `tenant_branding` | tenant, logo (referencia), color de acento, sitio web, redes, marca registrada (sí/no, nombre, número) |
| `tenant_fiscal_profiles` | tenant, régimen, responsabilidades, CIIU, INC, dirección fiscal, correo de facturación, representante legal, matrícula mercantil, estado de verificación |
| `tenant_documents` | tenant, tipo (RUT, otros), archivo, estado, revisor y motivo de rechazo |
| `invoicing_resolutions` | tenant, número, fecha, prefijo, rango inicial y final, vigencia, ambiente |
| `branches` | tenant, nombre, dirección, municipio y departamento (códigos DANE), teléfono, horario, servicios |
| `users` y `memberships` | usuario global y su rol por negocio |
| `consent_records` | usuario, documento, versión, fecha, IP |
| `onboarding_progress` | tenant, pasos completados, porcentaje, campos pendientes por nivel |

## 7. Pantallas del flujo

| Código | Pantalla | Ruta | Shell |
|---|---|---|---|
| O1 | Registro: cuenta del dueño | `/registro` | No |
| O2 | Verificación de correo | `/registro/verificar` | No |
| O3 | Tu negocio y tu marca | `/registro/negocio` | No |
| O4 | Primera sede y operación | `/registro/sede` | No |
| O5 | Datos fiscales (omitible) | `/registro/fiscal` | No |
| O6 | Plan y términos | `/registro/plan` | No |
| O7 | Revisión y envío | `/registro/revision` | No |
| O8 | Pendiente de aprobación y bienvenida | `/registro/listo` | No |
| O9 | Perfil del negocio y completitud | `/configuracion/restaurante` (ampliación de S1) | Sí (Configuración) |

El avance se guarda automáticamente por paso, así que quien cierra la pestaña puede continuar después con su sesión verificada.
