// Cálculo de contraste según WCAG 2.1 (https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio).
// Se usa en `palette.test.ts` para que un cambio de color que rompa la accesibilidad
// haga fallar la suite en vez de llegar a producción sin que nadie lo note.

function parseHex(hex: string): [number, number, number] {
  const h = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`Color hex inválido: "${hex}". Se esperan 6 dígitos hexadecimales.`);
  }
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function channelLuminance(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map(channelLuminance);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const [light, dark] = a >= b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}
