import { describe, expect, it } from 'vitest';
import { contrast, luminance } from './contrast';

describe('contrast', () => {
  it('da 21 con negro sobre blanco', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('da 1 con el mismo color', () => {
    expect(contrast('#6B21A8', '#6b21a8')).toBeCloseTo(1, 5);
  });

  it('no depende del orden de los argumentos', () => {
    expect(contrast('#241B33', '#FBF9F6')).toBeCloseTo(contrast('#FBF9F6', '#241B33'), 10);
  });

  it('rechaza un color mal escrito en vez de calcular cualquier cosa', () => {
    expect(() => luminance('#12345')).toThrow();
  });
});
