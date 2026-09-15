import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { OUT_DIR, SRC, split } from '../../scripts/split-podologia.mjs';

const origen: string = readFileSync(SRC, 'utf8');
// El partidor es un .mjs sin tipos: TypeScript infiere `{}` para su salida.
const generado = split(origen) as Record<string, string>;
const enDisco = Object.fromEntries(
  readdirSync(OUT_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => [f.replace(/\.yaml$/, ''), readFileSync(join(OUT_DIR, f), 'utf8')]),
);

/**
 * Líneas que llevan texto del sitio: rutas de imagen, subtítulos, párrafos y títulos de
 * tratamiento. El MISMO filtro se aplica al origen y al destino, así que si la migración perdió,
 * duplicó o retocó un párrafo, las dos listas dejan de coincidir.
 */
function textos(yaml: string, desde = 0): string[] {
  return yaml
    .split('\n')
    .slice(desde)
    .map((l) => l.trim())
    .filter((l) => /^(image|subheading): /.test(l) || l.startsWith('- "') || l.startsWith('- title: '));
}

// En el origen se mira solo el bloque `sections:`: la imagen de la tarjeta del servicio vive
// antes y no viaja a ninguna ficha.
const desdeSections = origen.split('\n').findIndex((l) => l === 'sections:');

describe('partidor de podología', () => {
  it('genera los 12 padecimientos', () => {
    expect(Object.keys(generado)).toHaveLength(12);
  });

  it('no se perdió ni se alteró ningún texto ni ninguna ruta de imagen', () => {
    const esperado = textos(origen, desdeSections).sort();
    const obtenido = Object.values(generado)
      .flatMap((y) => textos(y))
      .sort();
    expect(obtenido).toEqual(esperado);
  });

  it('los archivos en disco son exactamente lo que produce el partidor', () => {
    expect(enDisco).toEqual(generado);
  });

  it('cada padecimiento apunta a tres vecinos que existen', () => {
    for (const [slug, yaml] of Object.entries(generado)) {
      const related = yaml
        .slice(yaml.indexOf('\nrelated:'))
        .split('\n')
        .filter((l) => l.startsWith('  - '))
        .map((l) => l.slice(4));
      expect(related, slug).toHaveLength(3);
      for (const r of related) expect(Object.keys(generado), `${slug} → ${r}`).toContain(r);
    }
  });
});

describe('secciones vacías', () => {
  const COMPONENTES = ['SymptomList', 'CauseList', 'DiagnosisBlock', 'TreatmentList', 'FaqAccordion', 'EvidenceTable'];

  // Un padecimiento sin material no debe dejar encabezados huérfanos. La garantía es estructural:
  // TODO el marcado de cada componente vive dentro de un único `{items.length > 0 && (…)}`, así
  // que con el array vacío no se pinta ni el <h2>. Si alguien saca el encabezado fuera del
  // guardián, esta prueba falla.
  it.each(COMPONENTES)('%s no pinta nada con el array vacío', (nombre) => {
    const fuente = readFileSync(join(dirname(fileURLToPath(import.meta.url)), `../components/condition/${nombre}.astro`), 'utf8');
    const plantilla = fuente.split('\n---\n').slice(1).join('\n---\n').trim();
    expect(plantilla.startsWith('{items.length > 0 && (')).toBe(true);
    expect(plantilla.endsWith(')}')).toBe(true);
  });

  it('los padecimientos sin material los dejan vacíos, no inventados', () => {
    for (const [slug, yaml] of Object.entries(generado)) {
      if (slug === 'hongos-unas-onicomicosis') continue; // único con FAQ y evidencia de la clínica
      for (const campo of ['symptoms', 'causes', 'diagnosis', 'faq', 'evidence']) {
        expect(yaml, `${slug}.${campo}`).toContain(`\n${campo}: []`);
      }
    }
  });
});
