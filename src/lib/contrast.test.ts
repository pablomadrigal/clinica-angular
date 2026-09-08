import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from './contrast';

describe('contrast', () => {
  it('calcula la luminancia de los extremos', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('da 21 para blanco sobre negro', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 2);
  });

  it('da 1 para un color contra sí mismo', () => {
    expect(contrastRatio('#6B21A8', '#6B21A8')).toBeCloseTo(1, 5);
  });

  it('es simétrica', () => {
    expect(contrastRatio('#D97706', '#FFFFFF')).toBeCloseTo(contrastRatio('#FFFFFF', '#D97706'), 5);
  });

  it('acepta hex con y sin almohadilla, en cualquier caja', () => {
    expect(contrastRatio('6b21a8', '#FFFFFF')).toBeCloseTo(8.72, 2);
  });

  it('rechaza un hex inválido', () => {
    expect(() => contrastRatio('#XYZ', '#FFFFFF')).toThrow(/hex/i);
  });
});
