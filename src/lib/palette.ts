// Fuente única de verdad de los colores. `global.css` repite estos valores en su bloque
// `@theme` porque Tailwind necesita literales en CSS; `palette.test.ts` verifica que los
// pares que el diseño usa cumplan WCAG AA.
//
// Tomados del entregable de agosto, con tres correcciones de contraste documentadas en
// docs/superpowers/plans/2026-09-08-fase-1-sistema-de-diseno.md
export const palette = {
  primary: '#6B21A8',
  primaryDark: '#4C1578',
  // Solo como color de FONDO: con texto blanco o púrpura encima no llega a AA.
  accent: '#D97706',
  accentLight: '#F3C57A',
  // El dorado cuando tiene que ser texto o ícono sobre fondo claro.
  accentText: '#B45309',
  text: '#241B33',
  bg: '#FBF9F6',
  bgAlt: '#F3EEF9',
  white: '#FFFFFF',
  border: '#E4DCEF',
  // Borde de los campos de formulario. `border` (#E4DCEF) da 1.33 sobre blanco: como el relleno
  // del campo es del mismo blanco que la tarjeta, el borde es lo único que identifica el control
  // y WCAG 1.4.11 le exige 3.0. Este gris da 4.54.
  borderField: '#767676',
  evidenceStrong: '#1E7A4C',
  // Agosto traía #B5860B (3.29 sobre blanco); oscurecido para llegar a AA.
  evidenceMixed: '#8A6508',
  evidenceClinical: '#6B21A8',
  // Los errores de formulario necesitan su propio color: reusar el dorado de "evidencia
  // mixta" mezclaría dos significados distintos en la misma señal visual.
  error: '#B3261E',
  // Verdes de marca de WhatsApp: no son parte de la paleta, se conservan del repo.
  whatsapp: '#25D366',
  chat: '#3AD18C',
} as const;

export type ColorName = keyof typeof palette;
