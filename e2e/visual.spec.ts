import { expect, test, type Page } from '@playwright/test';
import { authenticate } from './helpers';

/**
 * Regresión visual con capturas propias (las de Stitch son referencia, no baseline).
 * Se enmascara la fecha real del encabezado para que no cambie cada día.
 */
async function stabilize(page: Page): Promise<void> {
  await page.goto('/panel');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

const maskDate = (page: Page) => [
  page.getByText(/^[A-Za-zÁÉÍÓÚáéíóúñ]+, \d{2}\/\d{2}\/\d{4}$/).first(),
];

test('captura del panel', async ({ page }) => {
  await authenticate(page);
  // Congela el reloj: la fecha real cambia el ancho del texto del encabezado y
  // la máscara por sí sola no cubre anchos distintos (rompía la captura cada día).
  await page.clock.install({ time: new Date('2026-10-10T10:00:00-05:00') });
  await stabilize(page);
  await expect(page).toHaveScreenshot('panel.png', {
    mask: maskDate(page),
    animations: 'disabled',
  });
});

test('captura de la hoja de componentes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1280');
  await page.goto('/dev/componentes');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await expect(page).toHaveScreenshot('componentes.png', {
    fullPage: true,
    animations: 'disabled',
  });
});
