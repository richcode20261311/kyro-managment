import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { colors, fontFamily, layout, screens } from '../tailwind/index';

const here = dirname(fileURLToPath(import.meta.url));
const themeCss = readFileSync(join(here, '../tailwind/theme.css'), 'utf8');

/**
 * `theme.css` (Tailwind) y `tailwind/index.ts` (valores para TS/gráficos) deben decir
 * lo mismo: si alguien cambia un token en uno solo, este test falla.
 */
describe('sincronía de tokens', () => {
  it('cada color hex de index.ts existe en theme.css', () => {
    for (const [name, hex] of Object.entries(colors)) {
      const normalized = hex.toLowerCase().replace('#', '#');
      expect(themeCss, `falta ${name} (${hex}) en theme.css`).toContain(normalized);
    }
  });

  it('tipografía, breakpoints y medidas coinciden', () => {
    expect(themeCss).toContain(`"${fontFamily.display}"`);
    expect(themeCss).toContain(`"${fontFamily.body}"`);
    for (const value of Object.values(screens)) {
      expect(themeCss).toContain(value);
    }
    expect(themeCss).toContain(`--width-sidebar: ${layout.sidebar}`);
    expect(themeCss).toContain(`--height-topbar: ${layout.topbar}`);
  });

  it('theme.css define @theme (Tailwind v4)', () => {
    expect(themeCss).toContain('@theme');
  });
});
