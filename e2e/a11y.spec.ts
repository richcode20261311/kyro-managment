import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { authenticate } from './helpers';

const pages = ['/', '/login', '/recuperar', '/panel', '/dev/componentes'];

for (const path of pages) {
  test(`accesibilidad sin errores críticos en ${path}`, async ({ page }, testInfo) => {
    // La hoja F1 solo existe en desarrollo.
    if (path.startsWith('/dev') && testInfo.project.name !== 'desktop-1280') {
      test.skip();
    }

    if (path === '/panel') await authenticate(page);
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      (violation) => violation.impact === 'critical' || violation.impact === 'serious',
    );

    expect(
      blocking.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.length,
        help: violation.help,
      })),
    ).toEqual([]);
  });
}
