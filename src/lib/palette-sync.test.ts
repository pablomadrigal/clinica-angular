// Red de seguridad de la duplicación paleta ↔ CSS.
//
// `src/styles/global.css` repite los hex de `palette.ts` en su bloque `@theme` porque Tailwind
// necesita literales en CSS. Hasta ahora eso se sincronizaba a mano y nada lo verificaba: si
// alguien cambiaba un hex de un solo lado, la suite pasaba en verde y el sitio incumplía.
//
// Esta prueba falla si un hex difiere, si sobra un token en el CSS sin equivalente en `palette`
// o si sobra una entrada de `palette` sin token en el CSS.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { palette } from './palette';

const cssPath = fileURLToPath(new URL('../styles/global.css', import.meta.url));
const css = readFileSync(cssPath, 'utf8');

// Los nombres no coinciden en todos los casos: el CSS los heredó del entregable de agosto y
// `palette` del repo original. Este mapa es la única traducción permitida; cualquier otro token
// tiene que llamarse igual en ambos lados (en kebab-case del lado del CSS).
const ALIASES: Record<string, keyof typeof palette> = {
  secondary: 'white',
  'border-soft': 'border',
};

const toCamel = (name: string): string => name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

function themeBlock(source: string): string {
  const start = source.indexOf('@theme {');
  if (start === -1) throw new Error('No se encontró el bloque `@theme` en global.css.');
  const end = source.indexOf('\n}', start);
  if (end === -1) throw new Error('El bloque `@theme` de global.css no está cerrado.');
  return source.slice(start, end);
}

/** Todos los `--color-*: #hex;` del bloque `@theme`, indexados por el nombre del token. */
function cssColors(source: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const [, name, hex] of themeBlock(source).matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    found.set(name, hex.toLowerCase());
  }
  return found;
}

/** El nombre en `palette` que le corresponde a un token `--color-<name>`. */
const paletteKeyFor = (token: string): string => ALIASES[token] ?? toCamel(token);

describe('sincronización entre palette.ts y global.css', () => {
  const colors = cssColors(css);

  it('el bloque @theme declara colores', () => {
    expect(colors.size).toBeGreaterThan(0);
  });

  it('cada token --color-* del CSS existe en palette con el mismo hex', () => {
    const diferencias: string[] = [];
    for (const [token, hex] of colors) {
      const key = paletteKeyFor(token);
      const enPaleta = (palette as Record<string, string>)[key];
      if (enPaleta === undefined) {
        diferencias.push(`--color-${token} no tiene equivalente en palette (se buscó "${key}")`);
      } else if (enPaleta.toLowerCase() !== hex) {
        diferencias.push(`--color-${token} es ${hex} en global.css pero ${enPaleta.toLowerCase()} en palette.${key}`);
      }
    }
    expect(diferencias).toEqual([]);
  });

  it('cada color de palette tiene su token --color-* en el CSS', () => {
    const cubiertos = new Set([...colors.keys()].map(paletteKeyFor));
    const faltantes = Object.keys(palette).filter((key) => !cubiertos.has(key));
    expect(faltantes).toEqual([]);
  });
});
