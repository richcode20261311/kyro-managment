#!/usr/bin/env node
/**
 * Lanzador de la instancia de pruebas de la batería de seguridad (:3002,
 * BD aki_admin_clone). Ver `README.md` de este directorio.
 *
 * Fuerza DATABASE_URL/APP_DATABASE_URL/PORT desde el archivo de entorno
 * indicado por AKI_BATTERY_ENV (por defecto $AKI_BATTERY_DIR/clone.env),
 * sobrescribiendo el entorno heredado: eso es lo que manda, y deja
 * constancia de la BD efectiva en la stdout sin imprimir secretos. Si el
 * proceso arranca con otra BD, la batería aborta por la línea de evidencia.
 *
 * No contiene credenciales: el archivo de entorno real vive fuera del
 * repositorio (ver clone.env.example).
 */
const fs = require('fs');
const path = require('path');

const work = process.env.AKI_BATTERY_DIR || '/tmp/aki-security-battery';
const envFile = process.env.AKI_BATTERY_ENV || path.join(work, 'clone.env');
const distMain = process.env.AKI_BATTERY_DIST || path.join(work, 'api-dist', 'main.js');

for (const raw of fs.readFileSync(envFile, 'utf8').split('\n')) {
  const line = raw.trim();
  if (!line || line.startsWith('#')) continue;
  const i = line.indexOf('=');
  if (i < 1) continue;
  let v = line.slice(i + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  process.env[line.slice(0, i).trim()] = v; // sobrescribe: esto es lo que manda
}

// Evidencia para la batería: solo nombres de base y puerto (nunca credenciales).
const dbName = (u) => {
  try {
    return new URL(u || '').pathname.replace(/^\//, '') || 'SIN_URL';
  } catch {
    return 'URL_INVALIDA';
  }
};
process.stdout.write(
  `[lanzador] BD efectivas: DATABASE_URL=${dbName(process.env.DATABASE_URL)}` +
    ` APP_DATABASE_URL=${dbName(process.env.APP_DATABASE_URL)} PORT=${process.env.PORT}\n`,
);

// El dist vive fuera del árbol de módulos: resolvemos las dependencias del
// workspace (apps/api/node_modules y la raíz con el store de pnpm).
const apiRoot = path.resolve(__dirname, '..', '..'); // …/apps/api
process.env.NODE_PATH = [path.join(apiRoot, 'node_modules'), path.resolve(apiRoot, '..', '..', 'node_modules')].join(':');
require('module').Module._initPaths();
require(distMain);
