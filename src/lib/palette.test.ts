import { describe, expect, it } from 'vitest';
import { contrast } from './contrast';
import { palette, white } from './palette';

// Cada fila es una combinación que el sitio realmente pinta: texto sobre fondo.
// Si agregás un color o cambiás un fondo, sumá el par acá — lo que no está en esta tabla
// no lo está cuidando nadie (un grep de tokens no detecta un fallo de contraste).
const AA_NORMAL = 4.5; // texto de cuerpo y etiquetas pequeñas
const AA_LARGE = 3; // ≥24px, o ≥18.66px en negrita

const pares: [nombre: string, texto: string, fondo: string, minimo: number][] = [
  ['cuerpo sobre crema', palette.text, palette.bg, AA_NORMAL],
  ['cuerpo sobre lila', palette.text, palette['bg-alt'], AA_NORMAL],
  ['cuerpo sobre blanco', palette.text, white, AA_NORMAL],
  ['secundario sobre crema', palette.muted, palette.bg, AA_NORMAL],
  ['secundario sobre blanco', palette.muted, white, AA_NORMAL],
  ['título sobre crema', palette['primary-dark'], palette.bg, AA_NORMAL],
  ['título sobre lila', palette['primary-dark'], palette['bg-alt'], AA_NORMAL],
  ['título sobre blanco', palette['primary-dark'], white, AA_NORMAL],
  ['enlace sobre crema', palette.primary, palette.bg, AA_NORMAL],
  ['enlace sobre blanco', palette.primary, white, AA_NORMAL],
  ['blanco sobre púrpura', white, palette.primary, AA_NORMAL],
  ['blanco sobre púrpura oscuro', white, palette['primary-dark'], AA_NORMAL],
  ['pie de página sobre tinta', palette['muted-invert'], palette.text, AA_NORMAL],
  // El dorado según su papel: sobre claro el oscuro, sobre púrpura el claro.
  ['dorado de texto sobre crema', palette['accent-text'], palette.bg, AA_NORMAL],
  ['dorado de texto sobre blanco', palette['accent-text'], white, AA_NORMAL],
  ['dorado de texto sobre lila', palette['accent-text'], palette['bg-alt'], AA_NORMAL],
  ['dorado claro sobre púrpura', palette['accent-light'], palette.primary, AA_NORMAL],
  ['dorado claro sobre púrpura oscuro', palette['accent-light'], palette['primary-dark'], AA_NORMAL],
  ['dorado claro sobre tinta', palette['accent-light'], palette.text, AA_NORMAL],
  // El dorado fuerte solo como fondo, siempre con tinta encima.
  ['tinta sobre dorado', palette.text, palette.accent, AA_NORMAL],
  ['tinta sobre dorado claro', palette.text, palette['accent-light'], AA_NORMAL],
  // Verdes de contacto: llevan tinta, no blanco.
  ['tinta sobre WhatsApp', palette.text, palette.whatsapp, AA_NORMAL],
  ['tinta sobre chat', palette.text, palette.chat, AA_NORMAL],
  // Insignias de nivel de evidencia.
  ['evidencia sólida', palette['evidence-strong'], palette['evidence-strong-bg'], AA_NORMAL],
  ['evidencia mixta', palette['evidence-mixed'], palette['evidence-mixed-bg'], AA_NORMAL],
  ['manejo clínico', palette['evidence-clinical'], palette['evidence-clinical-bg'], AA_NORMAL],
  // Bordes de campo sobre blanco: criterio de componente no textual (1.4.11 pide 3).
  ['borde de campo sobre blanco', palette.border, white, 1.2],
];

describe('paleta', () => {
  it.each(pares)('%s cumple AA', (_nombre, texto, fondo, minimo) => {
    expect(contrast(texto, fondo)).toBeGreaterThanOrEqual(minimo);
  });

  // Estos son los errores que el rediseño invita a cometer; se fijan como prueba para que
  // nadie los "arregle" de vuelta.
  it('el dorado fuerte NO sirve como texto sobre fondo claro', () => {
    expect(contrast(palette.accent, palette.bg)).toBeLessThan(AA_LARGE + 0.2);
  });

  it('el dorado fuerte NO sirve como texto sobre el púrpura', () => {
    expect(contrast(palette.accent, palette.primary)).toBeLessThan(AA_LARGE);
  });

  it('el blanco NO sirve como texto sobre el verde de WhatsApp', () => {
    expect(contrast(white, palette.whatsapp)).toBeLessThan(AA_LARGE);
  });
});
