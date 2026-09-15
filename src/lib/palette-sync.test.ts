import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { palette } from './palette';

// Tailwind v4 solo acepta literales dentro de `@theme`, así que los hex viven dos veces.
// Esta prueba es lo único que impide que las dos copias se separen sin que nadie lo note.
const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');
const bloque = css.slice(css.indexOf('@theme'), css.indexOf('@layer base'));

const declarados = new Map<string, string>();
for (const [, nombre, valor] of bloque.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{3,8});/g)) {
  declarados.set(nombre, valor.toLowerCase());
}

describe('paleta sincronizada con global.css', () => {
  it('declara en el CSS exactamente los colores de palette.ts', () => {
    expect([...declarados.keys()].sort()).toEqual(Object.keys(palette).sort());
  });

  it.each(Object.entries(palette))('--color-%s vale %s en el CSS', (nombre, valor) => {
    expect(declarados.get(nombre)).toBe(valor);
  });
});
