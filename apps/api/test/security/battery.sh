#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Batería HTTP de autenticación (A1/A2/A3 + multitenant + refresh) contra la
# instancia de pruebas :3002, conectada SIEMPRE a aki_admin_clone.
#
# Aislamiento entre escenarios (sin desactivar ni reducir ningún control):
#   · identidad distinta por escenario (admin/cajero/cocinero/mesero/domiciliario)
#   · reinicio del proceso en memoria por escenario (limpia los contadores de
#     prueba; los límites de producción no se tocan)
#   · DELETE de tokens de recuperación sin usar en el CLON por usuario/escenario
#   · P0 "pizarra limpia": los dos admin del clon quedan con hash inválido y UN
#     solo ciclo A3 fija la contraseña semilla → determinismo con email
#     compartido entre tenants (admin@aki.co existe en 2 tenants en el clon)
#
# Los límites se configuran por entorno (clone.env) con los valores documentados
# de esta batería; el código del limitador es el de producción.
#
# Puerta de seguridad (ANTES de cualquier HTTP): la configuración efectiva debe
# demostrar el uso exclusivo de aki_admin_clone — fichero sin duplicados, ambas
# URL terminando en /aki_admin_clone, y sonda TCP con las credenciales de cada
# URL que resuelve en el servidor a la base aki_admin_clone (nombre + oid). Si
# algo falla, el script aborta sin levantar la instancia. Ver README.md para
# requisitos, generación del entorno y limitaciones documentadas.
# ─────────────────────────────────────────────────────────────────────────────
set -u

# ── configuración (parametrizable; sin credenciales en este fichero) ─────────
SEC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK="${AKI_BATTERY_DIR:-/tmp/aki-security-battery}"
ENV_FILE="${AKI_BATTERY_ENV:-$WORK/clone.env}"
DIST="${AKI_BATTERY_DIST:-$WORK/api-dist}"
PGC="${AKI_PG_CONTAINER:-aki-postgres}"
ART="$WORK/art"                              # artefactos por check (json/cabeceras)
LOG="$WORK/api-clone-3002.log"
MAILBOX="$WORK/dev-mailbox.jsonl"
LAUNCHER="$SEC_DIR/launch-clone-api.js"

API=http://localhost:3002/api
DB_C=aki_admin_clone
DB_R=aki_admin

PASS=0; FAIL=0; CODIGOS=""

ok(){ PASS=$((PASS+1)); printf 'PASS  %s\n' "$1"; }
mal(){ FAIL=$((FAIL+1)); printf 'FAIL  %s\n' "$1"; }
# Uso: cuando "descripción" $? "detalle". El estado SIEMPRE se captura en rc=$?
# ANTES de construir descripciones con $(comandos): $? se pierde si no.
cuando(){ if [ "$2" = 0 ]; then ok "$1"; else mal "$1 $3"; fi }

ra(){ grep -i '^retry-after' "$1" 2>/dev/null | tr -d '\r' | awk '{print $2}'; }
# post <ruta> <body-json> [fichero-cuerpo] [fichero-cabeceras] → imprime HTTP
post(){ curl -s --max-time 15 -o "${3:-/dev/null}" ${4:+-D "$4"} -w '%{http_code}' \
  -X POST "$API$1" -H 'Content-Type: application/json' -d "$2"; }
# es_429 <http> <cabeceras> <cuerpo>:429 + Retry-After numérico + mensaje genérico
es_429(){ [ "$1" = 429 ] || return 1
  local v; v=$(ra "$2"); [[ "$v" =~ ^[0-9]+$ ]] || return 1
  grep -q 'Demasiados intentos' "$3" 2>/dev/null; }
# es_valido <http> <esperado> <cabeceras>: estado esperado Y sin Retry-After
es_valido(){ [ "$1" = "$2" ] && [ -z "$(ra "$3")" ]; }

ultimo_codigo(){ tail -n 1 "$MAILBOX" 2>/dev/null | jq -r '.text' 2>/dev/null | grep -oE '\b[0-9]{6}\b' | tail -n1; }
correos(){ if [ -f "$MAILBOX" ]; then wc -l < "$MAILBOX"; else echo 0; fi; }
guardar_codigo(){ if [ -n "${1:-}" ]; then CODIGOS="$CODIGOS $1"; fi; }
espera_bloqueo(){ sleep 11; }   # BLOCK=10s de las pruebas + margen

PSQL_C(){ docker exec "$PGC" psql -U aki -d "$DB_C" -tAc "$1" 2>/dev/null; }
PSQL_R(){ docker exec "$PGC" psql -U aki -d "$DB_R" -tAc "$1" 2>/dev/null; }
# Borra los tokens SIN USAR de todas las identidades del correo (un correo
# compartido entre tenants afecta a todas); así el cooldown no secuestra
# escenarios de la batería.
limpiar_tokens(){ PSQL_C "DELETE FROM \"RecoveryToken\" WHERE \"userId\" IN (SELECT id FROM \"User\" WHERE email='$1') AND \"usedAt\" IS NULL" >/dev/null; }

matar(){
  local p
  for p in $(ss -ltnpH 'sport = :3002' | grep -oP 'pid=\K[0-9]+'); do kill "$p" 2>/dev/null; done
  for _ in $(seq 1 10); do ss -ltnH 'sport = :3002' | grep -q . || return 0; sleep 1; done
  return 1
}
# Reinicio canónico: tras cada arranque exige la línea de evidencia de BD.
reiniciar(){
  matar
  echo "== reinicio $(date +%s) ==" >> "$LOG"
  AKI_BATTERY_ENV="$ENV_FILE" AKI_BATTERY_DIST="$DIST/main.js" \
    setsid nohup node "$LAUNCHER" >> "$LOG" 2>&1 < /dev/null &
  local c i
  for i in $(seq 1 40); do
    sleep 1
    c=$(curl -s --max-time 3 -o /dev/null -w '%{http_code}' -X POST "$API/auth/login" \
      -H 'Content-Type: application/json' -d '{}' 2>/dev/null || echo 000)
    [ "$c" = 400 ] && break
  done
  local desde; desde=$(grep -n '== reinicio ' "$LOG" | tail -1 | cut -d: -f1)
  sed -n "${desde},\$p" "$LOG" | grep -q 'BD efectivas: DATABASE_URL=aki_admin_clone APP_DATABASE_URL=aki_admin_clone PORT=3002' \
    || { echo "ABORTO: arranque sin evidencia de BD efectiva (clon)"; exit 90; }
}

# ── identidades del fixture (clon) ───────────────────────────────────────────
ADMIN=admin@aki.co; CAJA=cajero@aki.co; MESERO=mesero@aki.co
COCINA=cocinero@aki.co; DOMI=domiciliario@aki.co
P_ADMIN='Admin1234!'; P_CAJA='Cajero1234!'; P_MESERO='Mesero1234!'
P_COCINA='Cocina1234!'; P_DOMI='Domi1234!'
P_NUEVA='NuevaClave123'; P_GANADORA='Concurren123'; P_TEMP='Temporal1234!'
PIN_MESERO=3333
T_AKI=41c2a617-7115-4346-9c0a-b66d2164b7d1
T_FUERA=11111111-1111-4111-8111-111111111111
UUID_FANTASMA=00000000-0000-4000-8000-000000000000

abortar(){ echo "ABORTO: $1"; exit 90; }

echo "══════ preflight · entorno aislado verificado antes de cualquier HTTP ══════"
[ -f "$ENV_FILE" ] || abortar "falta el entorno de pruebas ($ENV_FILE; ver README.md)"
[ -f "$DIST/main.js" ] || abortar "falta el build de la API ($DIST/main.js; ver README.md)"
[ -f "$LAUNCHER" ] || abortar "falta el lanzador ($LAUNCHER)"
mkdir -p "$WORK" "$ART"

#1. Fichero de entorno entero: sin claves duplicadas, ambas URL = clon, puerto
#    de pruebas. (Un nombre de base en el fichero NO basta: va la sonda TCP #2.)
DUP=$(grep -vE '^[[:space:]]*(#|$)' "$ENV_FILE" | cut -d= -f1 | sort | uniq -d | tr '\n' ' ')
DBU=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | sed -E 's#.*/##' | grep -c '^aki_admin_clone$')
APU=$(grep -E '^APP_DATABASE_URL=' "$ENV_FILE" | sed -E 's#.*/##' | grep -c '^aki_admin_clone$')
PORTF=$(grep -E '^PORT=' "$ENV_FILE" | cut -d= -f2)
[ -z "$DUP" ] && [ "$DBU" = 1 ] && [ "$APU" = 1 ] && [ "$PORTF" = 3002 ]
rc=$?
cuando "ENV entero (sin duplicados), ambas URL terminan en /aki_admin_clone, PORT=3002" "$rc" "dup='$DUP' db=$DBU app=$APU port=$PORTF"
[ "$rc" = 0 ] || abortar "el fichero de entorno no demuestra el aislamiento"
#2. Sonda TCP con las credenciales de CADA URL efectiva: el servidor debe
#    responder como base aki_admin_clone (nombre + oid reales, no texto del
#    fichero). Falla cerrada: cualquier URL que no responda así aborta.
sonda(){ # $1=URL → "base|oid" por el mismo canal TCP que usará la app
  local url="$1" user pass host port db
  user=$(printf '%s' "$url" | sed -E 's#^postgresql://([^:/]+):.*#\1#')
  pass=$(printf '%s' "$url" | sed -E 's#^postgresql://[^:]+:([^@]+)@.*#\1#')
  host=$(printf '%s' "$url" | sed -E 's#.*@([^:/]+):([0-9]+)/.*#\1#')
  port=$(printf '%s' "$url" | sed -E 's#.*@([^:/]+):([0-9]+)/.*#\2#')
  db=$(printf '%s' "$url" | sed -E 's#.*/##')
  docker exec -e PGPASSWORD="$pass" "$PGC" psql -h "$host" -p "$port" -U "$user" -d "$db" \
    -tAc 'SELECT current_database() || (SELECT oid FROM pg_database WHERE datname=current_database())' 2>/dev/null
}
URL_DB=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)
URL_APP=$(grep -E '^APP_DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)
SONDA_DB=$(sonda "$URL_DB"); SONDA_APP=$(sonda "$URL_APP")
OID_C=$(printf '%s' "$SONDA_DB" | grep -oE '^aki_admin_clone[0-9]+$' | grep -oE '[0-9]+$')
[ -n "$OID_C" ] && [ "$SONDA_DB" = "aki_admin_clone$OID_C" ] && [ "$SONDA_APP" = "aki_admin_clone$OID_C" ]
rc=$?
cuando "Sonda TCP: ambas URL efectivas resuelven a aki_admin_clone (oid=$OID_C) con sus propias credenciales" "$rc" "db='$SONDA_DB' app='$SONDA_APP'"
[ "$rc" = 0 ] || abortar "las URLs efectivas no resuelven al clon por TCP"
#3. La BD real es OTRA base del mismo clúster (oid distinto) y el fixture del
#    clon está intacto (2 admin en 2 tenants, 6 usuarios, PIN del mesero).
OID_R=$(PSQL_R "SELECT oid FROM pg_database WHERE datname='$DB_R'")
NADM=$(PSQL_C "SELECT count(*) FROM \"User\" WHERE email='$ADMIN'")
NUSU=$(PSQL_C "SELECT count(*) FROM \"User\"")
NPIN=$(PSQL_C "SELECT count(*) FROM \"User\" WHERE email='$MESERO' AND pin IS NOT NULL")
[ -n "$OID_R" ] && [ "$OID_R" != "$OID_C" ] && [ "$NADM" = 2 ] && [ "$NUSU" = 6 ] && [ "$NPIN" = 1 ]
rc=$?
cuando "BD de pruebas: clon oid=$OID_C, real oid=$OID_R (distintos); fixture (2 admin en 2 tenants, 6 usuarios, PIN mesero presente)" "$rc" "adm=$NADM usu=$NUSU pin=$NPIN"
[ "$rc" = 0 ] || abortar "identidad del clon o fixture inesperados"
#4. Estado inicial de la BD real y de :3001 (solo lectura)
ANTES_R=$(PSQL_R 'SELECT count(*) FROM "RecoveryToken"')
ANTES3001=$(ss -ltnH 'sport = :3001' | grep -c .)
echo "   (BD real RecoveryToken filas antes: $ANTES_R · :3001 listeners antes: $ANTES3001)"
#5. Reinicio canónico con evidencia de BD efectiva + log nuevo para higiene
: > "$LOG"
reiniciar
ok "Instancia :3002 reiniciada con BD efectiva verificada (aki_admin_clone)"

echo "══════ P0 · pizarra limpia y contraseña semilla del admin ══════"
#6. Los dos admin del clon quedan con hash inválido; UN ciclo A3 fija la
#   contraseña semilla sobre exactamente uno de ellos (el otro no puede
#   autenticar) → determinismo pese al email compartido entre tenants.
reiniciar
PSQL_C "UPDATE \"User\" SET \"passwordHash\"='scrypt:0000:00' WHERE email='$ADMIN'" >/dev/null
limpiar_tokens "$ADMIN"
rm -f "$MAILBOX"
R=$(post /auth/recovery/request "$(printf '{"email":"%s"}' "$ADMIN")" "$ART/p0a.json")
CN=$(ultimo_codigo); guardar_codigo "$CN"
R2=$(post /auth/recovery/reset "$(printf '{"email":"%s","code":"%s","newPassword":"%s"}' "$ADMIN" "$CN" "$P_ADMIN")" "$ART/p0b.json")
R3=$(post /auth/login "$(printf '{"email":"%s","password":"%s"}' "$ADMIN" "$P_ADMIN")" "$ART/p0c.json" "$ART/p0ch.txt")
[ "$R" = 202 ] && [ "$R2" = 200 ] && [ "$R3" = 200 ] && jq -e '.accessToken' "$ART/p0c.json" >/dev/null 2>&1
rc=$?
cuando "P0 admin: pizarra limpia + un solo ciclo A3 → login200 con accessToken (req=$R reset=$R2 login=$R3)" "$rc" ""

echo "══════ A1 · login (cuentas aisladas por correo; IP compartida) ══════"
#7. Login correcto
reiniciar
R=$(post /auth/login "$(printf '{"email":"%s","password":"%s"}' "$ADMIN" "$P_ADMIN")" "$ART/l1.json" "$ART/l1h.txt")
[ "$R" = 200 ] && jq -e '.accessToken' "$ART/l1.json" >/dev/null 2>&1
rc=$?
cuando "A1 login correcto → 200 con accessToken" "$rc" "HTTP $R"
#8. Límite POR CUENTA real:3 fallos → bloqueo; el4º (correcto) →429 + RA
for i in 1 2 3; do
  post /auth/login "$(printf '{"email":"%s","password":"%s"}' "$ADMIN" "MalaClave999")" /dev/null >/dev/null
done
H=$(post /auth/login "$(printf '{"email":"%s","password":"%s"}' "$ADMIN" "$P_ADMIN")" "$ART/l4.json" "$ART/h4.txt")
es_429 "$H" "$ART/h4.txt" "$ART/l4.json"
rc=$?
cuando "A1 límite de cuenta real →429 con Retry-After=$(ra "$ART/h4.txt") numérico" "$rc" "HTTP $H"
#9. El bloqueo expira → nunca permanente
espera_bloqueo
L=$(post /auth/login "$(printf '{"email":"%s","password":"%s"}' "$ADMIN" "$P_ADMIN")" "$ART/l5.json")
[ "$L" = 200 ]
rc=$?
cuando "A1 el bloqueo expira → login correcto200 (jamás permanente)" "$rc" "HTTP $L"
#10.401 real (no429): existente vs inexistente idénticos y sin Retry-After.
# Con presupuesto de IP limpio: sin reinicio, los3 fallos del check anterior
# dejan la IP en3 eventos y el4º intento (E) la bloquearía (N→429 correcto).
reiniciar
E=$(post /auth/login "$(printf '{"email":"%s","password":"%s"}' "$ADMIN" "MalaClave999")" "$ART/e1.json" "$ART/eh.txt")
N=$(post /auth/login "$(printf '{"email":"%s","password":"%s"}' "fantasma@aki.co" "MalaClave999")" "$ART/n1.json" "$ART/nh.txt")
EB=$(cat "$ART/e1.json"); NB=$(cat "$ART/n1.json")
es_valido "$E" 401 "$ART/eh.txt" && es_valido "$N" 401 "$ART/nh.txt" && [ "$EB" = "$NB" ] && grep -q 'incorrectos' "$ART/e1.json"
rc=$?
cuando "A1401 real (no429) e idéntico: existente vs inexistente" "$rc" "E=$E N=$N"
#11. Cuenta inexistente limitada igual (anti-enumeración por límite).
# Con IP limpia el bloqueo lo dispara la clave DE CUENTA de la cuenta fantasma
# (el429 no distingue existente de inexistente).
reiniciar
for i in 1 2 3; do
  post /auth/login "$(printf '{"email":"%s","password":"%s"}' "fantasma@aki.co" "MalaClave999")" /dev/null >/dev/null
done
B=$(post /auth/login "$(printf '{"email":"%s","password":"%s"}' "fantasma@aki.co" "MalaClave999")" "$ART/e3.json" "$ART/bh.txt")
es_429 "$B" "$ART/bh.txt" "$ART/e3.json"
rc=$?
cuando "A1 cuenta inexistente limitada igual →429 con Retry-After=$(ra "$ART/bh.txt")" "$rc" "HTTP $B"
#12. X-Forwarded-For forjado NO elude la IP del socket: bloquear la IP del
#    socket con4 fallos de una cuenta y pedir con otra cuenta fresca + XFF
#    forjado → debe seguir entrando en429 (clave por IP real, no por header).
reiniciar
#4 cuentas distintas: la clave de IP cuenta cada intento aunque la de cuenta
# se bloquee antes; así la4ª petición marca el bloqueo POR IP.
for i in 1 2 3 4; do
  post /auth/login "$(printf '{"email":"%s","password":"%s"}' "xff-fantasma-$i@aki.co" "MalaClave999")" /dev/null >/dev/null
done
S=$(curl -s --max-time 15 -o "$ART/x1.json" -D "$ART/xh.txt" -w '%{http_code}' \
  -X POST "$API/auth/login" -H 'Content-Type: application/json' -H 'X-Forwarded-For: 203.0.113.7' \
  -d "$(printf '{"email":"%s","password":"%s"}' "xff-fantasma-5@aki.co" "MalaClave999")")
es_429 "$S" "$ART/xh.txt" "$ART/x1.json"
rc=$?
cuando "A1 X-Forwarded-For forjado NO elude la IP del socket (bloqueo por IP + cuenta fresca + XFF →429, RA=$(ra "$ART/xh.txt"))" "$rc" "HTTP $S"

echo "══════ A2 · PIN ══════"
#13. userId inexistente →401 genérico bajo el límite (sin Retry-After)
UIDF=$UUID_FANTASMA
G=$(post /auth/pin-login "$(printf '{"userId":"%s","pin":"9999"}' "$UIDF")" "$ART/g1.json" "$ART/gh.txt")
es_valido "$G" 401 "$ART/gh.txt"
rc=$?
cuando "A2 userId inexistente → 401 genérico bajo el límite (sin Retry-After)" "$rc" "HTTP $G"
#14.3 fallos de PIN → bloqueo; el correcto también recibe429
reiniciar
UID_M=$(PSQL_C "SELECT id FROM \"User\" WHERE email='$MESERO' AND \"tenantId\"='$T_AKI'")
for i in 1 2 3; do
  post /auth/pin-login "$(printf '{"userId":"%s","pin":"0000"}' "$UID_M")" /dev/null >/dev/null
done
P=$(post /auth/pin-login "$(printf '{"userId":"%s","pin":"%s"}' "$UID_M" "$PIN_MESERO")" "$ART/p4.json" "$ART/ph.txt")
es_429 "$P" "$ART/ph.txt" "$ART/p4.json"
rc=$?
cuando "A2 bloqueo por PIN fallido →429 con Retry-After=$(ra "$ART/ph.txt") (el correcto también)" "$rc" "HTTP $P"
#15. Bloqueo temporal: tras expirar, el PIN correcto entra
espera_bloqueo
PC=$(post /auth/pin-login "$(printf '{"userId":"%s","pin":"%s"}' "$UID_M" "$PIN_MESERO")" "$ART/pc.json")
[ "$PC" = 200 ] && jq -e '.accessToken' "$ART/pc.json" >/dev/null 2>&1
rc=$?
cuando "A2 PIN correcto tras expirar → 200 (bloqueo temporal)" "$rc" "HTTP $PC"

echo "══════ A3 · recuperación (identidad distinta por escenario) ══════"
#16. Cooldown + código incorrecto no daña al vigente (cocinero:1 solo tenant)
reiniciar; limpiar_tokens "$COCINA"; rm -f "$MAILBOX"
Q1=$(post /auth/recovery/request "$(printf '{"email":"%s"}' "$COCINA")" "$ART/q1.json")
C1=$(ultimo_codigo); guardar_codigo "$C1"; N1=$(correos)
Q2=$(post /auth/recovery/request "$(printf '{"email":"%s"}' "$COCINA")" "$ART/q2.json")
N2=$(correos); B1=$(cat "$ART/q1.json"); B2=$(cat "$ART/q2.json")
I=$(post /auth/recovery/verify "$(printf '{"email":"%s","code":"000000"}' "$COCINA")" "$ART/i1.json" "$ART/ih.txt")
V=$(post /auth/recovery/verify "$(printf '{"email":"%s","code":"%s"}' "$COCINA" "$C1")" "$ART/v1.json")
[ "$Q1" = 202 ] && [ "$Q2" = 202 ] && [ "$N1" = 1 ] && [ "$N2" = 1 ] && [ "$B1" = "$B2" ] && \
  echo "$C1" | grep -qE '^[0-9]{6}$' && es_valido "$I" 400 "$ART/ih.txt" && \
  grep -q 'Código inválido o expirado' "$ART/i1.json" && [ "$V" = 200 ]
rc=$?
cuando "A3 cooldown: petición repetida no reenvía (buzón $N1→$N2); código malo→400 y el vigente sigue→200" "$rc" "Q1=$Q1 Q2=$Q2 I=$I V=$V"
#17. Código de otra identidad no sirve ni daña al emisor (cocinero→mesero).
# Víctima=mesero: su contraseña no la altera ningún escenario (la de cajero
# la fija la concurrencia del run anterior → dependencia entre ejecuciones).
reiniciar; limpiar_tokens "$COCINA"; limpiar_tokens "$MESERO"; rm -f "$MAILBOX"
post /auth/recovery/request "$(printf '{"email":"%s"}' "$COCINA")" "$ART/q3.json" >/dev/null
CC=$(ultimo_codigo); guardar_codigo "$CC"
W1=$(post /auth/recovery/verify "$(printf '{"email":"%s","code":"%s"}' "$MESERO" "$CC")" "$ART/w1.json" "$ART/w1h.txt")
W2=$(post /auth/recovery/reset "$(printf '{"email":"%s","code":"%s","newPassword":"%s"}' "$MESERO" "$CC" "Robada1234")" "$ART/w2.json" "$ART/w2h.txt")
LC=$(post /auth/login "$(printf '{"email":"%s","password":"%s"}' "$MESERO" "$P_MESERO")" "$ART/w3.json")
V3=$(post /auth/recovery/verify "$(printf '{"email":"%s","code":"%s"}' "$COCINA" "$CC")" "$ART/w4.json")
es_valido "$W1" 400 "$ART/w1h.txt" && es_valido "$W2" 400 "$ART/w2h.txt" && [ "$LC" = 200 ] && [ "$V3" = 200 ]
rc=$?
cuando "A3 código ajeno: verify→$W1 reset→$W2 (400), contraseña de mesero intacta→$LC, emisor válido→$V3" "$rc" ""
#18. Código vencido no verifica ni resetea (mesero)
reiniciar; limpiar_tokens "$MESERO"; rm -f "$MAILBOX"
post /auth/recovery/request "$(printf '{"email":"%s"}' "$MESERO")" "$ART/q4.json" >/dev/null
CM=$(ultimo_codigo); guardar_codigo "$CM"
PSQL_C "UPDATE \"RecoveryToken\" SET \"expiresAt\" = now() - interval '1 min' WHERE \"userId\"='$UID_M' AND \"usedAt\" IS NULL" >/dev/null
E1=$(post /auth/recovery/verify "$(printf '{"email":"%s","code":"%s"}' "$MESERO" "$CM")" "$ART/e4.json" "$ART/e4h.txt")
E2=$(post /auth/recovery/reset "$(printf '{"email":"%s","code":"%s","newPassword":"%s"}' "$MESERO" "$CM" "NuevaClave999")" "$ART/e5.json" "$ART/e5h.txt")
LM=$(post /auth/login "$(printf '{"email":"%s","password":"%s"}' "$MESERO" "$P_MESERO")" "$ART/e6.json")
es_valido "$E1" 400 "$ART/e4h.txt" && es_valido "$E2" 400 "$ART/e5h.txt" && [ "$LM" = 200 ]
rc=$?
cuando "A3 código vencido: verify→$E1 reset→$E2 (400) y contraseña de mesero intacta→$LM" "$rc" ""
#19. Presupuesto verify/reset por cuenta (domiciliario)
reiniciar; limpiar_tokens "$DOMI"; rm -f "$MAILBOX"
post /auth/recovery/request "$(printf '{"email":"%s"}' "$DOMI")" "$ART/q5.json" >/dev/null
CD=$(ultimo_codigo); guardar_codigo "$CD"
for i in 1 2 3 4; do
  post /auth/recovery/verify "$(printf '{"email":"%s","code":"11111%s"}' "$DOMI" "$i")" /dev/null >/dev/null
done
Z=$(post /auth/recovery/reset "$(printf '{"email":"%s","code":"111111","newPassword":"%s"}' "$DOMI" "OtraClave123")" "$ART/z1.json" "$ART/zh.txt")
es_429 "$Z" "$ART/zh.txt" "$ART/z1.json"
rc=$?
cuando "A3 tras4 intentos fallidos → reset429 con Retry-After=$(ra "$ART/zh.txt") (presupuesto compartido)" "$rc" "HTTP $Z"
espera_bloqueo
V4=$(post /auth/recovery/verify "$(printf '{"email":"%s","code":"%s"}' "$DOMI" "$CD")" "$ART/z2.json")
[ "$V4" = 200 ]
rc=$?
cuando "A3 el bloqueo expira y el código vigente verifica → 200 (temporal, no invalida)" "$rc" "HTTP $V4"
#20. Ciclo completo (cajero): reset + vieja401/nueva200 + código consumido400
reiniciar; limpiar_tokens "$CAJA"; rm -f "$MAILBOX"
post /auth/recovery/request "$(printf '{"email":"%s"}' "$CAJA")" "$ART/q6.json" >/dev/null
CR=$(ultimo_codigo); guardar_codigo "$CR"
RS=$(post /auth/recovery/reset "$(printf '{"email":"%s","code":"%s","newPassword":"%s"}' "$CAJA" "$CR" "$P_NUEVA")" "$ART/rs.json" "$ART/rsh.txt")
LV=$(post /auth/login "$(printf '{"email":"%s","password":"%s"}' "$CAJA" "$P_CAJA")" "$ART/lv.json" "$ART/lvh.txt")
NV=$(post /auth/login "$(printf '{"email":"%s","password":"%s"}' "$CAJA" "$P_NUEVA")" "$ART/nv.json")
U=$(post /auth/recovery/reset "$(printf '{"email":"%s","code":"%s","newPassword":"%s"}' "$CAJA" "$CR" "TerceraClave123")" "$ART/u1.json" "$ART/uh.txt")
[ "$RS" = 200 ] && es_valido "$LV" 401 "$ART/lvh.txt" && grep -q 'incorrectos' "$ART/lv.json" && \
  [ "$NV" = 200 ] && [ "$U" = 400 ] && grep -q 'inválido o expirado' "$ART/u1.json"
rc=$?
cuando "A3 reset→$RS; vieja→${LV} (esperado 401), nueva→${NV} (esperado 200), reuso→${U} (esperado 400)" "$rc" ""
#21. Concurrencia (cajero): exactamente UN reset consume el código
reiniciar; limpiar_tokens "$CAJA"; rm -f "$MAILBOX"
post /auth/recovery/request "$(printf '{"email":"%s"}' "$CAJA")" "$ART/q7.json" >/dev/null
KR=$(ultimo_codigo); guardar_codigo "$KR"
PIDS=""
for i in 1 2 3; do
  curl -s --max-time 15 -o "$ART/cc$i.json" -w '%{http_code}' -X POST "$API/auth/recovery/reset" \
    -H 'Content-Type: application/json' \
    -d "$(printf '{"email":"%s","code":"%s","newPassword":"%s"}' "$CAJA" "$KR" "$P_GANADORA")" \
    > "$ART/cc$i.code" 2>/dev/null &
  PIDS="$PIDS $!"
done
# Esperar SOLO los curl: un `wait` sin argumentos esperaría también al
# proceso de la API desprendido con `setsid &` (colgado del battery).
wait $PIDS
K1=$(cat "$ART/cc1.code"); K2=$(cat "$ART/cc2.code"); K3=$(cat "$ART/cc3.code")
EXITOS=$(printf '%s\n' "$K1" "$K2" "$K3" | grep -c '^200$')
MALOS=$(printf '%s\n' "$K1" "$K2" "$K3" | grep -c '^400$')
BLOQ=$(printf '%s\n' "$K1" "$K2" "$K3" | grep -c '^429$')
U3=$(post /auth/recovery/reset "$(printf '{"email":"%s","code":"%s","newPassword":"%s"}' "$CAJA" "$KR" "OtraMas123")" "$ART/u3.json")
LC2=$(post /auth/login "$(printf '{"email":"%s","password":"%s"}' "$CAJA" "$P_GANADORA")" "$ART/lc2.json")
[ "$EXITOS" = 1 ] && [ "$MALOS" = 2 ] && [ "$BLOQ" = 0 ] && [ "$U3" = 400 ] && [ "$LC2" = 200 ]
rc=$?
cuando "A3 concurrencia: UNO200 + OTRO400 (no429), reuso→400, contraseña ganadora→200" "$rc" "200=$EXITOS 400=$MALOS 429=$BLOQ reuso=$U3 login=$LC2"
#22. Límite POR IP de petición + respuestas públicas idénticas (mesero)
reiniciar; limpiar_tokens "$MESERO"; rm -f "$MAILBOX"
A1=$(post /auth/recovery/request "$(printf '{"email":"%s"}' "$MESERO")" "$ART/pa1.json")
BA1=$(cat "$ART/pa1.json"); guardar_codigo "$(ultimo_codigo)"
A2=$(post /auth/recovery/request "$(printf '{"email":"%s"}' "$MESERO")" "$ART/pa2.json")
BA2=$(cat "$ART/pa2.json")
A3=$(post /auth/recovery/request "$(printf '{"email":"%s"}' "$MESERO")" "$ART/pa3.json")
BA3=$(cat "$ART/pa3.json")
A4=$(post /auth/recovery/request "$(printf '{"email":"%s"}' "$MESERO")" "$ART/pa4.json" "$ART/pa4h.txt")
[ "$A1" = 202 ] && [ "$A2" = 202 ] && [ "$A3" = 202 ] && [ "$BA1" = "$BA2" ] && [ "$BA2" = "$BA3" ] && \
  [ "$(correos)" = 1 ] && es_429 "$A4" "$ART/pa4h.txt" "$ART/pa4.json"
rc=$?
cuando "A3 respuesta pública idéntica (vacía) y límite POR IP →429 con Retry-After=$(ra "$ART/pa4h.txt"); 3 peticiones =1 solo correo (cooldown)" "$rc" "A1..A3=$A1/$A2/$A3 A4=$A4"
#23. Límite POR CUENTA de petición (cocinero)
reiniciar; limpiar_tokens "$COCINA"; rm -f "$MAILBOX"
C_1=$(post /auth/recovery/request "$(printf '{"email":"%s"}' "$COCINA")" "$ART/ca1.json")
CB1=$(cat "$ART/ca1.json"); guardar_codigo "$(ultimo_codigo)"
C_2=$(post /auth/recovery/request "$(printf '{"email":"%s"}' "$COCINA")" "$ART/ca2.json")
CB2=$(cat "$ART/ca2.json")
C_3=$(post /auth/recovery/request "$(printf '{"email":"%s"}' "$COCINA")" "$ART/ca3.json")
CB3=$(cat "$ART/ca3.json")
C_4=$(post /auth/recovery/request "$(printf '{"email":"%s"}' "$COCINA")" "$ART/ca4.json" "$ART/ca4h.txt")
[ "$C_1" = 202 ] && [ "$C_2" = 202 ] && [ "$C_3" = 202 ] && [ "$CB1" = "$CB2" ] && [ "$CB2" = "$CB3" ] && \
  [ "$(correos)" = 1 ] && es_429 "$C_4" "$ART/ca4h.txt" "$ART/ca4.json"
rc=$?
cuando "A3 límite POR CUENTA →429 en la4ª (RA=$(ra "$ART/ca4h.txt")); 3 peticiones =1 solo correo (cooldown)" "$rc" "C1..C3=$C_1/$C_2/$C_3 C4=$C_4"

echo "══════ multi-tenant · selección de restaurante ══════"
#24-prep. El reto solo se emite con2+ coincidencias de la MISMA contraseña;
# tras P0 exactamente un admin la tiene, así que se igualan los DOS admins
# vía la propia API: una petición =2 correos (uno por identidad) y cada
# código pertenece a su identidad, por lo que se consumen los DOS códigos.
reiniciar; limpiar_tokens "$ADMIN"; rm -f "$MAILBOX"
post /auth/recovery/request "$(printf '{"email":"%s"}' "$ADMIN")" "$ART/mtq.json" >/dev/null
NM=$(correos)
CA1=$(sed -n '1p' "$MAILBOX" | jq -r '.text' | grep -oE '\b[0-9]{6}\b' | tail -n1)
CA2=$(sed -n '2p' "$MAILBOX" | jq -r '.text' | grep -oE '\b[0-9]{6}\b' | tail -n1)
guardar_codigo "$CA1"; guardar_codigo "$CA2"
MR1=$(post /auth/recovery/reset "$(printf '{"email":"%s","code":"%s","newPassword":"%s"}' "$ADMIN" "$CA1" "$P_GANADORA")" "$ART/mtr1.json")
MR2=$(post /auth/recovery/reset "$(printf '{"email":"%s","code":"%s","newPassword":"%s"}' "$ADMIN" "$CA2" "$P_GANADORA")" "$ART/mtr2.json")
[ "$NM" = 2 ] && [ -n "$CA1" ] && [ -n "$CA2" ] && [ "$CA1" != "$CA2" ] && [ "$MR1" = 200 ] && [ "$MR2" = 200 ]
rc=$?
cuando "MT prep: correo compartido →2 correos (buzón=$NM), códigos distintos y DOS resets→200 (ambos admin con la misma contraseña)" "$rc" "MR1=$MR1 MR2=$MR2"
#25. Reto con2 tenants para el email compartido, sin accessToken ni cookie
reiniciar
SC=$(post /auth/login "$(printf '{"email":"%s","password":"%s"}' "$ADMIN" "$P_GANADORA")" "$ART/sc.json" "$ART/sch.txt")
# El cuerpo va en el fichero: $SC solo contiene el código HTTP.
jq -e '.requiresTenantSelection == true' "$ART/sc.json" >/dev/null 2>&1 && \
  jq -e '.tenants | length == 2' "$ART/sc.json" >/dev/null 2>&1 && \
  jq -e '.accessToken == null' "$ART/sc.json" >/dev/null 2>&1 && \
  ! grep -qi '^set-cookie' "$ART/sch.txt" && \
  ST=$(jq -r '.selectionToken // empty' "$ART/sc.json") && [ -n "$ST" ]
rc=$?
cuando "MT correo compartido → reto con2 tenants, sin accessToken ni cookie de sesión" "$rc" "HTTP $SC"
#26. Select del tenant listado →200 y cookie de refresh
S1=$(post /auth/login/select "$(printf '{"selectionToken":"%s","tenantId":"%s"}' "$ST" "$T_AKI")" "$ART/s1.json" "$ART/s1h.txt")
[ "$S1" = 200 ] && jq -e '.accessToken' "$ART/s1.json" >/dev/null 2>&1 && grep -qi '^set-cookie: aki_refresh' "$ART/s1h.txt"
rc=$?
cuando "MT select de tenant listado → 200 con accessToken y cookie de refresh" "$rc" "HTTP $S1"
#27. Tenant fuera del listado →401 sin sesión
O1=$(post /auth/login/select "$(printf '{"selectionToken":"%s","tenantId":"%s"}' "$ST" "$T_FUERA")" "$ART/o1.json" "$ART/o1h.txt")
es_valido "$O1" 401 "$ART/o1h.txt" && ! grep -qi '^set-cookie' "$ART/o1h.txt"
rc=$?
cuando "MT fuera del listado→401 (sin Retry-After ni cookie)" "$rc" "HTTP $O1"
#28. Token de selección alterado →401 sin sesión
O2=$(post /auth/login/select "$(printf '{"selectionToken":"%sx","tenantId":"%s"}' "$ST" "$T_AKI")" "$ART/o2.json" "$ART/o2h.txt")
es_valido "$O2" 401 "$ART/o2h.txt" && ! grep -qi '^set-cookie' "$ART/o2h.txt"
rc=$?
cuando "MT token alterado→401 (sin Retry-After ni cookie)" "$rc" "HTTP $O2"
#29. El token de selección NO autentica sesión (refresh con ese token →401)
RF=$(curl -s --max-time 15 -o "$ART/rf.json" -D "$ART/rfh.txt" -w '%{http_code}' \
  -X POST "$API/auth/refresh" -H "Cookie: aki_refresh=$ST")
es_valido "$RF" 401 "$ART/rfh.txt"
rc=$?
cuando "MT token de selección no autentica sesión (refresh→401 sin rotación)" "$rc" "HTTP $RF"
#30. Límite POR IP de select activo (tenantId válido para llegar al servicio)
reiniciar
for i in 1 2 3; do
  post /auth/login/select "$(printf '{"selectionToken":"basura%s","tenantId":"%s"}' "$i" "$T_AKI")" /dev/null >/dev/null
done
SL=$(post /auth/login/select "$(printf '{"selectionToken":"basura4","tenantId":"%s"}' "$T_AKI")" "$ART/sl.json" "$ART/slh.txt")
es_429 "$SL" "$ART/slh.txt" "$ART/sl.json"
rc=$?
cuando "MT select repetido →429 con Retry-After=$(ra "$ART/slh.txt")" "$rc" "HTTP $SL"
#31. Un solo tenant coincide → login directo (mesero, solo en aki)
D=$(post /auth/login "$(printf '{"email":"%s","password":"%s"}' "$MESERO" "$P_MESERO")" "$ART/d.json" "$ART/dh.txt")
[ "$D" = 200 ] && jq -e '.accessToken' "$ART/d.json" >/dev/null 2>&1
rc=$?
cuando "MT con un solo tenant coincidente → login directo200" "$rc" "HTTP $D"

echo "══════ refresh · rotación y revocación ══════"
#32. Primer refresh rota; el segundo uso del token viejo lo rechaza la
#    revocación (401 sin Retry-After: NO es un límite de peticiones).
H0=$(curl -s --max-time 15 -o "$ART/rr0.json" -D "$ART/rr0h.txt" -w '%{http_code}' \
  -X POST "$API/auth/login" -H 'Content-Type: application/json' \
  -d "$(printf '{"email":"%s","password":"%s"}' "$CAJA" "$P_GANADORA")")
TOK1=$(awk 'BEGIN{IGNORECASE=1} /^set-cookie: aki_refresh=/{sub(/\r/,""); split($0,a,"aki_refresh="); split(a[2],b,";"); print b[1]}' "$ART/rr0h.txt")
R1=$(curl -s --max-time 15 -o "$ART/rr1.json" -D "$ART/rr1h.txt" -w '%{http_code}' \
  -X POST "$API/auth/refresh" -H "Cookie: aki_refresh=$TOK1")
TOK2=$(awk 'BEGIN{IGNORECASE=1} /^set-cookie: aki_refresh=/{sub(/\r/,""); split($0,a,"aki_refresh="); split(a[2],b,";"); print b[1]}' "$ART/rr1h.txt")
R2=$(curl -s --max-time 15 -o "$ART/rr2.json" -D "$ART/rr2h.txt" -w '%{http_code}' \
  -X POST "$API/auth/refresh" -H "Cookie: aki_refresh=$TOK1")
[ "$H0" = 200 ] && [ -n "$TOK1" ] && [ "$R1" = 200 ] && [ -n "$TOK2" ] && [ "$TOK1" != "$TOK2" ] && \
  [ "$R2" = 401 ] && [ -z "$(ra "$ART/rr2h.txt")" ] && grep -q 'expirada' "$ART/rr2.json"
rc=$?
cuando "REF primer refresh rota (token nuevo ≠ viejo); el viejo →401 de revocación sin Retry-After" "$rc" "login=$H0 r1=$R1 r2=$R2"

echo "══════ higiene ══════"
#33. Ningún código de recuperación queda en el log de la API
FUGAS=0
for c in $CODIGOS; do
  FUGAS=$((FUGAS + $(grep -c -- "$c" "$LOG")))
done
[ -n "$CODIGOS" ] && [ "$FUGAS" = 0 ]
rc=$?
cuando "LOG sin fugas de códigos (${#CODIGOS} códigos generados, fugas=$FUGAS)" "$rc" ""
#34. Ningún429 con Retry-After undefined (regresión del filtro) y429 reales
UNDEF=$(grep -c 'retry-after=undefined' "$LOG")
NUM429=$(grep -c '429 retry-after=[0-9]' "$LOG")
[ "$UNDEF" = 0 ] && [ "$NUM429" -gt 0 ]
rc=$?
cuando "LOG sin retry-after=undefined ($UNDEF) y con429 reales con Retry-After numérico ($NUM429)" "$rc" ""
#35. Buzón de desarrollo con permisos600
MODO=$(stat -c %a "$MAILBOX" 2>/dev/null || echo s/f)
[ "$MODO" = 600 ]
rc=$?
cuando "Buzón de desarrollo en modo600" "$rc" "modo=$MODO"

echo "══════ integridad · BD real y :3001 intactos ══════"
#36. La BD real no ha recibido NINGUNA fila nueva de RecoveryToken y los oid
#    de ambas bases siguen siendo los del preflight (misma identidad, sin
#    sustituciones).
DESP_R=$(PSQL_R 'SELECT count(*) FROM "RecoveryToken"')
OID_R2=$(PSQL_R "SELECT oid FROM pg_database WHERE datname='$DB_R'")
OID_C2=$(PSQL_C "SELECT oid FROM pg_database WHERE datname='$DB_C'")
[ "$DESP_R" = "$ANTES_R" ] && [ "$OID_R2" = "$OID_R" ] && [ "$OID_C2" = "$OID_C" ]
rc=$?
cuando "BD real intacta: RecoveryToken $ANTES_R → $DESP_R (sin escrituras) y oid real=$OID_R2 clon=$OID_C2" "$rc" ""
#37. :3001 con el mismo estado que al inicio (la batería no lo toca)
DESP3001=$(ss -ltnH 'sport = :3001' | grep -c .)
[ "$DESP3001" = "$ANTES3001" ]
rc=$?
cuando ":3001 sin tocar (listeners antes=$ANTES3001, después=$DESP3001)" "$rc" ""

echo "══════════════════════════════════════"
echo "TOTAL: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" = 0 ]
