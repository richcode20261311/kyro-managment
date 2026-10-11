import { defineConfig } from '@playwright/test';

/**
 * Los 3 breakpoints del DESIGN-CONTRACT (§5): escritorio 1280, tablet 1024, móvil 390.
 * Regresión visual: se usan capturas propias normalizadas; las de Stitch son referencia, no baseline.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
  },
  projects: [
    {
      name: 'desktop-1280',
      use: { viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'tablet-1024',
      use: { viewport: { width: 1024, height: 768 } },
    },
    {
      name: 'mobile-390',
      use: { viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: [
    {
      // La API hace falta para los flujos de autenticación (A1/A3) contra datos reales.
      command: 'pnpm --filter @aki/api dev',
      url: 'http://localhost:3001/api/auth/employees?tenant=aki',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @aki/web dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
