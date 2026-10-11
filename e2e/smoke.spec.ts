import { expect, test } from '@playwright/test';

test('la página de inicio carga sin desbordamiento horizontal', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AKI Admin' })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
