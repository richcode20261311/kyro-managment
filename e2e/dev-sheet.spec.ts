import { expect, test } from '@playwright/test';

test('la hoja de componentes (F1) carga sin desbordamiento', async ({ page }) => {
  await page.goto('/dev/componentes');
  await expect(page.getByRole('heading', { name: 'Hoja de componentes' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Botones' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Primario' })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});

test('las superposiciones abren con la capa del contrato', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1280');
  await page.goto('/dev/componentes');

  await page.getByRole('button', { name: 'Abrir diálogo' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Diálogo de ejemplo')).toBeVisible();

  // La capa oscura cubre toda la pantalla (menú y barra incluidos).
  const overlay = page.locator('[class*="bg-black/40"]').first();
  const overlayBox = await overlay.boundingBox();
  expect(overlayBox?.width).toBe(1280);
  expect(overlayBox?.height).toBeGreaterThanOrEqual(800);
});

test('la confirmación destructiva exige motivo', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1280');
  await page.goto('/dev/componentes');

  await page.getByRole('button', { name: 'Confirmar borrado' }).click();
  await page.getByRole('button', { name: 'Eliminar producto' }).click();
  await expect(page.getByText('El motivo es obligatorio.')).toBeVisible();
});
