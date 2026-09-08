# Fase 1 — Sistema de diseño y base · Plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDA: usá `superpowers:subagent-driven-development` (recomendado) o `superpowers:executing-plans` para ejecutar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para seguimiento.

**Objetivo:** Migrar la base visual del repo al diseño de agosto (paleta púrpura/dorado, Fraunces + Work Sans, parallax) y reemplazar el formulario de contacto por el asistente de agenda de 5 pasos que envía a WhatsApp.

**Arquitectura:** Se conservan Astro 7 y Tailwind v4. Los tokens de agosto entran como valores del bloque `@theme` de `global.css`, y se duplican en `src/lib/palette.ts` para poder verificarlos con pruebas automáticas de contraste. La lógica testeable (contraste, validación del asistente, guardas de movimiento) vive en módulos `.ts` con pruebas de vitest; los componentes `.astro` se verifican con `astro check`, `astro build` y el verificador de enlaces.

**Stack:** Astro 7.3, Tailwind CSS 4.3, TypeScript 6, vitest 5, GSAP 3.15, fontsource.

## Restricciones globales

- Node >= 22.12.0.
- El sitio es estático (`output: 'static'`) y `trailingSlash: 'always'`. Toda ruta interna lleva barra final.
- No se agregan enlaces a Google Fonts ni a ningún CDN: las fuentes se sirven locales vía fontsource.
- **Nunca se promete al paciente una cita confirmada.** El asistente genera un mensaje de WhatsApp; no existe backend. Todo el copy de confirmación debe reflejarlo.
- **No se inventa contenido médico.** Esta fase no escribe texto clínico nuevo.
- Todo texto visible va en español de Costa Rica, con voseo, siguiendo el entregable de agosto.
- Los comentarios de código se escriben en español, como el resto del repo.
- `npm run check`, `npm run test` y `npm run links` deben pasar al cerrar cada tarea.

## Correcciones a la paleta de agosto

La paleta de agosto tiene tres pares que no cumplen WCAG AA. Se corrigen aquí, con los ratios ya calculados:

| Problema | Valor de agosto | Ratio | Corrección | Ratio nuevo |
|---|---|---|---|---|
| Dorado como texto sobre fondo claro | `#D97706` sobre blanco | 3.19 ✗ | token nuevo `--color-accent-text: #B45309` | 5.02 ✓ |
| Dorado con texto blanco o púrpura encima | blanco/`#6B21A8` sobre `#D97706` | 3.19 / 2.74 ✗ | el dorado solo se usa de fondo, con `--color-text` encima | 5.15 ✓ |
| Evidencia "mixta" | `#B5860B` sobre blanco | 3.29 ✗ | `#8A6508` | 5.32 ✓ |
| Errores de formulario | agosto no tenía color de error | — | token nuevo `--color-error: #B3261E` | 6.54 ✓ |

`--color-accent` (`#D97706`) se conserva **solo como color de fondo**. Cuando el dorado tiene que ser texto o un ícono sobre fondo claro, se usa `--color-accent-text`.

## Decisión de secuenciación del menú

El spec define el menú final (Nuestra Clínica, Tecnologías, Instalaciones, Blog). Esas páginas no existen hasta las fases 4 y 5. Agregarlas al menú ahora dejaría cuatro enlaces rotos y haría fallar `npm run links`.

**En esta fase el menú conserva los ítems actuales**, solo re-estilizados. Cada fase posterior agrega su ítem cuando la página existe. `npm run links` es la verificación de que esto se respeta.

## Estructura de archivos

**Se crean:**

| Archivo | Responsabilidad |
|---|---|
| `src/lib/contrast.ts` | Cálculo de ratio de contraste WCAG 2.1. Sin dependencias. |
| `src/lib/contrast.test.ts` | Pruebas del cálculo contra valores conocidos. |
| `src/lib/palette.ts` | La paleta como objeto TS: única fuente de verdad de los hex. |
| `src/lib/palette.test.ts` | Verifica cada par de color en uso contra WCAG AA. |
| `src/lib/motion.ts` | `prefersReducedMotion()` e `initParallax()`. |
| `src/lib/motion.test.ts` | Verifica que el parallax no se inicializa con movimiento reducido. |
| `src/lib/appointment.ts` | Tipos, validación por paso y armado del mensaje del asistente. |
| `src/lib/appointment.test.ts` | Pruebas de validación y del mensaje. |
| `src/components/booking/AppointmentWizard.astro` | Marcado de los 5 pasos más la confirmación. |
| `src/components/booking/wizard.ts` | Script de isla: navegación entre pasos, errores, envío. |
| `public/llms.txt` | Descripción del sitio para modelos de lenguaje. |

**Se modifican:**

| Archivo | Cambio |
|---|---|
| `package.json` | Fuentes fontsource y GSAP. |
| `src/styles/global.css` | Tokens `@theme` y capa base. |
| `src/data/site.ts` | Array `locations` con las dos sedes reales. |
| `src/components/Button.astro` | Variantes con los pares de contraste corregidos. |
| `src/components/Header.astro` | Colores nuevos; hover con texto oscuro sobre dorado. |
| `src/components/TopBar.astro`, `Footer.astro` | Colores y tipografía nuevos. |
| `src/layouts/Base.astro` | Carga diferida de GSAP y del parallax. |
| `src/pages/contactenos.astro` | `ContactForm` reemplazado por `AppointmentWizard`. |
| `src/pages/index.astro`, `src/components/home/*.astro` | Colores nuevos y ganchos de parallax. |

`src/components/ContactForm.astro` **no se borra**: lo siguen usando el Inicio y Beneficios como formulario corto. El asistente de 5 pasos es solo para Contáctenos.

---

### Tarea 1: Utilidad de contraste WCAG

**Archivos:**
- Crear: `src/lib/contrast.ts`
- Test: `src/lib/contrast.test.ts`

**Interfaces:**
- Consume: nada.
- Produce: `contrastRatio(hexA: string, hexB: string): number` y `relativeLuminance(hex: string): number`.

- [ ] **Paso 1: Escribir la prueba que falla**

Crear `src/lib/contrast.test.ts`:

```ts
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
```

- [ ] **Paso 2: Correr la prueba y verificar que falla**

Ejecutar: `npm run test -- src/lib/contrast.test.ts`
Esperado: FALLA con "Failed to resolve import './contrast'".

- [ ] **Paso 3: Escribir la implementación mínima**

Crear `src/lib/contrast.ts`:

```ts
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
```

- [ ] **Paso 4: Correr la prueba y verificar que pasa**

Ejecutar: `npm run test -- src/lib/contrast.test.ts`
Esperado: PASA, 6 pruebas.

- [ ] **Paso 5: Commit**

```bash
git add src/lib/contrast.ts src/lib/contrast.test.ts
git commit -m "feat: utilidad de contraste WCAG para verificar la paleta"
```

---

### Tarea 2: Paleta con pruebas de contraste

**Archivos:**
- Crear: `src/lib/palette.ts`
- Test: `src/lib/palette.test.ts`

**Interfaces:**
- Consume: `contrastRatio` de la Tarea 1.
- Produce: `palette` (objeto de solo lectura con los hex) y el tipo `ColorName = keyof typeof palette`.

- [ ] **Paso 1: Escribir la prueba que falla**

Crear `src/lib/palette.test.ts`. Los ratios esperados están calculados y verificados; si alguien cambia un hex, esta prueba dice exactamente qué par rompió.

```ts
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
```

- [ ] **Paso 2: Correr la prueba y verificar que falla**

Ejecutar: `npm run test -- src/lib/palette.test.ts`
Esperado: FALLA con "Failed to resolve import './palette'".

- [ ] **Paso 3: Escribir la implementación mínima**

Crear `src/lib/palette.ts`:

```ts
// Fuente única de verdad de los colores. `global.css` repite estos valores en su bloque
// `@theme` porque Tailwind necesita literales en CSS; `palette.test.ts` verifica que los
// pares que el diseño usa cumplan WCAG AA.
//
// Tomados del entregable de agosto, con tres correcciones de contraste documentadas en
// docs/superpowers/plans/2026-09-08-fase-1-sistema-de-diseno.md
export const palette = {
  primary: '#6B21A8',
  primaryDark: '#4C1578',
  // Solo como color de FONDO: con texto blanco o púrpura encima no llega a AA.
  accent: '#D97706',
  accentLight: '#F3C57A',
  // El dorado cuando tiene que ser texto o ícono sobre fondo claro.
  accentText: '#B45309',
  text: '#241B33',
  bg: '#FBF9F6',
  bgAlt: '#F3EEF9',
  white: '#FFFFFF',
  border: '#E4DCEF',
  evidenceStrong: '#1E7A4C',
  // Agosto traía #B5860B (3.29 sobre blanco); oscurecido para llegar a AA.
  evidenceMixed: '#8A6508',
  evidenceClinical: '#6B21A8',
  // Los errores de formulario necesitan su propio color: reusar el dorado de "evidencia
  // mixta" mezclaría dos significados distintos en la misma señal visual.
  error: '#B3261E',
  // Verdes de marca de WhatsApp: no son parte de la paleta, se conservan del repo.
  whatsapp: '#25D366',
  chat: '#3AD18C',
} as const;

export type ColorName = keyof typeof palette;
```

- [ ] **Paso 4: Correr la prueba y verificar que pasa**

Ejecutar: `npm run test -- src/lib/palette.test.ts`
Esperado: PASA, 18 pruebas.

- [ ] **Paso 5: Commit**

```bash
git add src/lib/palette.ts src/lib/palette.test.ts
git commit -m "feat: paleta del diseño de agosto con contraste verificado"
```

---

### Tarea 3: Tokens y capa base en CSS

**Archivos:**
- Modificar: `package.json`
- Modificar: `src/styles/global.css`

**Interfaces:**
- Consume: los hex de `src/lib/palette.ts` (copiados como literales).
- Produce: clases utilitarias de Tailwind `text-primary`, `bg-accent`, `text-accent-text`, `bg-bg-alt`, `font-display`, `font-body`, y la utilidad `container-site` (que ya existía).

- [ ] **Paso 1: Instalar las fuentes y GSAP, quitar Montserrat**

```bash
npm uninstall @fontsource-variable/montserrat
npm install @fontsource-variable/fraunces@5.3.0 @fontsource-variable/work-sans@5.3.0 gsap@3.15.0
```

- [ ] **Paso 2: Reemplazar el bloque `@theme` y la capa base**

Reemplazar el contenido completo de `src/styles/global.css` por:

```css
@import 'tailwindcss';
@import '@fontsource-variable/fraunces';
@import '@fontsource-variable/work-sans';

/* Los hex de aquí se mantienen sincronizados a mano con src/lib/palette.ts, que es donde
   las pruebas verifican el contraste. Si cambiás uno, cambialo en ambos lados. */
@theme {
  --color-primary: #6b21a8;
  --color-primary-dark: #4c1578;
  /* Solo como fondo. Para dorado como texto sobre fondo claro usá --color-accent-text. */
  --color-accent: #d97706;
  --color-accent-light: #f3c57a;
  --color-accent-text: #b45309;
  --color-text: #241b33;
  --color-bg: #fbf9f6;
  --color-bg-alt: #f3eef9;
  --color-secondary: #ffffff;
  --color-border-soft: #e4dcef;
  --color-evidence-strong: #1e7a4c;
  --color-evidence-mixed: #8a6508;
  --color-evidence-clinical: #6b21a8;
  --color-error: #b3261e;
  --color-whatsapp: #25d366;
  --color-chat: #3ad18c;

  --font-display: 'Fraunces Variable', Georgia, 'Times New Roman', serif;
  --font-body: 'Work Sans Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  --radius-sm: 10px;
  --radius-md: 18px;
  --radius-lg: 28px;

  --shadow-soft: 0 2px 10px rgba(36, 27, 51, 0.06);
  --shadow-lifted: 0 12px 32px rgba(36, 27, 51, 0.12);
}

@layer base {
  html {
    font-family: var(--font-body);
    color: var(--color-text);
    scroll-behavior: smooth;
    /* Safari en iPhone agranda el texto al girar el teléfono si no se fija. */
    -webkit-text-size-adjust: 100%;
    /* El header es sticky: sin esto los anclajes quedan escondidos debajo de él. */
    scroll-padding-top: 5rem;
  }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
  }
  body {
    background: var(--color-bg);
    /* Base de 18px e interlínea holgada: el público de la clínica incluye personas adultas
       mayores, y el entregable de agosto lo fija como requisito de accesibilidad. */
    font-size: 1.125rem;
    line-height: 1.65;
    /* Red de seguridad contra un desborde puntual en pantallas muy angostas. Se usa `clip`
       y no `hidden` porque `hidden` convertiría al body en contenedor de scroll y rompería
       el `position: sticky` del header. */
    overflow-x: clip;
    -webkit-tap-highlight-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    color: var(--color-primary-dark);
    font-weight: 600;
    line-height: 1.2;
  }
  /* Los títulos grandes no caben en una palabra en pantallas angostas. */
  h1, h2, h3 { overflow-wrap: break-word; }
  /* Medida de lectura cómoda; las clases de Tailwind la pueden anular donde estorbe. */
  p { max-width: 68ch; }
  img { max-width: 100%; height: auto; }
  /* Foco dorado visible sobre cualquier fondo del sitio. */
  a:focus-visible, button:focus-visible, input:focus-visible,
  textarea:focus-visible, select:focus-visible, [tabindex]:focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@utility container-site {
  width: 100%;
  max-width: 1140px;
  margin-inline: auto;
  padding-inline: 15px;
}
```

- [ ] **Paso 3: Verificar que el proyecto compila**

Ejecutar: `npm run check && npm run build`
Esperado: ambos terminan sin errores. `astro check` puede reportar avisos previos del repo, pero ningún error nuevo.

- [ ] **Paso 4: Confirmar que Montserrat ya no aparece**

Ejecutar: `grep -rn "montserrat\|Montserrat" src/ package.json`
Esperado: sin resultados.

- [ ] **Paso 5: Commit**

```bash
git add package.json package-lock.json src/styles/global.css
git commit -m "feat: tokens y capa base del diseño de agosto"
```

---

### Tarea 4: Parallax con GSAP y guarda de movimiento reducido

**Archivos:**
- Crear: `src/lib/motion.ts`
- Test: `src/lib/motion.test.ts`
- Modificar: `src/layouts/Base.astro`

**Interfaces:**
- Consume: `gsap` y `gsap/ScrollTrigger`.
- Produce: `prefersReducedMotion(): boolean` e `initParallax(gsapLike: GsapLike): void`. `initParallax` recibe GSAP por parámetro para poder probarla sin cargar la librería real.

- [ ] **Paso 1: Escribir la prueba que falla**

Crear `src/lib/motion.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initParallax, prefersReducedMotion } from './motion';

function stubMatchMedia(reduce: boolean) {
  vi.stubGlobal('window', {
    matchMedia: (query: string) => ({ matches: reduce && query.includes('reduce') }),
  });
}

function fakeGsap() {
  return {
    registerPlugin: vi.fn(),
    fromTo: vi.fn(),
  };
}

describe('motion', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('detecta la preferencia de movimiento reducido', () => {
    stubMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
    stubMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it('no anima nada si el usuario pidió movimiento reducido', () => {
    stubMatchMedia(true);
    vi.stubGlobal('document', { querySelectorAll: () => [] });
    const g = fakeGsap();
    initParallax(g);
    expect(g.registerPlugin).not.toHaveBeenCalled();
    expect(g.fromTo).not.toHaveBeenCalled();
  });

  it('anima un elemento por cada [data-parallax] cuando el movimiento está permitido', () => {
    stubMatchMedia(false);
    const nodes = [{ id: 'a' }, { id: 'b' }];
    vi.stubGlobal('document', { querySelectorAll: vi.fn(() => nodes) });
    const g = fakeGsap();
    initParallax(g);
    expect(g.registerPlugin).toHaveBeenCalledTimes(1);
    expect(g.fromTo).toHaveBeenCalledTimes(2);
  });

  it('no falla si no hay elementos con [data-parallax]', () => {
    stubMatchMedia(false);
    vi.stubGlobal('document', { querySelectorAll: () => [] });
    const g = fakeGsap();
    expect(() => initParallax(g)).not.toThrow();
    expect(g.fromTo).not.toHaveBeenCalled();
  });
});
```

- [ ] **Paso 2: Correr la prueba y verificar que falla**

Ejecutar: `npm run test -- src/lib/motion.test.ts`
Esperado: FALLA con "Failed to resolve import './motion'".

- [ ] **Paso 3: Escribir la implementación mínima**

Crear `src/lib/motion.ts`:

```ts
// Parallax sutil del diseño de agosto. La animación es decorativa: si el usuario pidió
// movimiento reducido (WCAG 2.2, criterio 2.3.3), no se inicializa nada y la página se ve
// completa y estática. `initParallax` recibe GSAP por parámetro para poder probarla sin
// cargar la librería.

export interface GsapLike {
  registerPlugin: (...plugins: unknown[]) => void;
  fromTo: (target: unknown, from: object, to: object) => unknown;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initParallax(gsapLike: GsapLike, scrollTrigger?: unknown): void {
  if (prefersReducedMotion()) return;

  const targets = Array.from(document.querySelectorAll('[data-parallax]'));
  if (targets.length === 0) return;

  gsapLike.registerPlugin(scrollTrigger);

  for (const el of targets) {
    gsapLike.fromTo(
      el,
      { scale: 1.08, yPercent: -4 },
      {
        scale: 1,
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      },
    );
  }
}
```

- [ ] **Paso 4: Correr la prueba y verificar que pasa**

Ejecutar: `npm run test -- src/lib/motion.test.ts`
Esperado: PASA, 4 pruebas.

- [ ] **Paso 5: Cargar GSAP de forma diferida en el layout**

En `src/layouts/Base.astro`, agregar antes de `</body>` (después de `<WhatsAppButton />`):

```astro
<script>
  import { initParallax, prefersReducedMotion } from '../lib/motion';

  // GSAP pesa ~50 KB y solo sirve para un efecto decorativo: no se descarga si el usuario
  // pidió movimiento reducido o si la página no tiene ningún elemento con [data-parallax].
  if (!prefersReducedMotion() && document.querySelector('[data-parallax]')) {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    initParallax(gsap, ScrollTrigger);
  }
</script>
```

- [ ] **Paso 6: Verificar que compila y que GSAP queda en un bundle aparte**

Ejecutar: `npm run build && grep -rl "ScrollTrigger" dist/_astro/ | head`
Esperado: el build pasa y GSAP aparece en un archivo propio de `dist/_astro/`, no dentro del bundle principal.

- [ ] **Paso 7: Commit**

```bash
git add src/lib/motion.ts src/lib/motion.test.ts src/layouts/Base.astro
git commit -m "feat: parallax con GSAP, diferido y respetando movimiento reducido"
```

---

### Tarea 5: Botones con los pares de contraste corregidos

**Archivos:**
- Modificar: `src/components/Button.astro`

**Interfaces:**
- Consume: las clases de Tailwind de la Tarea 3.
- Produce: `<Button href variant shape caps class target>` con `variant` de tipo `'accent' | 'primary' | 'white' | 'chat' | 'appointment'` (los mismos nombres de antes, para no tocar las 30+ llamadas existentes).

- [ ] **Paso 1: Reemplazar el mapa de estilos**

En `src/components/Button.astro`, reemplazar el objeto `styles` por:

```ts
// El dorado (--color-accent) solo llega a AA con texto oscuro encima: 5.15 contra
// --color-text, pero 3.19 contra blanco y 2.74 contra púrpura. Por eso todas las
// variantes doradas llevan `text-text` y ninguna `text-white` ni `text-primary`.
const styles = {
  accent: 'bg-accent text-text hover:bg-accent-light',
  primary: 'bg-primary text-secondary hover:bg-primary-dark',
  white: 'bg-secondary text-primary hover:bg-accent hover:text-text',
  chat: 'bg-chat text-text hover:bg-whatsapp',
  appointment: 'bg-accent text-text hover:bg-accent-light',
};
```

- [ ] **Paso 2: Ajustar tipografía y radio del botón**

En el mismo archivo, reemplazar la primera clase del `class:list` por:

```
'inline-flex items-center gap-2 px-7 py-3 text-[15px] font-semibold transition-colors',
```

y la línea de forma por:

```
shape === 'pill' ? 'rounded-full' : 'rounded-[var(--radius-sm)]',
```

- [ ] **Paso 3: Verificar que compila y que no quedó texto blanco sobre dorado**

Ejecutar: `npm run check && grep -n "bg-accent" src/components/Button.astro`
Esperado: `astro check` sin errores nuevos, y ninguna línea con `bg-accent` acompañada de `text-white` o `text-primary`.

- [ ] **Paso 4: Commit**

```bash
git add src/components/Button.astro
git commit -m "fix: botones dorados con texto oscuro para cumplir AA"
```

---

### Tarea 6: Header, TopBar y Footer con la paleta nueva

**Archivos:**
- Modificar: `src/components/Header.astro`
- Modificar: `src/components/TopBar.astro`
- Modificar: `src/components/Footer.astro`

**Interfaces:**
- Consume: las clases de la Tarea 3.
- Produce: sin cambios de API. El menú conserva los mismos ítems (ver "Decisión de secuenciación del menú").

- [ ] **Paso 1: Corregir el hover del menú en Header.astro**

En `src/components/Header.astro`, el enlace de cada ítem usa hoy `hover:bg-accent hover:text-primary`, que da 2.74 de contraste. Reemplazar las dos apariciones de `hover:bg-accent hover:text-primary` por `hover:bg-accent hover:text-text`, y las dos de `isActive(...) && 'bg-accent text-primary'` por `isActive(...) && 'bg-accent text-text'`.

Ejecutar para encontrarlas: `grep -n "bg-accent" src/components/Header.astro`

- [ ] **Paso 2: Subir el tamaño del texto del menú**

En el mismo archivo, reemplazar `lg:text-[12px]` por `lg:text-[14px]` y `text-[13px]` por `text-[15px]` en los enlaces del menú y del submenú. La base accesible del diseño de agosto es 18px; 12px en el menú principal la contradice.

- [ ] **Paso 3: Aplicar la paleta a TopBar y Footer**

En `src/components/TopBar.astro` y `src/components/Footer.astro`, reemplazar las referencias a los colores viejos: `purple-dark` pasa a `primary-dark`, y cualquier `text-accent-dark` pasa a `text-accent-text`.

Ejecutar para encontrarlas: `grep -n "purple-dark\|accent-dark" src/components/TopBar.astro src/components/Footer.astro`

- [ ] **Paso 4: Verificar que no quedaron tokens viejos en todo el repo**

Ejecutar: `grep -rn "purple-dark\|accent-dark\|color-slide" src/`
Esperado: sin resultados. Si aparece alguno en otro componente, corregirlo igual.

- [ ] **Paso 5: Verificar compilación y enlaces**

Ejecutar: `npm run check && npm run build && npm run links`
Esperado: los tres pasan.

- [ ] **Paso 6: Commit**

```bash
git add src/components/Header.astro src/components/TopBar.astro src/components/Footer.astro
git commit -m "feat: header, barra superior y pie con la paleta de agosto"
```

---

### Tarea 7: Lógica del asistente de agenda

**Archivos:**
- Crear: `src/lib/appointment.ts`
- Test: `src/lib/appointment.test.ts`
- Modificar: `src/data/site.ts`

**Interfaces:**
- Consume: `WHATSAPP_NUMBER` de `src/lib/whatsapp.ts`.
- Produce:
  - `interface WizardData { servicio; profesional; sede; fecha; hora; nombre; email; celular; mensaje; consentimiento; origen }` — todos `string` salvo `consentimiento: boolean`.
  - `interface FieldError { field: keyof WizardData; message: string }`
  - `validateStep(step: 1|2|3|4|5, data: Partial<WizardData>, today?: Date): FieldError[]`
  - `buildWizardMessage(data: WizardData): string`
  - `buildWizardUrl(data: WizardData): string`
  - `STEP_FIELDS: Record<1|2|3|4|5, Array<keyof WizardData>>`

- [ ] **Paso 1: Agregar las dos sedes reales a site.ts**

En `src/data/site.ts`, agregar dentro del objeto `site`, después de `addresses`:

```ts
  locations: [
    { id: 'guadalupe', label: 'Guadalupe, San José (sede principal)' },
    { id: 'la-catolica', label: 'Edificio sur del Hospital La Católica, Guadalupe' },
  ],
```

El entregable de agosto asumía una sola sede; el repo ya documenta dos direcciones distintas de atención.

- [ ] **Paso 2: Escribir la prueba que falla**

Crear `src/lib/appointment.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildWizardMessage, buildWizardUrl, validateStep, type WizardData } from './appointment';

const full: WizardData = {
  servicio: 'Podología',
  profesional: 'Dr. Marvin Madrigal Chaves',
  sede: 'Guadalupe, San José (sede principal)',
  fecha: '2026-09-15',
  hora: '10:00 am',
  nombre: 'Ana Mora',
  email: 'ana@example.com',
  celular: '88881234',
  mensaje: 'Uña dolorosa hace dos semanas',
  consentimiento: true,
  origen: '/hongos-unas-onicomicosis/',
};

const hoy = new Date('2026-09-08T12:00:00Z');

describe('validateStep', () => {
  it('paso 1 exige servicio', () => {
    expect(validateStep(1, { servicio: '' })).toEqual([
      { field: 'servicio', message: 'Elegí un servicio para continuar.' },
    ]);
    expect(validateStep(1, { servicio: 'Podología' })).toEqual([]);
  });

  it('paso 2 no exige nada: el profesional es opcional', () => {
    expect(validateStep(2, {})).toEqual([]);
  });

  it('paso 3 exige sede', () => {
    expect(validateStep(3, { sede: '' })).toHaveLength(1);
    expect(validateStep(3, { sede: 'Guadalupe, San José (sede principal)' })).toEqual([]);
  });

  it('paso 4 exige fecha y hora', () => {
    expect(validateStep(4, { fecha: '', hora: '' }, hoy)).toHaveLength(2);
    expect(validateStep(4, { fecha: '2026-09-15', hora: '10:00 am' }, hoy)).toEqual([]);
  });

  it('paso 4 rechaza una fecha pasada', () => {
    expect(validateStep(4, { fecha: '2026-09-07', hora: '10:00 am' }, hoy)).toEqual([
      { field: 'fecha', message: 'Elegí una fecha de hoy en adelante.' },
    ]);
  });

  it('paso 4 acepta la fecha de hoy', () => {
    expect(validateStep(4, { fecha: '2026-09-08', hora: '10:00 am' }, hoy)).toEqual([]);
  });

  it('paso 5 valida nombre, correo, celular y consentimiento', () => {
    const errors = validateStep(5, { nombre: 'A', email: 'no-es-correo', celular: '123', consentimiento: false });
    expect(errors.map((e) => e.field)).toEqual(['nombre', 'email', 'celular', 'consentimiento']);
  });

  it('paso 5 exige exactamente 8 dígitos de celular', () => {
    const base = { nombre: 'Ana Mora', email: 'ana@example.com', consentimiento: true };
    expect(validateStep(5, { ...base, celular: '88881234' })).toEqual([]);
    expect(validateStep(5, { ...base, celular: '888812345' })).toHaveLength(1);
    expect(validateStep(5, { ...base, celular: '8888-1234' })).toHaveLength(1);
  });

  it('paso 5 pasa con datos completos', () => {
    expect(validateStep(5, full)).toEqual([]);
  });
});

describe('buildWizardMessage', () => {
  it('arma el mensaje con una línea por campo', () => {
    expect(buildWizardMessage(full)).toBe(
      [
        'Hola, quiero agendar una cita.',
        'Servicio: Podología',
        'Profesional: Dr. Marvin Madrigal Chaves',
        'Sede: Guadalupe, San José (sede principal)',
        'Fecha: 2026-09-15',
        'Hora: 10:00 am',
        'Nombre: Ana Mora',
        'Correo: ana@example.com',
        'Celular: 88881234',
        'Mensaje: Uña dolorosa hace dos semanas',
      ].join('\n'),
    );
  });

  it('omite los campos opcionales vacíos', () => {
    const msg = buildWizardMessage({ ...full, profesional: '', mensaje: '   ' });
    expect(msg).not.toContain('Profesional:');
    expect(msg).not.toContain('Mensaje:');
    expect(msg).toContain('Servicio: Podología');
  });

  it('no incluye el origen: es para analítica, no para el paciente', () => {
    expect(buildWizardMessage(full)).not.toContain('/hongos-unas-onicomicosis/');
  });
});

describe('buildWizardUrl', () => {
  it('genera una URL wa.me codificada al número de la clínica', () => {
    const url = buildWizardUrl(full);
    expect(url.startsWith('https://wa.me/50683056444?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1])).toBe(buildWizardMessage(full));
    expect(url).not.toContain('\n');
  });
});
```

- [ ] **Paso 3: Correr la prueba y verificar que falla**

Ejecutar: `npm run test -- src/lib/appointment.test.ts`
Esperado: FALLA con "Failed to resolve import './appointment'".

- [ ] **Paso 4: Escribir la implementación mínima**

Crear `src/lib/appointment.ts`:

```ts
// Asistente de agenda de 5 pasos. No hay backend: al terminar se abre WhatsApp con el
// resumen para que el equipo coordine la cita. La validación vive acá, separada del
// componente, para poder probarla sin navegador.
import { WHATSAPP_NUMBER } from './whatsapp';

export interface WizardData {
  servicio: string;
  profesional: string;
  sede: string;
  fecha: string;
  hora: string;
  nombre: string;
  email: string;
  celular: string;
  mensaje: string;
  consentimiento: boolean;
  origen: string;
}

export type Step = 1 | 2 | 3 | 4 | 5;

export interface FieldError {
  field: keyof WizardData;
  message: string;
}

export const STEP_FIELDS: Record<Step, Array<keyof WizardData>> = {
  1: ['servicio'],
  2: ['profesional'],
  3: ['sede'],
  4: ['fecha', 'hora'],
  5: ['nombre', 'email', 'celular', 'mensaje', 'consentimiento'],
};

const isBlank = (v: unknown): boolean => typeof v !== 'string' || v.trim() === '';

// Compara solo la parte de fecha, para que "hoy" siga siendo válido a cualquier hora.
function isPastDate(value: string, today: Date): boolean {
  const limit = today.toISOString().slice(0, 10);
  return value < limit;
}

export function validateStep(step: Step, data: Partial<WizardData>, today: Date = new Date()): FieldError[] {
  const errors: FieldError[] = [];
  const add = (field: keyof WizardData, message: string) => errors.push({ field, message });

  if (step === 1 && isBlank(data.servicio)) {
    add('servicio', 'Elegí un servicio para continuar.');
  }

  // Paso 2: el profesional es opcional a propósito — el equipo asigna según disponibilidad.

  if (step === 3 && isBlank(data.sede)) {
    add('sede', 'Elegí la sede donde querés que te atiendan.');
  }

  if (step === 4) {
    if (isBlank(data.fecha)) add('fecha', 'Elegí una fecha preferida.');
    else if (isPastDate(data.fecha!, today)) add('fecha', 'Elegí una fecha de hoy en adelante.');
    if (isBlank(data.hora)) add('hora', 'Elegí un horario preferido.');
  }

  if (step === 5) {
    if (isBlank(data.nombre) || data.nombre!.trim().length < 2) {
      add('nombre', 'Ingresá tu nombre (mínimo 2 caracteres).');
    }
    if (isBlank(data.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email!.trim())) {
      add('email', 'Ingresá un correo válido.');
    }
    if (isBlank(data.celular) || !/^\d{8}$/.test(data.celular!.trim())) {
      add('celular', 'Ingresá un celular de 8 dígitos, sin espacios ni guiones.');
    }
    if (data.consentimiento !== true) {
      add('consentimiento', 'Necesitamos tu autorización para tratar tus datos y gestionar la cita.');
    }
  }

  return errors;
}

export function buildWizardMessage(data: WizardData): string {
  const lines = ['Hola, quiero agendar una cita.'];
  const push = (label: string, value: string) => {
    const v = (value ?? '').trim();
    if (v) lines.push(`${label}: ${v}`);
  };
  push('Servicio', data.servicio);
  push('Profesional', data.profesional);
  push('Sede', data.sede);
  push('Fecha', data.fecha);
  push('Hora', data.hora);
  push('Nombre', data.nombre);
  push('Correo', data.email);
  push('Celular', data.celular);
  push('Mensaje', data.mensaje);
  // `origen` queda fuera a propósito: sirve para saber de qué página vino la consulta,
  // no es información que el paciente tenga que ver en su propio mensaje.
  return lines.join('\n');
}

export function buildWizardUrl(data: WizardData): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWizardMessage(data))}`;
}
```

- [ ] **Paso 5: Correr la prueba y verificar que pasa**

Ejecutar: `npm run test -- src/lib/appointment.test.ts`
Esperado: PASA, 13 pruebas.

- [ ] **Paso 6: Correr toda la suite**

Ejecutar: `npm run test`
Esperado: pasan las pruebas nuevas y las que ya existían (`whatsapp`, `text`).

- [ ] **Paso 7: Commit**

```bash
git add src/lib/appointment.ts src/lib/appointment.test.ts src/data/site.ts
git commit -m "feat: validación y mensaje del asistente de agenda"
```

---

### Tarea 8: Marcado e isla del asistente

**Archivos:**
- Crear: `src/components/booking/AppointmentWizard.astro`
- Crear: `src/components/booking/wizard.ts`

**Interfaces:**
- Consume: `validateStep`, `buildWizardUrl`, `STEP_FIELDS`, `WizardData` de la Tarea 7; las colecciones `services` y `specialists`; `site.locations` de la Tarea 7.
- Produce: `<AppointmentWizard />` sin props.

- [ ] **Paso 1: Crear el marcado de los 5 pasos**

Crear `src/components/booking/AppointmentWizard.astro`:

```astro
---
import { getCollection } from 'astro:content';
import { site } from '../../data/site';

// Los servicios y los profesionales salen de las colecciones: si mañana se agrega uno,
// aparece en el asistente sin tocar este archivo.
const servicios = (await getCollection('services'))
  .sort((a, b) => a.data.order - b.data.order)
  .map((s) => s.data.menuLabel);

const profesionales = (await getCollection('specialists'))
  .filter((s) => s.data.group === 'clinico')
  .sort((a, b) => a.data.order - b.data.order)
  .map((s) => `${s.data.name} — ${s.data.role}`);

const horarios = ['9:00 am', '10:00 am', '11:00 am', '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm'];
const pasos = ['Servicio', 'Profesional', 'Sede', 'Fecha y hora', 'Tus datos'];
---
<form id="booking-form" novalidate class="rounded-[var(--radius-lg)] bg-secondary p-6 shadow-[var(--shadow-soft)] md:p-8">
  <ol class="mb-6 flex flex-wrap gap-2" aria-label="Pasos del formulario">
    {pasos.map((p, i) => (
      <li
        data-step={i + 1}
        class="step-pill rounded-full border border-border-soft px-4 py-1.5 text-[14px] font-semibold text-text/70"
      >{i + 1}. {p}</li>
    ))}
  </ol>

  {/* Región que anuncia los errores a los lectores de pantalla al intentar avanzar. */}
  <p data-wizard-status role="status" aria-live="polite" class="sr-only"></p>

  <fieldset data-panel="1" class="border-0 p-0">
    <legend class="mb-3 text-[20px] font-semibold text-primary-dark">¿Qué servicio necesitás?</legend>
    <label class="block">
      <span class="mb-1 block font-medium">Servicio</span>
      <select name="servicio" aria-describedby="err-servicio" class="w-full rounded-[var(--radius-sm)] border border-border-soft bg-secondary px-4 py-3 text-[16px]">
        <option value="">Seleccioná un servicio</option>
        {servicios.map((s) => <option value={s}>{s}</option>)}
      </select>
    </label>
    <p id="err-servicio" data-error-for="servicio" hidden class="mt-1 text-[15px] font-medium text-error"></p>
    <div class="mt-5 flex flex-wrap gap-3">
      <button type="button" data-next="2" class="rounded-[var(--radius-sm)] bg-primary px-7 py-3 font-semibold text-secondary hover:bg-primary-dark">Continuar</button>
    </div>
  </fieldset>

  <fieldset data-panel="2" hidden class="border-0 p-0">
    <legend class="mb-3 text-[20px] font-semibold text-primary-dark">¿Preferís algún profesional?</legend>
    <label class="block">
      <span class="mb-1 block font-medium">Profesional (opcional)</span>
      <select name="profesional" class="w-full rounded-[var(--radius-sm)] border border-border-soft bg-secondary px-4 py-3 text-[16px]">
        <option value="">Sin preferencia — el equipo asigna según disponibilidad</option>
        {profesionales.map((p) => <option value={p}>{p}</option>)}
      </select>
    </label>
    <div class="mt-5 flex flex-wrap gap-3">
      <button type="button" data-prev="1" class="rounded-[var(--radius-sm)] border border-primary px-7 py-3 font-semibold text-primary">Atrás</button>
      <button type="button" data-next="3" class="rounded-[var(--radius-sm)] bg-primary px-7 py-3 font-semibold text-secondary hover:bg-primary-dark">Continuar</button>
    </div>
  </fieldset>

  <fieldset data-panel="3" hidden class="border-0 p-0">
    <legend class="mb-3 text-[20px] font-semibold text-primary-dark">¿En cuál sede?</legend>
    <label class="block">
      <span class="mb-1 block font-medium">Sede</span>
      <select name="sede" aria-describedby="err-sede" class="w-full rounded-[var(--radius-sm)] border border-border-soft bg-secondary px-4 py-3 text-[16px]">
        <option value="">Seleccioná una sede</option>
        {site.locations.map((l) => <option value={l.label}>{l.label}</option>)}
      </select>
    </label>
    <p id="err-sede" data-error-for="sede" hidden class="mt-1 text-[15px] font-medium text-error"></p>
    <div class="mt-5 flex flex-wrap gap-3">
      <button type="button" data-prev="2" class="rounded-[var(--radius-sm)] border border-primary px-7 py-3 font-semibold text-primary">Atrás</button>
      <button type="button" data-next="4" class="rounded-[var(--radius-sm)] bg-primary px-7 py-3 font-semibold text-secondary hover:bg-primary-dark">Continuar</button>
    </div>
  </fieldset>

  <fieldset data-panel="4" hidden class="border-0 p-0">
    <legend class="mb-3 text-[20px] font-semibold text-primary-dark">¿Cuándo te queda bien?</legend>
    <label class="block">
      <span class="mb-1 block font-medium">Fecha preferida</span>
      <input type="date" name="fecha" aria-describedby="err-fecha" class="w-full rounded-[var(--radius-sm)] border border-border-soft bg-secondary px-4 py-3 text-[16px]" />
    </label>
    <p id="err-fecha" data-error-for="fecha" hidden class="mt-1 text-[15px] font-medium text-error"></p>
    <label class="mt-4 block">
      <span class="mb-1 block font-medium">Hora preferida</span>
      <select name="hora" aria-describedby="err-hora" class="w-full rounded-[var(--radius-sm)] border border-border-soft bg-secondary px-4 py-3 text-[16px]">
        <option value="">Seleccioná un horario</option>
        {horarios.map((h) => <option value={h}>{h}</option>)}
      </select>
    </label>
    <p id="err-hora" data-error-for="hora" hidden class="mt-1 text-[15px] font-medium text-error"></p>
    <p class="mt-3 text-[15px] text-text/80">Es una preferencia: el equipo confirma el horario final según la agenda real.</p>
    <div class="mt-5 flex flex-wrap gap-3">
      <button type="button" data-prev="3" class="rounded-[var(--radius-sm)] border border-primary px-7 py-3 font-semibold text-primary">Atrás</button>
      <button type="button" data-next="5" class="rounded-[var(--radius-sm)] bg-primary px-7 py-3 font-semibold text-secondary hover:bg-primary-dark">Continuar</button>
    </div>
  </fieldset>

  <fieldset data-panel="5" hidden class="border-0 p-0">
    <legend class="mb-3 text-[20px] font-semibold text-primary-dark">¿Cómo te contactamos?</legend>
    <label class="block">
      <span class="mb-1 block font-medium">Tu nombre completo</span>
      <input type="text" name="nombre" autocomplete="name" aria-describedby="err-nombre" class="w-full rounded-[var(--radius-sm)] border border-border-soft bg-secondary px-4 py-3 text-[16px]" />
    </label>
    <p id="err-nombre" data-error-for="nombre" hidden class="mt-1 text-[15px] font-medium text-error"></p>
    <label class="mt-4 block">
      <span class="mb-1 block font-medium">Correo electrónico</span>
      <input type="email" name="email" autocomplete="email" aria-describedby="err-email" class="w-full rounded-[var(--radius-sm)] border border-border-soft bg-secondary px-4 py-3 text-[16px]" />
    </label>
    <p id="err-email" data-error-for="email" hidden class="mt-1 text-[15px] font-medium text-error"></p>
    <label class="mt-4 block">
      <span class="mb-1 block font-medium">Celular (8 dígitos)</span>
      <input type="tel" name="celular" inputmode="numeric" autocomplete="tel" aria-describedby="err-celular" class="w-full rounded-[var(--radius-sm)] border border-border-soft bg-secondary px-4 py-3 text-[16px]" />
    </label>
    <p id="err-celular" data-error-for="celular" hidden class="mt-1 text-[15px] font-medium text-error"></p>
    <label class="mt-4 block">
      <span class="mb-1 block font-medium">Contanos brevemente tu consulta (opcional)</span>
      <textarea name="mensaje" rows="4" maxlength="500" class="w-full rounded-[var(--radius-sm)] border border-border-soft bg-secondary px-4 py-3 text-[16px]"></textarea>
    </label>
    <label class="mt-4 flex items-start gap-3">
      <input type="checkbox" name="consentimiento" aria-describedby="err-consentimiento" class="mt-1.5 h-5 w-5 shrink-0" />
      <span>Autorizo a Clínica Angular a usar estos datos para coordinar mi cita.</span>
    </label>
    <p id="err-consentimiento" data-error-for="consentimiento" hidden class="mt-1 text-[15px] font-medium text-error"></p>
    <input type="hidden" name="origen" value="" />
    <div class="mt-5 flex flex-wrap gap-3">
      <button type="button" data-prev="4" class="rounded-[var(--radius-sm)] border border-primary px-7 py-3 font-semibold text-primary">Atrás</button>
      <button type="submit" class="rounded-[var(--radius-sm)] bg-accent px-7 py-3 font-semibold text-text hover:bg-accent-light">Preparar mi solicitud</button>
    </div>
  </fieldset>

  {/* Copy deliberado: NO dice que la cita quedó registrada. No hay backend — el mensaje de
      WhatsApp es el único canal por el que esta solicitud llega a la clínica. */}
  <div data-panel="confirmacion" hidden tabindex="-1" class="border-0 p-0">
    <div class="rounded-[var(--radius-md)] bg-bg-alt p-6">
      <h3 class="text-[22px]">Tu resumen está listo</h3>
      <p class="mt-2">Todavía no enviaste nada. Tocá el botón para abrir WhatsApp con estos datos ya escritos: la cita se coordina por ese chat.</p>
      <p data-resumen class="mt-3 font-semibold"></p>
    </div>
    <div class="mt-5 flex flex-wrap gap-3">
      <a data-wizard-send href="#" target="_blank" rel="noopener" class="rounded-[var(--radius-sm)] bg-whatsapp px-7 py-3 font-semibold text-text">Enviar por WhatsApp</a>
      <button type="button" data-prev="5" class="rounded-[var(--radius-sm)] border border-primary px-7 py-3 font-semibold text-primary">Corregir datos</button>
    </div>
  </div>
</form>

<script>
  import { initWizard } from './wizard';
  initWizard();
</script>
```

- [ ] **Paso 2: Crear el script de isla**

Crear `src/components/booking/wizard.ts`:

```ts
// Navegación entre pasos del asistente. La validación y el armado del mensaje viven en
// src/lib/appointment.ts, que sí tiene pruebas; acá solo queda el manejo del DOM.
import { STEP_FIELDS, buildWizardUrl, validateStep, type Step, type WizardData } from '../../lib/appointment';

export function initWizard(): void {
  const form = document.getElementById('booking-form') as HTMLFormElement | null;
  if (!form) return;

  const status = form.querySelector<HTMLElement>('[data-wizard-status]')!;
  const panels = form.querySelectorAll<HTMLElement>('[data-panel]');
  const pills = form.querySelectorAll<HTMLElement>('.step-pill');

  function readData(): WizardData {
    const value = (name: string) => form!.querySelector<HTMLInputElement>(`[name="${name}"]`)?.value ?? '';
    return {
      servicio: value('servicio'),
      profesional: value('profesional'),
      sede: value('sede'),
      fecha: value('fecha'),
      hora: value('hora'),
      nombre: value('nombre'),
      email: value('email'),
      celular: value('celular'),
      mensaje: value('mensaje'),
      consentimiento: form!.querySelector<HTMLInputElement>('[name="consentimiento"]')?.checked ?? false,
      origen: value('origen'),
    };
  }

  function clearErrors(step: Step): void {
    for (const field of STEP_FIELDS[step]) {
      const el = form!.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
      if (el) {
        el.hidden = true;
        el.textContent = '';
      }
    }
  }

  function showPanel(panel: string): void {
    panels.forEach((p) => { p.hidden = p.dataset.panel !== panel; });
    pills.forEach((pill) => {
      const active = pill.dataset.step === panel;
      pill.classList.toggle('bg-primary', active);
      pill.classList.toggle('text-secondary', active);
      pill.setAttribute('aria-current', active ? 'step' : 'false');
    });
    const target = form!.querySelector<HTMLElement>(`[data-panel="${panel}"]`);
    // Mover el foco al panel nuevo: sin esto, quien navega con teclado o lector de pantalla
    // queda en el botón anterior y no se entera de que la pantalla cambió.
    const focusable = target?.querySelector<HTMLElement>('select, input, textarea, a[href]');
    (focusable ?? target)?.focus();
  }

  function advance(from: Step, to: string): void {
    clearErrors(from);
    const errors = validateStep(from, readData());
    if (errors.length > 0) {
      for (const { field, message } of errors) {
        const el = form!.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
        if (el) {
          el.textContent = message;
          el.hidden = false;
        }
      }
      status.textContent = `Revisá ${errors.length === 1 ? 'un campo' : `${errors.length} campos`} para continuar.`;
      form!.querySelector<HTMLElement>(`[name="${errors[0].field}"]`)?.focus();
      return;
    }
    status.textContent = '';
    showPanel(to);
  }

  form.querySelectorAll<HTMLButtonElement>('[data-next]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const from = Number(btn.closest<HTMLElement>('[data-panel]')!.dataset.panel) as Step;
      advance(from, btn.dataset.next!);
    });
  });

  form.querySelectorAll<HTMLButtonElement>('[data-prev]').forEach((btn) => {
    btn.addEventListener('click', () => showPanel(btn.dataset.prev!));
  });

  // De qué página llegó la consulta. Sirve para saber qué contenido trae pacientes.
  const origen = form.querySelector<HTMLInputElement>('[name="origen"]');
  if (origen) {
    const params = new URLSearchParams(window.location.search);
    origen.value = params.get('servicio') ?? document.referrer ?? 'directo';
    const servicio = form.querySelector<HTMLSelectElement>('[name="servicio"]');
    const pedido = params.get('servicio');
    if (servicio && pedido && Array.from(servicio.options).some((o) => o.value === pedido)) {
      servicio.value = pedido;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors(5);
    const data = readData();
    const errors = validateStep(5, data);
    if (errors.length > 0) {
      advance(5, '5');
      return;
    }
    const resumen = form.querySelector<HTMLElement>('[data-resumen]');
    if (resumen) {
      resumen.textContent = [data.nombre, data.servicio, `${data.fecha} ${data.hora}`.trim()]
        .filter(Boolean)
        .join(' · ');
    }
    const send = form.querySelector<HTMLAnchorElement>('[data-wizard-send]');
    if (send) send.href = buildWizardUrl(data);
    showPanel('confirmacion');
  });
}
```

- [ ] **Paso 3: Verificar que compila**

Ejecutar: `npm run check`
Esperado: sin errores de TypeScript.

- [ ] **Paso 4: Commit**

```bash
git add src/components/booking/
git commit -m "feat: asistente de agenda de 5 pasos con navegación accesible"
```

---

### Tarea 9: Integrar el asistente en Contáctenos

**Archivos:**
- Modificar: `src/pages/contactenos.astro`

**Interfaces:**
- Consume: `<AppointmentWizard />` de la Tarea 8.
- Produce: la página `/contactenos/` con el asistente en lugar del formulario corto.

- [ ] **Paso 1: Reemplazar el import**

En `src/pages/contactenos.astro`, cambiar:

```astro
import ContactForm from '../components/ContactForm.astro';
```

por:

```astro
import AppointmentWizard from '../components/booking/AppointmentWizard.astro';
```

- [ ] **Paso 2: Reemplazar el bloque del formulario**

Reemplazar:

```astro
      <div class="rounded-3xl bg-white p-8 shadow-sm">
        <p class="mb-6 text-center text-[16px] font-bold uppercase text-primary">¡Obtenga su cita ya!</p>
        <ContactForm />
      </div>
```

por:

```astro
      <div>
        <h2 class="mb-4 text-[26px] md:text-[32px]">Agendá tu cita en pocos pasos</h2>
        <AppointmentWizard />
      </div>
```

- [ ] **Paso 3: Ajustar el fondo de la sección a la paleta nueva**

En la misma página, cambiar `<section class="bg-accent py-10 md:py-14">` por `<section class="bg-bg-alt py-10 md:py-14">`. El dorado saturado como fondo de sección grande compite con el asistente y no deja contraste cómodo para el texto de ayuda.

- [ ] **Paso 4: Verificar compilación, enlaces y pruebas**

Ejecutar: `npm run check && npm run build && npm run links && npm run test`
Esperado: los cuatro pasan.

- [ ] **Paso 5: Revisar el asistente en el navegador**

Ejecutar: `npm run dev` y abrir `http://localhost:4321/contactenos/`.
Verificar a mano:
1. Los 5 pasos avanzan y retroceden.
2. Continuar sin elegir servicio muestra el error debajo del campo y mueve el foco ahí.
3. Al llegar a la confirmación, el botón de WhatsApp abre un chat con el resumen escrito.
4. El texto de confirmación **no** dice que la cita quedó registrada.
5. Con el teclado solo (Tab y Enter) se puede completar el formulario de principio a fin.

- [ ] **Paso 6: Commit**

```bash
git add src/pages/contactenos.astro
git commit -m "feat: Contáctenos usa el asistente de agenda de 5 pasos"
```

---

### Tarea 10: Inicio con la paleta nueva y parallax

**Archivos:**
- Modificar: `src/pages/index.astro`
- Modificar: `src/components/home/HeroSlider.astro`
- Modificar: `src/components/home/Welcome.astro`
- Modificar: `src/components/home/SpecialtiesCarousel.astro`
- Modificar: `src/components/home/Team.astro`
- Modificar: `src/components/home/BenefitsBanner.astro`

**Interfaces:**
- Consume: las clases de la Tarea 3 y el atributo `data-parallax` que lee `initParallax` (Tarea 4).
- Produce: la página `/` con el diseño nuevo.

- [ ] **Paso 1: Encontrar todos los colores viejos del Inicio**

Ejecutar: `grep -rn "purple-dark\|accent-dark\|text-slide\|bg-slide\|#3d387f\|#efb37d" src/pages/index.astro src/components/home/`
Anotar cada línea: son las que hay que cambiar en el paso siguiente.

- [ ] **Paso 2: Reemplazar los colores viejos**

En cada línea encontrada, aplicar el mapeo: `purple-dark` a `primary-dark`, `accent-dark` a `accent-text`, y cualquier fondo blanco de sección que deba ser crema a `bg-bg`. Donde haya `bg-accent` con texto claro encima, cambiar el texto a `text-text` (mismo motivo que en la Tarea 5).

- [ ] **Paso 3: Marcar la imagen del hero para el parallax**

En `src/components/home/HeroSlider.astro`, agregar `data-parallax` a la etiqueta de imagen de cada diapositiva. Es el único gancho que necesita `initParallax`.

- [ ] **Paso 4: Verificar que no quedaron tokens viejos**

Ejecutar: `grep -rn "purple-dark\|accent-dark\|color-slide" src/`
Esperado: sin resultados en todo `src/`.

- [ ] **Paso 5: Verificar compilación, enlaces y pruebas**

Ejecutar: `npm run check && npm run build && npm run links && npm run test`
Esperado: los cuatro pasan.

- [ ] **Paso 6: Revisar el Inicio en el navegador**

Ejecutar: `npm run dev` y abrir `http://localhost:4321/`.
Verificar a mano:
1. Tipografía Fraunces en los títulos y Work Sans en el cuerpo, sin peticiones a `fonts.googleapis.com` (pestaña Red de las herramientas de desarrollo).
2. El parallax del hero se mueve al hacer scroll.
3. Con movimiento reducido activado en el sistema operativo, el hero se ve completo y quieto, y GSAP no se descarga.
4. En un ancho de 360 px no hay desbordamiento horizontal.

- [ ] **Paso 7: Commit**

```bash
git add src/pages/index.astro src/components/home/
git commit -m "feat: inicio con la paleta de agosto y parallax en el hero"
```

---

### Tarea 11: llms.txt

**Archivos:**
- Crear: `public/llms.txt`

**Interfaces:**
- Consume: nada.
- Produce: `/llms.txt` servido como archivo estático.

El spec pide portar el `llms.txt` de agosto. Es un archivo global, así que entra en esta fase.
El de agosto lista páginas que todavía no existen (`/pie-diabetico/`, `/heridas-cronicas/`,
`/k-laser-cube-4/`, `/sobre-el-dr-madrigal/`): esas líneas se reemplazan por las rutas reales
del repo. Las credenciales del Dr. Madrigal se copian **textualmente** del archivo de agosto,
sin agregar ni reformular nada.

- [ ] **Paso 1: Crear el archivo**

Crear `public/llms.txt`:

```
# Clínica Angular
> Clínica podológica y de tratamiento avanzado de heridas en San José,
> Costa Rica, dirigida por el Dr. Marvin Madrigal Chaves.

## Especialidades
- Podología clínica: onicomicosis, uña encarnada, verruga plantar,
  pie diabético, pie geriátrico, pie pediátrico, callos y durezas
- Curación avanzada de heridas y úlceras crónicas
- Fisioterapia especializada
- Psicología clínica
- Medicina general

## Páginas clave
- /especialidades/podologia/
- /fisioterapia/
- /psicologia/
- /medicina-general/
- /k-laser/
- /laser-pion/
- /nuestros-especialistas/
- /contactenos/

## Credenciales
Dr. Marvin Madrigal Chaves — Podólogo Clínico, Doctor en Enfermería
(tratamiento social, Colegio de Enfermeras de Costa Rica), Experto en
Tratamiento Avanzado de Heridas, CEO de Clínica Angular.

## Contacto
WhatsApp: +506 8305-6444
Guadalupe, San José, Costa Rica
```

- [ ] **Paso 2: Verificar que cada ruta listada existe**

Ejecutar: `npm run build && for r in /especialidades/podologia/ /fisioterapia/ /psicologia/ /medicina-general/ /k-laser/ /laser-pion/ /nuestros-especialistas/ /contactenos/; do test -f "dist${r}index.html" && echo "OK $r" || echo "FALTA $r"; done`
Esperado: las ocho dicen OK. Si alguna dice FALTA, corregir la ruta en `llms.txt` en vez de dejarla.

- [ ] **Paso 3: Verificar que se sirve**

Ejecutar: `test -f dist/llms.txt && head -2 dist/llms.txt`
Esperado: el archivo existe y arranca con `# Clínica Angular`.

- [ ] **Paso 4: Commit**

```bash
git add public/llms.txt
git commit -m "feat: llms.txt con las rutas reales del sitio"
```

---

## Cierre de la fase

- [ ] **Verificación final**

Ejecutar: `npm run check && npm run test && npm run build && npm run links`
Los cuatro deben pasar. Si alguno falla, la fase no está terminada.

- [ ] **Abrir el PR**

```bash
git push -u origin claude/file-changes-b19ce6
gh pr create --title "Fase 1: sistema de diseño del rediseño de agosto" --body "Migra la base visual del sitio al diseño de agosto y reemplaza el formulario de Contáctenos por el asistente de agenda de 5 pasos.

Incluye tres correcciones de contraste sobre la paleta original de agosto, documentadas en el plan: el dorado no llegaba a WCAG AA como texto ni con blanco o púrpura encima, y el color de evidencia mixta tampoco.

El asistente no tiene backend: genera un mensaje de WhatsApp con el resumen. El copy de confirmación dice explícitamente que la cita todavía no está registrada.

Plan: docs/superpowers/plans/2026-09-08-fase-1-sistema-de-diseno.md"
```

## Fuera de alcance de esta fase

- Las páginas de padecimiento y la colección `conditions` (fase 2)
- Nuestra Clínica, Tecnologías, Instalaciones (fase 4) y Blog (fase 5)
- Agregar esos ítems al menú: cada fase suma el suyo cuando su página existe
- El backend de citas
- Los componentes de evidencia científica: el token de color se define acá, el componente llega en la fase 2
