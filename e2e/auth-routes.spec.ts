import { expect, test } from '@playwright/test';
import { authenticate } from './helpers';

test('sin sesión, /panel redirige al login conservando el destino', async ({ page }) => {
  await page.goto('/panel');
  await expect(page).toHaveURL(/\/login\?sigue=%2Fpanel$/);
});

test('con sesión (cookie), /panel carga el shell', async ({ page }) => {
  await authenticate(page);
  await page.goto('/panel');
  await expect(page.getByRole('heading', { name: 'Panel principal' })).toBeVisible();
});
