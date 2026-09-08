import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';
import { palette } from './palette';

// Pares que el diseño realmente usa. Texto normal exige 4.5; los que llevan `min: 3` no son
// texto de lectura: son texto grande (24px, o 18.66px en negrita) o elementos no textuales
// —bordes de controles y demás— para los que WCAG 1.4.11 pide 3.0.
const pairs: Array<{ fg: keyof typeof palette; bg: keyof typeof palette; min: number; note: string }> = [
  { fg: 'text', bg: 'bg', min: 4.5, note: 'cuerpo sobre el fondo crema' },
  { fg: 'text', bg: 'white', min: 4.5, note: 'cuerpo sobre tarjetas blancas' },
  { fg: 'text', bg: 'bgAlt', min: 4.5, note: 'cuerpo sobre secciones lila' },
  { fg: 'text', bg: 'accent', min: 4.5, note: 'texto sobre botones dorados' },
  { fg: 'primary', bg: 'bg', min: 4.5, note: 'títulos sobre el fondo crema' },
  { fg: 'primary', bg: 'white', min: 4.5, note: 'títulos sobre tarjetas blancas' },
  { fg: 'primaryDark', bg: 'bg', min: 4.5, note: 'títulos oscuros' },
  { fg: 'white', bg: 'primary', min: 4.5, note: 'header y botones púrpura' },
  { fg: 'white', bg: 'primaryDark', min: 4.5, note: 'hover de botones púrpura' },
  { fg: 'accentText', bg: 'white', min: 4.5, note: 'dorado como texto o ícono' },
  { fg: 'accentText', bg: 'bg', min: 4.5, note: 'dorado como texto sobre crema' },
  { fg: 'evidenceStrong', bg: 'white', min: 4.5, note: 'etiqueta de evidencia fuerte' },
  { fg: 'evidenceMixed', bg: 'white', min: 4.5, note: 'etiqueta de evidencia mixta' },
  { fg: 'evidenceClinical', bg: 'white', min: 4.5, note: 'etiqueta de criterio clínico' },
  { fg: 'error', bg: 'white', min: 4.5, note: 'errores de formulario sobre tarjeta blanca' },
  { fg: 'error', bg: 'bgAlt', min: 4.5, note: 'errores de formulario sobre sección lila' },
  { fg: 'accentLight', bg: 'primary', min: 4.5, note: 'dorado como texto sobre fondo púrpura' },
  { fg: 'text', bg: 'accentLight', min: 4.5, note: 'texto sobre el dorado claro del hover' },
  { fg: 'text', bg: 'chat', min: 4.5, note: 'texto sobre el botón de chat' },
  { fg: 'text', bg: 'whatsapp', min: 4.5, note: 'texto sobre el botón de WhatsApp' },
  // No es texto: es el borde de los campos del asistente, que sobre la tarjeta blanca es lo
  // único que delimita el control. WCAG 1.4.11 le exige 3.0, no 4.5.
  { fg: 'borderField', bg: 'white', min: 3, note: 'borde de los campos del asistente' },
];

describe('palette', () => {
  it.each(pairs)('$fg sobre $bg cumple AA ($note)', ({ fg, bg, min }) => {
    expect(contrastRatio(palette[fg], palette[bg])).toBeGreaterThanOrEqual(min);
  });

  it('el dorado de fondo nunca se combina con blanco ni con púrpura', () => {
    // Documenta por qué existe `accentText`: estos pares fallan y no deben usarse.
    expect(contrastRatio(palette.white, palette.accent)).toBeLessThan(4.5);
    expect(contrastRatio(palette.primary, palette.accent)).toBeLessThan(4.5);
  });

  it('el dorado de fondo tampoco sirve como texto sobre púrpura', () => {
    // Regresión real: `accent` era un durazno claro que sobre púrpura cumplía, y al pasar a
    // #D97706 quedó en 2.74. Sobre fondo púrpura el dorado que va es `accentLight`.
    expect(contrastRatio(palette.accent, palette.primary)).toBeLessThan(4.5);
  });

  it('el dorado de texto no alcanza sobre las secciones lila', () => {
    // 4.40: `accentText` cumple sobre blanco y sobre el crema, pero no sobre `bgAlt`.
    expect(contrastRatio(palette.accentText, palette.bgAlt)).toBeLessThan(4.5);
  });

  it('todos los valores son hex de 6 dígitos', () => {
    for (const [name, hex] of Object.entries(palette)) {
      expect(hex, name).toMatch(/^#[0-9A-F]{6}$/);
    }
  });
});
