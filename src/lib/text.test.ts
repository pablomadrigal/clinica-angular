import { describe, expect, it } from 'vitest';
import { nl2br } from './text';

describe('nl2br', () => {
  it('convierte cada salto de línea en <br />', () => {
    expect(nl2br('línea uno\nlínea dos')).toBe('línea uno<br />línea dos');
  });

  it('convierte varios saltos de línea', () => {
    expect(nl2br('a\nb\nc')).toBe('a<br />b<br />c');
  });

  it('no modifica texto sin saltos de línea', () => {
    expect(nl2br('sin saltos')).toBe('sin saltos');
  });
});
