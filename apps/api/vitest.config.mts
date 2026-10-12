import { defineConfig } from 'vitest/config';

export default defineConfig({
  // `tsconfig.json` excluye `**/*.test.ts`, por lo que oxc no hereda de ahí
  // `experimentalDecorators` y ningún test podría construir clases decoradas
  // (p. ej. el registro global del filtro en rate-limit-filter.test.ts).
  // El build (`nest build`/tsc) sigue usando el tsconfig del proyecto.
  oxc: {
    decorator: { legacy: true },
  },
});
