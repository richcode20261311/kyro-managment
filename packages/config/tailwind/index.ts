/**
 * Tokens de diseño de AKI Admin — fuente única de verdad para valores hexadecimales.
 * El CSS canónico (para Tailwind) está en `theme.css`; un test en `src/sync.test.ts`
 * garantiza que ambos archivos digan lo mismo.
 *
 * Ojo: este archivo vive en `packages/config` (no en `design/`) y sí entra a los builds.
 */
export const colors = {
  'aki-bg': '#F5F5F5',
  'aki-red': '#E80008',
  'aki-orange': '#F87800',
  'aki-gold': '#F89800',
  'aki-success': '#2E7D4F',
  'aki-error': '#B3001B',
} as const;

/** Familias según DESIGN-CONTRACT §3: Poppins para títulos, Inter para cuerpo. */
export const fontFamily = {
  display: 'Poppins',
  body: 'Inter Variable',
} as const;

/** Breakpoints del contrato §5. */
export const screens = {
  desktop: '1280px',
  tablet: '1024px',
  mobile: '390px',
} as const;

/** Medidas fijas del shell §4: sidebar 264 px, barra superior 72 px. */
export const layout = {
  sidebar: '264px',
  rail: '88px',
  topbar: '72px',
} as const;
