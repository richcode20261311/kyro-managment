import { defineConfig } from 'vitest/config';

export default defineConfig({
  // apps/web usa `jsx: preserve` (Next); Vitest (Vite 8/oxc) compila los .tsx con runtime automático.
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
