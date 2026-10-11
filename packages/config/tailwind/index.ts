/**
 * Tokens de diseño de AKI Admin — fuente única para Tailwind.
 * Reglas completas en docs/DESIGN-CONTRACT.md.
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

export const fontFamily = {
  display: ['Poppins', 'sans-serif'],
  body: ['Inter', 'sans-serif'],
} as const;

export const screens = {
  desktop: '1280px',
  tablet: '1024px',
  mobile: '390px',
} as const;

export const layout = {
  sidebar: '264px',
  topbar: '72px',
} as const;
