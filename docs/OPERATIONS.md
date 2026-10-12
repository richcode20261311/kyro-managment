# Operaciones — AKI Admin

Runbook operativo mínimo. Nada de lo que sigue se ejecuta en producción sin autorización
explícita; los despliegues reales pasan por §17 de `docs/MIGRATION-MULTITENANT.md`.

## Limitación de intentos de autenticación

- **Configuración por entorno**: `RATE_LIMIT_<CLAVE>_{MAX,WINDOW,BLOCK}` (ventana y bloqueo en
  formato `5m`, `15m`, `1h`). Claves: `LOGIN_IP`, `LOGIN_ACCT`, `PIN_IP`, `PIN_USER`,
  `RECOVERY_IP`, `RECOVERY_ACCT`, `VERIFY_IP`, `VERIFY_ACCT`, `SELECT_IP`. Los valores por
  defecto (los de producción) están documentados en `.env.example`; ningún valor está fijo en
  el código.
- **Semántica**: ventana deslizante. La petición en la que se alcanza el máximo recibe su
  respuesta real y el bloqueo lo aplica el `check` de la petición siguiente; el bloqueo es
  **temporal** (siempre expira) y un acierto borra el contador de la cuenta (no el de IP).
  El429 lleva solo `Retry-After` con los segundos restantes y el mensaje genérico
  `Demasiados intentos. Intenta de nuevo en unos minutos.`
- **Claves**: IP del socket (`req.ip` de Express; las cabeceras del cliente como
  `X-Forwarded-For` se ignoran salvo que se configure `trust proxy`) e identidad cruda
  (correo o userId), de modo que una cuenta inexistente acumula igual que una existente.
- **Almacén**: `InMemoryRateLimitStore`, tras la interfaz `RateLimitStore`. Limitaciones: los
  contadores se pierden al reiniciar el proceso y no se comparten entre instancias. Con varias
  instancias o cuando se necesite persistencia, implementar un `RateLimitStore` sobre Redis —
  el servicio de autenticación no cambia; el punto de inyección (token `@Inject`) está
  anotado en `apps/api/src/common/rate-limit.ts`.

## Verificación de autenticación (batería HTTP)

- La batería de regresión A1/A2/A3 + multi-tenant + refresh corre contra una instancia
  **aislada** del API sobre `aki_admin_clone` (nunca contra la BD real ni contra el servidor
  dev de :3001). Está **versionada** en `apps/api/test/security/` (`battery.sh`,
  `launch-clone-api.js`, `clone.env.example` y `README.md` con requisitos, variables de
  entorno, aislamiento y pasos; también `pnpm run test:security` desde `apps/api`).
- **Puertas de seguridad antes de la primera petición HTTP** (el script aborta con código 90):
  (1) fichero de entorno sin claves duplicadas, ambas URL terminando exactamente en
  `/aki_admin_clone` y `PORT=3002`; (2) sonda TCP con las credenciales de cada URL que exige
  `current_database()=aki_admin_clone` con su `oid` **en el servidor** (el nombre escrito en
  el fichero no basta por sí solo: se valida la configuración efectiva por el mismo canal
  que usará la app); (3) `oid` del clon y de la BD real distintos con el fixture intacto.
  Además, cada arranque debe emitir la línea de evidencia de BD efectiva y al final se
  re-leen los `oid`. Las limitaciones de esta validación están documentadas en el README de
  `apps/api/test/security/` (p. ej. no puede probar por sí sola que un cambio futuro del
  código ignore el entorno forzado: eso lo cubren la evidencia en **cada** arranque, el
  chequeo de integridad final y el propio flujo P0, que cambia contraseñas en el clon y las
  verifica por HTTP).
- Identidad distinta por escenario, limpieza de tokens de recuperación sin usar en el clon
  por escenario, e reinicio del proceso por escenario para aislar los contadores de prueba.
- **Invariantes que debe mantener en verde**: todo429 con `Retry-After` numérico y mensaje
  genérico; bloqueos temporales que expiran sin invalidar códigos vigentes; ni códigos, ni
  contraseñas, ni tokens en los logs; buzón de desarrollo en modo600; la BD real sin escrituras
  (`RecoveryToken` antes==después); `:3001` sin tocar.
- **Límites de prueba del entorno** (no son los de producción): valores bajos y bloqueos de
  10 s para observable en minutos; quedan en el entorno de la instancia de pruebas, no en el
  código. Los ajustes del harness son solo de aislamiento (identidades, limpieza, reinicios);
  ningún control de seguridad se reduce para la batería.
- El entorno real (`clone.env`, con credenciales locales y secretos JWT), el build aislado
  y los artefactos de cada corrida viven en `$AKI_BATTERY_DIR` (por defecto
  `/tmp/aki-security-battery`), **fuera** del repositorio: aquí solo se versiona la plantilla
  `clone.env.example`. Sus invariantes también viven en `docs/MIGRATION-MULTITENANT.md` §18.4.

## Hallazgos del entorno local (documentados, sin actuar)

- **Redis — cómo se publica hoy**: `docker-compose.yml` define `ports: "6379:6379"`, que al
  arrancar el contenedor **binda a todas las interfaces del host** (`0.0.0.0:6379`): no está
  protegido por el hecho de estar en Docker. Estado verificado en la última revisión: el
  contenedor `aki-redis` está **detenido** y no hay listener en 6379. **Ningún servicio
  necesita acceso a Redis ahora mismo**: el API no lo usa (el limitador es en memoria y no hay
  colas BullMQ activas) ni ningún otro proceso del monorepo.
- **Configuración mínima segura propuesta** (solo propuesta: no se modifica ni se reinicia
  nada; requiere decisión humana): publicar en loopback (`127.0.0.1:6379:6379`) o en red
  privada; cuando se empiece a usar, exigir autenticación con el secreto **fuera del repo**
  (interpolación `${REDIS_PASSWORD:?…}` del compose desde un `.env` no versionado, o ACL de
  usuario por aplicación). Nunca un `requirepass` por defecto dentro del repositorio. La
  exposición la decide el `ports` del compose, no el backend Docker.
- El arranque de la API (`nest start`) **no** ejecuta migraciones: los deploys reales deben
  seguir la secuencia de §17 (`prisma migrate deploy` con ventana, nunca en el proceso dev).
- Varias instancias dev del API pueden coexistir en :3001/:3002 según la sesión que las haya
  lanzado; la batería solo opera sobre :3002 y verifica la BD efectiva antes de cada HTTP.

## Datos del VPS que debe confirmar el operador

Este entorno **no** tiene acceso ni evidencias del VPS: nada de lo siguiente está verificado
y todo es prerequisito antes de cualquier despliegue:

- Existencia y rol del VPS: sistema operativo, quién tiene acceso y cómo, dónde viven los
  secretos de producción (JWT, SMTP/DIAN/WhatsApp/Wompi).
- Exposición de red: firewalls (ufw/iptables/proveedor nube) y puertos públicos reales
  (¿5432?, ¿6379?, ¿3000?), terminación TLS y proxy inverso, redes privadas entre servicios.
- Redis en el VPS (si existe): interface de escucha, autenticación/ACL, versión y quién lo
  consume; no asumir seguridad por estar contenedorizado.
- PostgreSQL en el VPS: accesible solo por red privada, rotación de credenciales, política y
  **pruebas de restauración** de backups (la copia local `~/.aki-backups/*.dump` es local y
  no cubre el VPS).
- Runbook de despliegue: quién ejecuta §17, con qué autorización explícita, registro de
  versiones desplegadas, monitorización y alertas.

Toda decisión que afecte a esto requiere autorización humana explícita.
