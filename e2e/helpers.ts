import type { Page } from '@playwright/test';

/**
 * El middleware exige la cookie de refresh (su presencia, no su validez) para
 * las rutas protegidas; las specs que visitan /panel la siembran primero.
 */
export async function authenticate(page: Page): Promise<void> {
  await page.context().addCookies([
    {
      name: 'aki_refresh',
      value: 'e2e',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}
