// Espejo en TypeScript de los tokens `@theme` de `src/styles/global.css`.
// La duplicación es deliberada (Tailwind v4 necesita literales en el CSS) y está vigilada por
// `palette-sync.test.ts`; las combinaciones fondo/texto permitidas las fija `palette.test.ts`.
export const palette = {
  primary: '#6b21a8',
  'primary-dark': '#4c1578',
  accent: '#d97706',
  'accent-text': '#a34a08',
  'accent-light': '#f3c57a',
  text: '#241b33',
  muted: '#4a3f5c',
  'muted-invert': '#dcd3ea',
  bg: '#fbf9f6',
  'bg-alt': '#f3eef9',
  border: '#e4dcef',
  whatsapp: '#25d366',
  chat: '#3ad18c',
  'evidence-strong': '#1e7a4c',
  'evidence-strong-bg': '#e4f5ec',
  'evidence-mixed': '#8a6508',
  'evidence-mixed-bg': '#fbf0d9',
  'evidence-clinical': '#6b21a8',
  'evidence-clinical-bg': '#f1e4fb',
} as const;

export type PaletteColor = keyof typeof palette;

export const white = '#ffffff';
