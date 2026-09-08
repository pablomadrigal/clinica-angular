import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';
import { palette } from './palette';

// Pares que el diseño realmente usa. Texto normal exige 4.5; los marcados como
// `large` son texto de 24px o más (o 18.66px en negrita) y les basta 3.0.
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

  it('todos los valores son hex de 6 dígitos', () => {
    for (const [name, hex] of Object.entries(palette)) {
      expect(hex, name).toMatch(/^#[0-9A-F]{6}$/);
    }
  });
});
