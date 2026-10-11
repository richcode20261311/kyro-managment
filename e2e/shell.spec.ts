import { expect, test } from '@playwright/test';

test('el panel carga con el shell activo y sin desbordamiento', async ({ page }) => {
  await page.goto('/panel');
  await expect(page.getByRole('heading', { name: 'Panel principal' })).toBeVisible();
  await expect(page.getByText('AKI Admin // Panel principal')).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});

test('escritorio 1280: sidebar visible con los 16 ítems', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop-1280');
  await page.goto('/panel');

  const menu = page.locator('nav[aria-label="Menú principal"]');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('link')).toHaveCount(16);
  await expect(menu.getByText('Pedidos / POS')).toBeVisible();
  await expect(menu.getByText('Operación')).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Panel principal' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('tablet 1024: riel de 88 px solo con iconos', async ({ page }) => {
  test.skip(test.info().project.name !== 'tablet-1024');
  await page.goto('/panel');

  const menu = page.locator('nav[aria-label="Menú principal"]');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('link')).toHaveCount(16);
  await expect(menu.getByText('Pedidos / POS')).toBeHidden();
  await expect(menu.getByText('Operación')).toBeHidden();

  const width = await menu.locator('..').evaluate((el) => el.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(89);
});

test('móvil 390: barra inferior de 5 accesos y sin sidebar', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile-390');
  await page.goto('/panel');

  await expect(page.locator('nav[aria-label="Menú principal"]')).toBeHidden();
  const bottom = page.locator('nav[aria-label="Navegación principal"]');
  await expect(bottom).toBeVisible();
  await expect(bottom.getByRole('link')).toHaveCount(4);
  await expect(bottom.getByRole('button', { name: 'Más' })).toBeVisible();
});

test('móvil 390: la hoja "Más" agrupa el resto del menú', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile-390');
  await page.goto('/panel');

  await page.locator('nav[aria-label="Navegación principal"]').getByRole('button', { name: 'Más' }).click();
  const sheet = page.getByRole('dialog');
  await expect(sheet).toBeVisible();
  await expect(sheet.getByText('Administración')).toBeVisible();
  await expect(sheet.getByRole('link', { name: 'Configuración' })).toBeVisible();
  await expect(sheet.getByRole('link', { name: 'Panel principal' })).toBeVisible();
  // Los accesos de la barra inferior no se repiten en la hoja.
  await expect(sheet.getByRole('link', { name: 'Mesas' })).toBeHidden();
});
