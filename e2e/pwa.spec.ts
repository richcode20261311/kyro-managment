import { expect, test } from '@playwright/test';
import { authenticate } from './helpers';

test.beforeEach(async ({ page }) => {
  await authenticate(page);
});

test('la PWA declara manifest, SW y página sin conexión', async ({ page, request }) => {
  await page.goto('/panel');

  // Manifest instalable
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    'href',
    '/manifest.webmanifest',
  );
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBe(true);
  expect((await manifest.json()).name).toBe('AKI Admin');

  // Service worker generado por Serwist
  const sw = await request.get('/serwist/sw.js');
  expect(sw.ok()).toBe(true);
  expect(sw.headers()['content-type']).toContain('javascript');
  expect(await sw.text()).toContain('precache');

  // La página de respaldo sin red existe
  const offline = await request.get('/~offline');
  expect(offline.ok()).toBe(true);

  // El navegador registra el worker
  const registered = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return Boolean(registration.active ?? registration.waiting ?? registration.installing);
  });
  expect(registered).toBe(true);
});
