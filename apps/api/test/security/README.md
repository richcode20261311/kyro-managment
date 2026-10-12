# Batería de seguridad de autenticación (A1–A3)

Batería HTTP de verificación para el endurecimiento de autenticación: rate
limiting (A1 login, A2 PIN, A3 recuperación), selección multi-tenant, rotación
de refresh y higiene de logs. Ejecuta ~36 comprobaciones contra una instancia
de pruebas real en `:3002` conectada **exclusivamente** a `aki_admin_clone`.
El código del limitador y del filtro es el de producción; solo el entorno
(límites bajos, buzón simulado) es de pruebas.

Archivos:

| Archivo | Función |
|---|---|
| `battery.sh` | La batería (preflight + comprobaciones + integridad final) |
| `launch-clone-api.js` | Lanzador que fuerza el entorno del clon y emite la línea de evidencia de BD |
| `clone.env.example` | Plantilla del entorno real (este es el único que está en el repo) |

## Requisitos

- Linux con `bash` ≥4, `curl`, `jq`, `grep/sed/awk`, `ss` (iproute2), `docker`.
- Contenedor PostgreSQL en marcha: `docker start aki-postgres` (imagen PG16 con
  las bases `aki_admin` y `aki_admin_clone` y los usuarios `aki`/`aki_app`).
- Node 22+ y `pnpm` con el workspace instalado (`pnpm install` en la raíz).
- Bases `aki_admin` (real, solo se LEE su conteo) y `aki_admin_clone` poblada
  con el fixture (6 usuarios, `admin@aki.co` en 2 tenants, PIN del mesero).
- Puerto `:3002` libre. `:3001` no debe usarse: la batería comprueba que queda
  intacto.

## Variables de entorno

| Variable | Por defecto | Significado |
|---|---|---|
| `AKI_BATTERY_DIR` | `/tmp/aki-security-battery` | Directorio de trabajo (entorno, dist, logs, artefactos) |
| `AKI_BATTERY_ENV` | `$AKI_BATTERY_DIR/clone.env` | Entorno real de la instancia (con credenciales; **fuera del repo**) |
| `AKI_BATTERY_DIST` | `$AKI_BATTERY_DIR/api-dist` | Build aislado de `apps/api` (no toca `dist/` del workspace) |
| `AKI_PG_CONTAINER` | `aki-postgres` | Contenedor de PostgreSQL para las consultas de preflight/integridad |

## Aislamiento de la base de datos

La batería solo escribe en `aki_admin_clone` (y en su buzón local). La BD real
`aki_admin` se toma **dos veces en solo lectura** (conteo de `RecoveryToken` y
`oid`): al inicio y al final; si cambia algo, el check de integridad falla.

Tres puertas abortan (`exit 90`) **antes de la primera petición HTTP** si la
configuración no demuestra el uso exclusivo del clon:

1. **Fichero de entorno**: sin claves duplicadas, ambas URL terminan exactamente
   en `/aki_admin_clone`, `PORT=3002`.
2. **Sonda TCP**: cada URL se usa tal cual (usuario, contraseña, host, puerto)
   contra el servidor y debe responder `current_database()` = `aki_admin_clone`
   con su `oid`. El nombre en el fichero **no basta** por sí solo: se valida la
   configuración efectiva resolviéndola por el mismo canal que usará la app.
3. **Identidad de bases**: el `oid` del clon y el de la BD real son distintos y
   el fixture del clon está intacto.

Además, **cada** reinicio de la instancia exige la línea de evidencia del
lanzador (`BD efectivas: DATABASE_URL=aki_admin_clone APP_DATABASE_URL=aki_admin_clone PORT=3002`)
impresa desde dentro del proceso con el entorno ya forzado; sin esa línea la
batería se detiene. Al final, los `oid` se vuelven a leer para confirmar que
siguen siendo los mismos.

## Pasos de ejecución

```bash
# 1) PostgreSQL en marcha
docker start aki-postgres

# 2) Entorno real fuera del repo (nunca imprimas las credenciales)
export AKI_BATTERY_DIR=/tmp/aki-security-battery
mkdir -p "$AKI_BATTERY_DIR" && umask 077
cp apps/api/test/security/clone.env.example "$AKI_BATTERY_DIR/clone.env"
#    Edita clone.env: rellena DATABASE_URL y APP_DATABASE_URL con las
#    credenciales locales de apps/api/.env (usuarios aki/aki_app, base
#    aki_admin_clone) y dos secretos JWT: openssl rand -hex 32

# 3) Build aislado de la API (no usa ni toca dist/ del workspace)
cd apps/api
pnpm exec tsc -p tsconfig.build.json --outDir "$AKI_BATTERY_DIR/api-dist"
cd ../..

# 4) Ejecutar (desde cualquier lugar; las rutas son relativas al script)
bash apps/api/test/security/battery.sh
#    o desde apps/api: pnpm run test:security
```

La batería deja la instancia `:3002` corriendo al terminar. Para detenerla:

```bash
kill $(ss -ltnpH 'sport = :3002' | grep -oP 'pid=\K[0-9]+') 2>/dev/null
```

`TOTAL: PASS=n FAIL=0` es el resultado esperado. Los artefactos por
comprobación (cuerpos, cabeceras, log, buzón) quedan en `$AKI_BATTERY_DIR/`
(nunca en el repo; contienen datos de prueba, no los subas).

## Qué verifica (agrupado)

- **A1 login**: límites reales por cuenta y por IP (429 + `Retry-After`
  numérico, jamás permanente), 401 idéntico para existente/inexistente sin
  `Retry-After`, cuenta inexistente limitada igual, `X-Forwarded-For` forjado
  **no** elude la IP del socket.
- **A2 PIN**: 401 genérico bajo el límite, bloqueo por fallo con expiración
  temporal.
- **A3 recuperación**: cooldown sin reenvío, código incorrecto/vencido/ajeno/
  consumido no verifica ni resetea ni daña al vigente, presupuestos por IP y
  por cuenta, respuestas públicas idénticas (no revelan existencia de cuentas),
  concurrencia con **exactamente un** reset ganador, ciclo completo con cambio
  de contraseña verificado por login.
- **Multi-tenant**: reto de selección sin sesión para correo compartido, select
  correcto con cookie, tenant fuera de listado/token alterado/token de selección
  como refresh → 401 sin sesión, límite de select activo, login directo con un
  solo tenant.
- **Refresh**: rotación y rechazo del token viejo por revocación (no por
  límite).
- **Higiene**: ningún código de recuperación en el log, ningún
  `retry-after=undefined` (regresión del filtro), buzón en modo 600.
- **Integridad**: BD real sin escrituras, `oid` estables, `:3001` intacto.

## Limitaciones documentadas

- La puerta demuestra que la **configuración efectiva** del proceso (entorno
  forzado + línea de evidencia) apunta a la base `aki_admin_clone` y que esas
  URL resuelven en el servidor a esa base con ese `oid`. No puede demostrar por
  sí sola que un cambio futuro del código no llegue a ignorar ese entorno (p.
  ej. una URL fijada en código): para eso está la línea de evidencia en **cada**
  reinicio y el chequeo de integridad final; si la app dejara de leer
  `APP_DATABASE_URL` del proceso, la evidencia de arranque seguiría correcta y
  el riesgo solo se cubriría con una prueba de escritura observable — hoy la
  cubre el propio flujo de la batería (el P0 cambia contraseñas y las verifica
  por HTTP contra el clon).
- Los contadores del limitador viven en memoria: el reinicio por escenario los
  limpia a propósito para aislar pruebas. Es un comportamiento de entorno de
  pruebas, no un debilitamiento: los límites de producción no se modifican.
- La sonda TCP parsea URLs `postgresql://user:pass@host:port/db`; una contraseña
  con caracteres URL-encoded rompería el parseo y la batería **abortaría**
  (falla cerrada, nunca falla abierta).
- No es una prueba E2E contra la BD real ni contra `:3001`: eso está fuera de
  alcance por política (ver `docs/OPERATIONS.md`).
