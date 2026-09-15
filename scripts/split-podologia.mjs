// scripts/split-podologia.mjs — parte `src/content/services/podologia.yaml` en las 12 fichas
// de `src/content/conditions/*.yaml`.
//
// El partidor trabaja sobre las LÍNEAS CRUDAS del origen, no sobre un YAML parseado: copia los
// párrafos y las rutas de imagen tal cual (solo cambia la sangría) para que la migración no
// pueda alterar una tilde, una comilla tipográfica ni un "\n" de un encabezado. Por eso tampoco
// hace falta una dependencia de YAML.
//
// `podologia.yaml` NO se toca: sigue siendo la fuente y `src/lib/conditions.test.ts` la compara
// contra lo generado. El script es idempotente: volver a correrlo reescribe los 12 archivos.
//
// Uso: node scripts/split-podologia.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SRC = join(ROOT, 'src/content/services/podologia.yaml');
export const OUT_DIR = join(ROOT, 'src/content/conditions');

// El orden y los slugs salen de la tabla del spec (docs/superpowers/specs/2026-09-08-…-design.md).
// `heading` es el encabezado EXACTO del origen; es la llave para emparejar, porque el orden de
// las secciones en el archivo no coincide con el de la tabla (verrugas va antes que heridas).
// `title` es ese encabezado en capitalización normal, con el nombre que usa la tabla del spec
// cuando difiere del origen ("PIÉ DIABÉTICO" → "Pie diabético", "CALLOS Y DUREZA" → plural).
const FICHAS = [
  {
    heading: 'HONGOS EN UÑAS Y HONGOS EN PIES',
    slug: 'hongos-unas-onicomicosis',
    title: 'Hongos en uñas y hongos en pies',
    menuLabel: 'Hongos en uñas y pies',
    related: ['una-incarnada-onicocriptosis', 'traumatismo-de-unas', 'pies-secos-sudoracion-mal-olor'],
    // Único padecimiento con material clínico: viene del entregable de agosto
    // (site/hongos-unas-onicomicosis/index.html), transcrito sin agregar nada.
    faq: [
      { question: '¿El láser cura los hongos?', answer: 'Es un complemento, no una solución única.' },
      { question: '¿Cuánto tarda en verse una uña sana?', answer: 'Entre 8 y 12 meses — la uña del pie crece despacio.' },
      {
        question: '¿Por qué vuelven a aparecer?',
        answer:
          'Por no completar el tratamiento o no controlar factores como calzado, prendas de vestir, pisos, humedad u hongos en la piel. Por eso la educación, propuestas de higienización y productos especiales son parte del plan terapéutico, no un extra.',
      },
    ],
    // La afirmación es la insignia de evidencia del entregable de agosto; las dos referencias
    // son las que esa página cita al pie ("Respaldo científico").
    evidence: [
      {
        claim: 'El láser es complemento del tratamiento de la onicomicosis, no una cura única.',
        level: 'mixed',
        source: 'Meretsky CR, et al. Efficacy of Laser Therapy for Onychomycosis: Systematic Review and Meta-Analysis. Cureus. 2024.',
      },
      {
        claim: 'El láser es complemento del tratamiento de la onicomicosis, no una cura única.',
        level: 'mixed',
        source: 'Bristow IR. The effectiveness of lasers in onychomycosis: systematic review. J Foot Ankle Res. 2014.',
      },
    ],
  },
  {
    heading: 'UÑA INCARNADA',
    slug: 'una-incarnada-onicocriptosis',
    title: 'Uña incarnada',
    menuLabel: 'Uña incarnada',
    related: ['hongos-unas-onicomicosis', 'traumatismo-de-unas', 'enfermedades-ortopodologicas'],
  },
  {
    heading: 'PIÉ DIABÉTICO',
    slug: 'pie-diabetico',
    title: 'Pie diabético',
    menuLabel: 'Pie diabético',
    related: ['heridas-cronicas', 'pie-geriatrico', 'callos-y-durezas'],
  },
  {
    heading: 'FASCITIS PLANTAR',
    slug: 'fascitis-plantar',
    title: 'Fascitis plantar',
    menuLabel: 'Fascitis plantar',
    related: ['alteraciones-biomecanicas-marcha', 'enfermedades-ortopodologicas', 'callos-y-durezas'],
    pendiente: true,
  },
  {
    heading: 'HERIDAS Y ÚLCERAS',
    slug: 'heridas-cronicas',
    title: 'Heridas y úlceras',
    menuLabel: 'Heridas y úlceras',
    related: ['pie-diabetico', 'pie-geriatrico', 'callos-y-durezas'],
  },
  {
    heading: 'VERRUGAS PLANTARES',
    slug: 'verrugas-plantares',
    title: 'Verrugas plantares',
    menuLabel: 'Verrugas plantares',
    related: ['callos-y-durezas', 'hongos-unas-onicomicosis', 'pies-secos-sudoracion-mal-olor'],
    pendiente: true,
  },
  {
    heading: 'ENFERMEDADES ORTOPODOLÓGICAS',
    slug: 'enfermedades-ortopodologicas',
    title: 'Enfermedades ortopodológicas',
    menuLabel: 'Enfermedades ortopodológicas',
    related: ['alteraciones-biomecanicas-marcha', 'callos-y-durezas', 'fascitis-plantar'],
  },
  {
    heading: 'PIE GERIÁTRICO',
    slug: 'pie-geriatrico',
    title: 'Pie geriátrico',
    menuLabel: 'Pie geriátrico',
    related: ['heridas-cronicas', 'pie-diabetico', 'callos-y-durezas'],
  },
  {
    heading: 'TRAUMATISMO DE UÑAS',
    slug: 'traumatismo-de-unas',
    title: 'Traumatismo de uñas',
    menuLabel: 'Traumatismo de uñas',
    related: ['hongos-unas-onicomicosis', 'una-incarnada-onicocriptosis', 'pie-geriatrico'],
  },
  {
    heading: 'CALLOS Y DUREZA',
    slug: 'callos-y-durezas',
    title: 'Callos y durezas',
    menuLabel: 'Callos y durezas',
    related: ['enfermedades-ortopodologicas', 'alteraciones-biomecanicas-marcha', 'pie-diabetico'],
  },
  {
    heading: 'PIES SECOS - SUDORACIÓN EXCESIVA - MAL OLOR',
    slug: 'pies-secos-sudoracion-mal-olor',
    title: 'Pies secos, sudoración excesiva, mal olor',
    menuLabel: 'Pies secos y sudoración',
    related: ['hongos-unas-onicomicosis', 'callos-y-durezas', 'pie-geriatrico'],
  },
  {
    heading: 'ALTERACIONES BIOMECÁNICAS\\nDE LA MARCHA',
    slug: 'alteraciones-biomecanicas-marcha',
    title: 'Alteraciones biomecánicas de la marcha',
    menuLabel: 'Alteraciones biomecánicas',
    related: ['fascitis-plantar', 'enfermedades-ortopodologicas', 'callos-y-durezas'],
  },
];

const PENDIENTE = '# PENDIENTE: el texto de origen describe otro padecimiento; espera material del Dr. Madrigal.';

/** Corta el YAML de origen en bloques de sección, conservando las líneas tal cual. */
export function parseSections(raw) {
  const lines = raw.split('\n');
  const starts = [];
  lines.forEach((l, i) => {
    if (/^ {2}- type: (condition|treatments)$/.test(l)) starts.push(i);
  });
  // `sections` termina en la siguiente clave de primer nivel (hoy `related:`).
  let end = lines.length;
  for (let i = starts[0]; i < lines.length; i++) {
    if (/^\S/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return starts.map((start, k) => {
    const block = lines.slice(start, k + 1 < starts.length ? starts[k + 1] : end);
    while (block.length && block[block.length - 1].trim() === '') block.pop();
    return { type: block[0].includes('condition') ? 'condition' : 'treatments', lines: block };
  });
}

/**
 * Empareja las secciones de dos en dos: (1,2), (3,4)… Cada par trae una `condition` y su
 * `treatments`, pero el orden DENTRO del par cambia a lo largo del archivo.
 */
export function pairSections(sections) {
  if (sections.length % 2 !== 0) throw new Error(`se esperaba un número par de secciones, hay ${sections.length}`);
  const pares = [];
  for (let i = 0; i < sections.length; i += 2) {
    const par = [sections[i], sections[i + 1]];
    const condition = par.find((s) => s.type === 'condition');
    const treatments = par.find((s) => s.type === 'treatments');
    if (!condition || !treatments) throw new Error(`el par ${i / 2 + 1} no tiene una condition y un treatments`);
    pares.push({ condition, treatments });
  }
  return pares;
}

const dedent = (line, n) => (line.trim() === '' ? line : line.slice(n));
// Los encabezados del origen vienen con y sin comillas ("PIÉ DIABÉTICO" vs "PIES SECOS - …").
// Se comparan sin ellas; el "\n" de "ALTERACIONES BIOMECÁNICAS\nDE LA MARCHA" se deja literal.
const unquote = (s) => (s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1).replace(/\\"/g, '"') : s);

/** Saca de un bloque `condition` el encabezado, la imagen, el subtítulo y las líneas del cuerpo. */
export function readCondition(block) {
  const find = (key) => block.lines.find((l) => l.startsWith(`    ${key}: `));
  const bodyAt = block.lines.findIndex((l) => l === '    body:');
  const body = bodyAt === -1 ? [] : block.lines.slice(bodyAt + 1).filter((l) => l.trim() !== '');
  for (const l of body) if (!l.startsWith('      - ')) throw new Error(`línea de cuerpo inesperada: ${l}`);
  return {
    heading: unquote(find('heading')?.slice('    heading: '.length) ?? ''),
    image: find('image')?.slice('    image: '.length),
    subheading: find('subheading')?.slice('    subheading: '.length),
    // Sangría 6 → 4: el cuerpo pasa a colgar de `hero.lead`.
    body: body.map((l) => dedent(l, 2)),
  };
}

/** Saca de un bloque `treatments` las líneas de `items`, listas para colgar de `treatments:`. */
export function readTreatments(block) {
  const at = block.lines.findIndex((l) => l === '    items:');
  if (at === -1) throw new Error('bloque treatments sin items');
  // Sangría 6 → 2: `items` estaba anidado bajo la sección, ahora es la raíz `treatments:`.
  return block.lines
    .slice(at + 1)
    .filter((l) => l.trim() !== '')
    .map((l) => dedent(l, 4));
}

const q = (s) => `"${s.replace(/"/g, '\\"')}"`;

/** Arma el texto del YAML de una ficha. */
export function renderCondition(ficha, order, { image, subheading, body }, treatments) {
  const out = [];
  if (ficha.pendiente) out.push(PENDIENTE);
  out.push(`title: ${q(ficha.title)}`);
  out.push(`slug: ${ficha.slug}`);
  out.push('service: podologia');
  out.push(`menuLabel: ${q(ficha.menuLabel)}`);
  out.push(`order: ${order}`);
  out.push(`seoTitle: ${q(`${ficha.title} - Clínica Angular`)}`);
  out.push('hero:');
  if (image) out.push(`  image: ${image}`);
  if (subheading) out.push(`  subheading: ${subheading}`);
  out.push('  lead:');
  out.push(...body);
  // Sin material de la clínica: se dejan vacíos y su sección no se pinta (regla de integridad
  // del spec). No se rellenan con texto inventado.
  out.push('symptoms: []');
  out.push('causes: []');
  out.push('diagnosis: []');
  out.push('treatments:');
  out.push(...treatments);
  if (ficha.faq?.length) {
    out.push('faq:');
    for (const f of ficha.faq) out.push(`  - question: ${q(f.question)}`, `    answer: ${q(f.answer)}`);
  } else {
    out.push('faq: []');
  }
  if (ficha.evidence?.length) {
    out.push('evidence:');
    for (const e of ficha.evidence) out.push(`  - claim: ${q(e.claim)}`, `    level: ${e.level}`, `    source: ${q(e.source)}`);
  } else {
    out.push('evidence: []');
  }
  out.push('related:');
  for (const r of ficha.related) out.push(`  - ${r}`);
  return `${out.join('\n')}\n`;
}

/** Devuelve `{ [slug]: contenido }` sin tocar el disco (así lo usa la prueba). */
export function split(raw) {
  const pares = pairSections(parseSections(raw));
  const porHeading = new Map(pares.map((p) => [readCondition(p.condition).heading, p]));
  if (porHeading.size !== 12) throw new Error(`se esperaban 12 padecimientos, hay ${porHeading.size}`);
  const archivos = {};
  FICHAS.forEach((ficha, i) => {
    const par = porHeading.get(ficha.heading);
    if (!par) throw new Error(`no aparece el encabezado "${ficha.heading}" en podologia.yaml`);
    archivos[ficha.slug] = renderCondition(ficha, i + 1, readCondition(par.condition), readTreatments(par.treatments));
  });
  return archivos;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const archivos = split(await readFile(SRC, 'utf8'));
  await mkdir(OUT_DIR, { recursive: true });
  for (const [slug, contenido] of Object.entries(archivos)) await writeFile(join(OUT_DIR, `${slug}.yaml`), contenido);
  console.log(`${Object.keys(archivos).length} padecimientos escritos en ${OUT_DIR}`);
}
