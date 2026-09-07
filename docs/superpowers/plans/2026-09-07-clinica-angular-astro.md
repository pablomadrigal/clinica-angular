# Clínica Angular en Astro — Plan de implementación (etapa 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproducir https://angular.cr/ como sitio estático en Astro, visualmente idéntico, sin tienda ni CMS, desplegable en Vercel.

**Architecture:** Astro 7 en modo estático con Tailwind v4. Los 8 servicios y el equipo viven en Content Collections (YAML + imágenes locales); el resto son páginas propias compuestas con componentes compartidos (`TopBar`, `Header`, `Footer`, `ContactSection`, `ServiceCard`, etc.). Nada de backend: el formulario abre WhatsApp con el mensaje prellenado.

**Tech Stack:** Astro 7.3, Tailwind 4.3 (`@tailwindcss/vite`), `@astrojs/sitemap`, `@fontsource-variable/montserrat`, `swiper` (slider del hero y carrusel), Vitest 5, pnpm 10, Node 22, Vercel (estático).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-09-07-clinica-angular-astro-design.md`. Ante duda, manda el spec.
- Fuente de verdad del contenido: `reference/source/<pagina>.md` (texto estructurado extraído del sitio) y `reference/source/<pagina>.html` (HTML original). Los textos se copian **textualmente**, incluidos errores ortográficos del original. Solo se omiten los residuos listados en el spec.
- Capturas de referencia: `reference/screenshots/<pagina>-desktop.png` (1440px) y `<pagina>-mobile.png` (390px). CSS original por página: `reference/css/post-<id>.css`; tokens globales en `reference/css/post-9.css`.
- Tokens: `primary #3D387F`, `accent #EFB37D`, `accent-dark #CE8D3B`, `text #54595F`, `secondary #FFFFFF`, `whatsapp #25d366`, `chat #3AD18C`, `purple-dark #130455`, `slide-text #2A2525`. Fuente única: Montserrat (400/500/600/700). Ancho de contenedor: `1140px`.
- URLs con barra final (`trailingSlash: 'always'`), idénticas al sitio actual. Sitio: `https://angular.cr`.
- Las URLs de WhatsApp: chat directo `https://api.whatsapp.com/send/?phone=50683056444&text&type=phone_number&app_absent=0`; formulario `https://wa.me/50683056444?text=<mensaje>`.
- Redes: `https://www.facebook.com/AngularClinica`, `https://www.instagram.com/clinica_angular`, `https://www.tiktok.com/@clinicadelpieangular`.
- Nada de tienda: sin sección TIENDA, sin "Productos" en el menú, sin cart/checkout.
- Cada tarea termina con `pnpm check && pnpm build` en verde y un commit. Mensajes de commit en español, formato `tipo: descripción`, con el trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Los IDs de las entradas de la colección `services` (nombre del archivo YAML sin extensión) son exactamente: `podologia`, `psicologia`, `medicina-general`, `fisioterapia`, `pedicure-clinico`, `audiologia`, `escleroterapia`, `servicio-de-estetica`.
- No copiar HTML ni clases de Elementor. Todo el markup es propio, estilizado con Tailwind y CSS mínimo.

---

## Mapa de archivos

```
astro.config.mjs               site, trailingSlash, integraciones (tailwind vite, sitemap)
vercel.json                    redirects 301 de tienda → /
vitest.config.ts               vitest sobre src/lib
package.json                   scripts: dev, build, preview, check, test, assets
scripts/download-assets.mjs    descarga imágenes del WP a src/assets/
public/robots.txt
public/favicon.png             logo 100x100
src/styles/global.css          @import tailwind + @theme con tokens + base
src/data/site.ts               teléfonos, correo, horario, redes, direcciones, nav
src/lib/whatsapp.ts            buildAppointmentMessage, buildAppointmentUrl, CHAT_URL
src/lib/whatsapp.test.ts
src/content.config.ts          colecciones services y specialists
src/content/services/*.yaml    8 servicios
src/content/specialists/*.yaml 15 personas
src/assets/**                  imágenes descargadas
src/layouts/Base.astro         <html>, head SEO, TopBar, Header, slot, Footer, WhatsAppButton
src/components/TopBar.astro
src/components/Header.astro
src/components/Footer.astro
src/components/WhatsAppButton.astro
src/components/Button.astro
src/components/ContactForm.astro
src/components/ContactSection.astro
src/components/BackHome.astro
src/components/ServiceCard.astro
src/components/RelatedServices.astro
src/components/SpecialistCard.astro
src/components/home/HeroSlider.astro
src/components/home/Welcome.astro
src/components/home/SpecialtiesCarousel.astro
src/components/home/Team.astro
src/components/home/BenefitsBanner.astro
src/pages/index.astro
src/pages/nuestra-empresa.astro
src/pages/especialidades/index.astro
src/pages/nuestros-especialistas.astro
src/pages/nuestros-beneficios.astro
src/pages/k-laser.astro
src/pages/laser-pion.astro
src/pages/contactenos.astro
src/pages/[...slug].astro      genera los 8 servicios desde la colección
```

---

### Task 1: Scaffold del proyecto (Astro + Tailwind + sitemap + fuente + Vitest + Vercel)

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `vercel.json`, `src/styles/global.css`, `src/pages/index.astro` (temporal), `public/robots.txt`
- Modify: `.gitignore`

**Interfaces:**
- Produces: scripts `pnpm dev | build | preview | check | test`; tokens Tailwind `bg-primary`, `text-accent`, `bg-accent-dark`, `text-text`, `bg-whatsapp`, `bg-chat`, `bg-purple-dark`, `text-slide`; clase utilitaria `.container-site` (max-width 1140px centrado con padding 15px).

- [ ] **Step 1: Crear el proyecto Astro en el directorio actual**

```bash
cd "/Users/pablomadrigal/Repos/Otros/Pagina Angular"
pnpm create astro@latest . --template minimal --install --no-git --yes
```

Si `create-astro` se queja de que el directorio no está vacío, responder que continúe (los archivos existentes son `docs/`, `reference/` y `.gitignore`, no chocan). Si algún flag no existe en la versión instalada, quitarlo y aceptar los valores por defecto.

- [ ] **Step 2: Añadir integraciones y dependencias**

```bash
pnpm astro add tailwind sitemap --yes
pnpm add swiper @fontsource-variable/montserrat
pnpm add -D vitest @astrojs/check typescript
```

Verificar que `astro.config.mjs` quedó con `@tailwindcss/vite` en `vite.plugins` y `sitemap()` en `integrations`.

- [ ] **Step 3: Escribir `astro.config.mjs` completo**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://angular.cr',
  trailingSlash: 'always',
  output: 'static',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 4: Escribir `src/styles/global.css`**

```css
@import 'tailwindcss';
@import '@fontsource-variable/montserrat';

@theme {
  --color-primary: #3d387f;
  --color-accent: #efb37d;
  --color-accent-dark: #ce8d3b;
  --color-text: #54595f;
  --color-secondary: #ffffff;
  --color-whatsapp: #25d366;
  --color-chat: #3ad18c;
  --color-purple-dark: #130455;
  --color-slide: #2a2525;
  --font-sans: 'Montserrat Variable', 'Montserrat', sans-serif;
}

@layer base {
  html { font-family: var(--font-sans); color: var(--color-text); scroll-behavior: smooth; }
  body { background: #fff; }
  h1, h2, h3, h4, h5, h6 { color: var(--color-primary); font-weight: 600; line-height: 1.2; }
  img { max-width: 100%; height: auto; }
}

@utility container-site {
  width: 100%;
  max-width: 1140px;
  margin-inline: auto;
  padding-inline: 15px;
}
```

- [ ] **Step 5: Scripts de package.json, vitest y vercel.json**

En `package.json`, dejar `scripts` así (conservar lo que `create-astro` generó y añadir):

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "assets": "node scripts/download-assets.mjs"
  }
}
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
});
```

`vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "trailingSlash": true,
  "redirects": [
    { "source": "/productos", "destination": "/", "permanent": true },
    { "source": "/productos/", "destination": "/", "permanent": true },
    { "source": "/cart", "destination": "/", "permanent": true },
    { "source": "/cart/", "destination": "/", "permanent": true },
    { "source": "/checkout", "destination": "/", "permanent": true },
    { "source": "/checkout/", "destination": "/", "permanent": true },
    { "source": "/my-account", "destination": "/", "permanent": true },
    { "source": "/my-account/", "destination": "/", "permanent": true }
  ]
}
```

`public/robots.txt`:

```
User-agent: *
Allow: /
Sitemap: https://angular.cr/sitemap-index.xml
```

- [ ] **Step 6: Página temporal para validar tokens**

`src/pages/index.astro`:

```astro
---
import '../styles/global.css';
---
<html lang="es">
  <head><meta charset="utf-8" /><title>Clínica Angular</title></head>
  <body>
    <main class="container-site py-10">
      <h1 class="text-4xl text-primary">Clínica Angular</h1>
      <p class="text-text">Montserrat cargada. <span class="bg-accent px-2">accent</span> <span class="bg-chat px-2">chat</span></p>
    </main>
  </body>
</html>
```

- [ ] **Step 7: Verificar**

```bash
pnpm check && pnpm build && ls dist/index.html && grep -c 'Montserrat' dist/_astro/*.css | head -1
```

Esperado: check sin errores, build ok, `dist/index.html` existe, la fuente aparece en el CSS generado.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro 7 con Tailwind 4, sitemap, Montserrat y Vitest

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Datos del sitio y utilidad de WhatsApp (TDD)

**Files:**
- Create: `src/data/site.ts`, `src/lib/whatsapp.ts`, `src/lib/whatsapp.test.ts`

**Interfaces:**
- Produces:
  - `site` (objeto) con `name, url, phone, phoneIntl, whatsapp, whatsappIntl, email, hours: string[], social: {facebook, instagram, tiktok}, addresses: {home, empresa, especialidades, contacto, contactoLargo, kLaser, laserPion, especialistas}, mapEmbedUrl, copyright`.
  - `nav: NavItem[]` donde `NavItem = { label: string; href: string; children?: NavItem[] }` (el submenú de Especialidades se llena en el Header desde la colección; aquí va vacío).
  - `WHATSAPP_NUMBER = '50683056444'`, `CHAT_URL`, `buildAppointmentMessage(fields)`, `buildAppointmentUrl(fields)` con `AppointmentFields = { name: string; email: string; phone: string; message: string }`.

- [ ] **Step 1: Escribir la prueba que falla**

`src/lib/whatsapp.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { CHAT_URL, WHATSAPP_NUMBER, buildAppointmentMessage, buildAppointmentUrl } from './whatsapp';

const fields = { name: 'Ana Mora', email: 'ana@example.com', phone: '8888-1234', message: 'Quiero cita de podología' };

describe('whatsapp', () => {
  it('usa el número de la clínica', () => {
    expect(WHATSAPP_NUMBER).toBe('50683056444');
    expect(CHAT_URL).toBe('https://api.whatsapp.com/send/?phone=50683056444&text&type=phone_number&app_absent=0');
  });

  it('arma el mensaje con todos los campos en líneas separadas', () => {
    expect(buildAppointmentMessage(fields)).toBe(
      'Hola, quiero agendar una cita.\nNombre: Ana Mora\nCorreo: ana@example.com\nTeléfono: 8888-1234\nMensaje: Quiero cita de podología',
    );
  });

  it('omite líneas de campos vacíos', () => {
    expect(buildAppointmentMessage({ ...fields, email: '', message: '  ' })).toBe(
      'Hola, quiero agendar una cita.\nNombre: Ana Mora\nTeléfono: 8888-1234',
    );
  });

  it('genera la URL wa.me codificada', () => {
    const url = buildAppointmentUrl(fields);
    expect(url.startsWith('https://wa.me/50683056444?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1])).toBe(buildAppointmentMessage(fields));
    expect(url).not.toContain('\n');
  });
});
```

- [ ] **Step 2: Correr y ver que falla**

```bash
pnpm test
```

Esperado: FAIL, `Cannot find module './whatsapp'`.

- [ ] **Step 3: Implementar `src/lib/whatsapp.ts`**

```ts
export const WHATSAPP_NUMBER = '50683056444';
export const CHAT_URL = `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text&type=phone_number&app_absent=0`;

export interface AppointmentFields {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function buildAppointmentMessage(f: AppointmentFields): string {
  const lines = ['Hola, quiero agendar una cita.'];
  const push = (label: string, value: string) => {
    const v = value.trim();
    if (v) lines.push(`${label}: ${v}`);
  };
  push('Nombre', f.name);
  push('Correo', f.email);
  push('Teléfono', f.phone);
  push('Mensaje', f.message);
  return lines.join('\n');
}

export function buildAppointmentUrl(f: AppointmentFields): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildAppointmentMessage(f))}`;
}
```

- [ ] **Step 4: Correr y ver que pasa**

```bash
pnpm test
```

Esperado: 4 tests PASS.

- [ ] **Step 5: Escribir `src/data/site.ts`**

```ts
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const site = {
  name: 'Clínica Angular',
  url: 'https://angular.cr',
  phone: '2253-8303',
  phoneIntl: '+(506) 2253-8303',
  phoneHref: 'tel:+50622538303',
  whatsapp: '8305-6444',
  whatsappIntl: '+(506) 8305-6444',
  email: 'info@angular.cr',
  hours: ['Lunes a Viernes : 9 am a 5 pm', 'Sábado: 9 am a 1 pm', 'Domingo: Cerrado'],
  hoursLong: ['Lunes a Viernes : 9:00 am – 5:00 pm', 'Sábado: 9:00 am a 1:00 pm', 'Domingo: Cerrado'],
  social: {
    facebook: 'https://www.facebook.com/AngularClinica',
    instagram: 'https://www.instagram.com/clinica_angular',
    tiktok: 'https://www.tiktok.com/@clinicadelpieangular',
  },
  addresses: {
    home: '75m Oeste del Estadio Colleya Fonseca, Guadalupe, San José, Costa Rica.',
    empresa: '75 mts oeste del Estadio Colleya Fonseca, Guadalupe, Goicoechea, San José, Costa Rica.',
    especialidades: 'Edificio sur de la Clínica Católica, Oficentro Centauro Guadalupe, San José, Costa Rica.',
    contacto: 'Guadalupe, Del Estadio Coyella Fonseca 75m Oeste',
    contactoLargo: 'Edificio sur del Hospital Internacional La Católica, Guadalupe, San José, Costa Rica.',
    kLaser: '75 mts oeste del Estadio Colleya Fonseca, Guadalupe, Goicoechea, San José, Costa Rica.',
    laserPion: 'Edificio sur del Hospital Internacional La Católica, Guadalupe, San José, Costa Rica.',
    especialistas: '75 mts oeste del Estadio Colleya Fonseca, Guadalupe, Goicoechea, San José, Costa Rica.',
    footer: ['Clínica Angular,', 'Guadalupe, San José.'],
  },
  mapEmbedUrl:
    'https://maps.google.com/maps?q=Angular%20Cl%C3%ADnica%20del%20Pie%2C%20guadalupe%2C%20san%20jos%C3%A9%2C%20costa%20rica&t=m&z=15&output=embed&iwloc=near',
  copyright: '© Copyright Pablo Madrigal 2024. All rights reserved.',
} as const;

// El submenú de "Especialidades" se rellena en Header.astro desde la colección `services`.
export const nav: NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Nuestra Empresa', href: '/nuestra-empresa/' },
  { label: 'Especialidades', href: '/especialidades/', children: [] },
  { label: 'Nuestros Especialistas', href: '/nuestros-especialistas/' },
  { label: 'Nuestros Beneficios', href: '/nuestros-beneficios/' },
  {
    label: 'Tecnología',
    href: '#',
    children: [
      { label: 'K-laser', href: '/k-laser/' },
      { label: 'Láser Pion', href: '/laser-pion/' },
    ],
  },
  { label: 'Contáctenos', href: '/contactenos/' },
];
```

Nota: la dirección de Especialistas en el original termina con el residuo `Quitar "Moreno Canas"`; se omite (residuo de plantilla).

- [ ] **Step 6: Verificar y commit**

```bash
pnpm check && pnpm test
git add src/data/site.ts src/lib/whatsapp.ts src/lib/whatsapp.test.ts
git commit -m "feat: datos del sitio y utilidad de WhatsApp con pruebas

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Descarga de imágenes a `src/assets/`

**Files:**
- Create: `scripts/download-assets.mjs`, `src/assets/**` (generado), `public/favicon.png`

**Interfaces:**
- Produces: imágenes locales con nombre = basename original de WordPress **sin** sufijo de tamaño `-WxH` (p. ej. `Logo-Angular-1-1024x659.png` → `Logo-Angular-1.png`). Los sufijos `-e<13 dígitos>` (imágenes editadas) se conservan porque son archivos distintos. Las tareas siguientes importan con `import foo from '../assets/<nombre>'` o, en YAML, con rutas relativas `../../assets/<nombre>`.

- [ ] **Step 1: Escribir `scripts/download-assets.mjs`**

```js
// Descarga todas las imágenes del sitio original a src/assets/.
// Fuente: reference/images.txt (contenido de páginas) + EXTRA (header, footer, hero, carrusel, fondos).
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { basename, join } from 'node:path';

const OUT = 'src/assets';
const EXTRA = [
  // header / footer
  'https://angular.cr/wp-content/uploads/2023/09/Logo-Angular-2-e1770681953456.png',
  'https://angular.cr/wp-content/uploads/2023/09/Logo-Angular-1-1024x659.png',
  'https://angular.cr/wp-content/uploads/2023/09/Contactenos-footer.png',
  'https://angular.cr/wp-content/uploads/2023/09/Group-245464935-1-1024x252.png',
  'https://angular.cr/wp-content/uploads/2023/09/ANGULAR-logotipo-principal-100x100.png',
  // hero (slides) escritorio y móvil
  'https://angular.cr/wp-content/uploads/2024/03/Banner-2-e1770682456920.png',
  'https://angular.cr/wp-content/uploads/2026/03/Diseno-sin-titulo.jpg',
  'https://angular.cr/wp-content/uploads/2024/03/podologia-banner.jpg',
  'https://angular.cr/wp-content/uploads/2024/03/medicina-general-1.jpg',
  'https://angular.cr/wp-content/uploads/2023/09/Banner-6-e1764877042937.png',
  'https://angular.cr/wp-content/uploads/2024/03/Psicologia.jpg',
  'https://angular.cr/wp-content/uploads/2024/03/Fisioterapia.jpg',
  'https://angular.cr/wp-content/uploads/2024/03/Estetica.jpg',
  // carrusel "Conozca nuestras especialidades"
  'https://angular.cr/wp-content/uploads/2023/09/enfermera-paciente-sesion-osteopatia-1-e1764877090615.png',
  'https://angular.cr/wp-content/uploads/2024/02/Que-diferencias-existen-entre-la-medicina-general-y-la-medicina-interna.webp',
  'https://angular.cr/wp-content/uploads/2024/02/centro-estetica-avanzado.jpg',
  'https://angular.cr/wp-content/uploads/2024/02/fisioterapia-deportiva-1920w.webp',
  'https://angular.cr/wp-content/uploads/2024/02/por_que_fazer_terapia.width-1920.jpg',
  // fondo "Conozca nuestros Beneficios"
  'https://angular.cr/wp-content/uploads/2023/09/patoient-osteopatia-recibiendo-masaje-tratamiento-scaled.jpg',
];

const listed = (await readFile('reference/images.txt', 'utf8')).split('\n').map((l) => l.trim()).filter(Boolean);
const urls = [...new Set([...listed, ...EXTRA])].filter((u) => u.startsWith('https://angular.cr/wp-content/uploads/'));

const SIZE_SUFFIX = /-\d{2,4}x\d{2,4}(?=\.[a-z]+$)/i;

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function fetchOk(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

await mkdir(OUT, { recursive: true });
let ok = 0, skipped = 0, failed = [];
for (const url of urls) {
  const original = url.replace(SIZE_SUFFIX, '');
  const name = basename(original);
  const dest = join(OUT, name);
  if (await exists(dest)) { skipped++; continue; }
  // Preferir el archivo original (sin sufijo de tamaño); si no existe, usar la URL tal cual.
  const data = (await fetchOk(original)) ?? (original !== url ? await fetchOk(url) : null);
  if (!data) { failed.push(url); continue; }
  await writeFile(dest, data);
  ok++;
  console.log('ok', name);
}
console.log({ ok, skipped, failed: failed.length });
if (failed.length) { console.error('FALLARON:\n' + failed.join('\n')); process.exitCode = 1; }
```

- [ ] **Step 2: Ejecutar**

```bash
pnpm assets
ls src/assets | wc -l
du -sh src/assets
```

Esperado: `failed: 0` y alrededor de 90 archivos. Si alguna URL falla, comprobar con `curl -I` y corregir el nombre en `EXTRA`.

- [ ] **Step 3: Favicon**

```bash
cp src/assets/ANGULAR-logotipo-principal.png public/favicon.png 2>/dev/null || cp src/assets/ANGULAR-logotipo-principal-100x100.png public/favicon.png
rm -f public/favicon.svg
```

- [ ] **Step 4: Commit**

```bash
git add scripts/download-assets.mjs src/assets public/favicon.png
git rm -q --cached public/favicon.svg 2>/dev/null; true
git commit -m "feat: script de descarga de imágenes y assets del sitio original

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Colecciones de contenido (`services` y `specialists`)

**Files:**
- Create: `src/content.config.ts`, `src/content/services/*.yaml` (8), `src/content/specialists/*.yaml` (15)

**Interfaces:**
- Produces: `getCollection('services')` con entradas `{ id, data: ServiceData }` y `getCollection('specialists')` con `{ id, data: SpecialistData }`. Tipos exportados `ServiceSection`.

- [ ] **Step 1: Escribir `src/content.config.ts`**

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Cada string de `paragraphs` es un <p>. Las que empiezan con "✓" se pintan como ítem de lista.
const paragraphs = z.array(z.string());

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '*.yaml' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(), // encabezado de la página, tal cual (mayúsculas incluidas)
      slug: z.string(), // ruta sin barras: "especialidades/podologia" o "fisioterapia"
      menuLabel: z.string(),
      inMenu: z.boolean().default(true),
      order: z.number(),
      seoTitle: z.string(),
      card: z.object({ label: z.string(), image: image() }),
      // Encabezado "Padecimientos y Tratamientos" + botón CHAT DIRECTO bajo el título
      showTreatmentsHeader: z.boolean().default(false),
      // Imagen grande bajo el título (Fisioterapia, Estética)
      heroImage: image().optional(),
      showChatAfterHero: z.boolean().default(false),
      sections: z.array(
        z.discriminatedUnion('type', [
          // Padecimiento: título grande + imagen + subtítulo "- X -" + párrafos + CHAT DIRECTO
          z.object({
            type: z.literal('condition'),
            heading: z.string(),
            image: image(),
            subheading: z.string().optional(),
            body: paragraphs.default([]),
            imageSide: z.enum(['left', 'right']).default('left'),
            showChat: z.boolean().default(true),
          }),
          // Tarjetas de tratamiento: título h3 + párrafos, seguidas de "Agendar cita"
          z.object({
            type: z.literal('treatments'),
            heading: z.string().optional(),
            items: z.array(z.object({ title: z.string(), body: paragraphs.default([]) })),
            showAppointment: z.boolean().default(true),
          }),
          // Tema: título h2 + imagen opcional + ítems (título opcional + párrafos) + "Agendar cita" opcional
          z.object({
            type: z.literal('topics'),
            heading: z.string().optional(),
            image: image().optional(),
            imageSide: z.enum(['left', 'right']).default('left'),
            items: z.array(z.object({ title: z.string().optional(), body: paragraphs.default([]) })),
            showAppointment: z.boolean().default(false),
            showChat: z.boolean().default(false),
          }),
        ]),
      ),
      related: z.array(z.string()).default([]), // ids de otros servicios para "Ver más especialidades"
      showBackHome: z.boolean().default(true),
    }),
});

const specialists = defineCollection({
  loader: glob({ base: './src/content/specialists', pattern: '*.yaml' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      shortName: z.string().optional(), // nombre corto para el home
      role: z.string(),
      code: z.string().optional(), // línea "Código: …" tal cual
      photo: image(),
      profileTitle: z.string().default('Perfil Profesional'),
      profile: z.array(z.string()),
      group: z.enum(['clinico', 'administrativo']),
      order: z.number(),
      featured: z.boolean().default(false), // aparece en "Nuestro Equipo" del home
      featuredRole: z.string().optional(), // etiqueta corta en el home (Podología, Psicología, Fisioterapia)
    }),
});

export const collections = { services, specialists };
```

- [ ] **Step 2: Entrada completa de ejemplo: `src/content/services/fisioterapia.yaml`**

Texto tomado literalmente de `reference/source/fisioterapia.md`.

```yaml
title: FISIOTERAPIA
slug: fisioterapia
menuLabel: Fisioterapia
order: 4
seoTitle: Fisioterapia - Clínica Angular
card:
  label: Fisioterapia
  image: ../../assets/Fisioterapia-deportiva-que-es-tipos-ventajas-y-desventajas.jpg
heroImage: ../../assets/Fisioterapia.jpg
showChatAfterHero: true
sections:
  - type: topics
    showChat: true
    showAppointment: true
    items:
      - title: Rehabilitación especializada en el adulto mayor
        body:
          - "Tenemos una especialidad en el tratamiento de la persona adulta mayor, el cual iniciara siempre con una evaluación cuatridimensional exhaustiva para poder ver a la persona de forma completa y no dejar ninguna área sin valor que en el futuro se pueda manifestar como una complicación. Entre los tratamientos que le ofrecemos es la valoración de la marcha y su rehabilitación. Rehabilitación post quirúrgica, tratamiento para pacientes con demencia, control del dolor, entre otros"
      - title: Manejo de dolores musculares
        body:
          - "Según la sintomatología y cronicidad del paciente, se elige elije el método terapéutico a emplear. Es importante que usted sepa que en Clínica Angular le brindamos un tratamiento especializado e individualizado; entre las opciones de tratamiento que le brindamos puede encontrar, técnicas manuales, ejercicio terapéutico, oscilaciones profundas, tecarterapia, electropunción, punción seca, diferentes tipos de corrientes eléctricas, entre otros."
      - title: Rehabilitación post-quirúrgico
        body:
          - "Ponemos a su disposición tecnología de última generación para acelerar el proceso de regeneración y cicatrización de tejido, asi como para el control de su dolor. Buscamos que después de su intervención quirúrgica logre regresar a los rangos de movilidad normal y se tenga una adaptación a la vida diaria de manera natural"
      - title: Tratamiento de linfedemas
        body:
          - "Sabemos que el linfedema puede ser muy incómodo y doloroso, por eso, con un equipo interdisciplinario le ofrecemos una opción terapéutica en donde cuidaremos de su piel, de lesiones dérmicas, y dependiendo del estadio le daremos la terapia compresiva que necesite, desde un unas medias compresivas hasta un vendaje multicapa. Como equipo complementario utilizamos la presoterapia de 10 cámaras, las oscilaciones profundas y todo esto acompañada SIEMPRE de ejercicios funcionales."
      - title: Rehabilitación vascular
        body:
          - "Buscamos reducir su dolor, pesades, y todo tipo de molestia que pueda ser causado por un sistema vascular deficiente. Para ello ponemos a su disposición deferentes marca de medias de compresión, tecnología de compresión y electricidad que nos ayuda a mejorar el retorno venoso. Esto siempre será acompaña del ejercicio terapéutico."
      - title: Rehabilitación del paciente con amputación
        body:
          - "Buscamos disminuir su dolor, normalizar la sensibilidad del muñón y hacer que este sea funcional y apto para la utilización de una prótesis."
      - title: Espolón calcáneo y fascitis plantar
        body:
          - "Disminuir su dolor siempre será nuestro objetivo numero 1. Utilizamos diferentes técnicas terapéuticas incluyendo la punción y electro punción de músculos con hipertonía, electricidad que nos ayude a disminuir la inflamación y otras muchas técnicas para reducir la imposibilidad al caminar."
related: [podologia, psicologia, medicina-general, servicio-de-estetica]
```

- [ ] **Step 3: Crear los otros 7 servicios**

Copiar los textos **literalmente** desde `reference/source/<archivo>.md`. Estructura de cada uno (imágenes ya en `src/assets/`, nombre sin sufijo de tamaño):

| id | title / slug / order / inMenu | Estructura de `sections` | related |
|---|---|---|---|
| `podologia` | `PODOLOGÍA` / `especialidades/podologia` / 1 | `showTreatmentsHeader: true`. Alternar `condition` + `treatments` en este orden: HONGOS EN UÑAS Y HONGOS EN PIES (img `Foto5-Angular-Podologia-Costa-Rica-1.jpg`, sub `- Onicomicosis y Dermatomicosis -`) → treatments [Tratamiento para ambas, Tratamiento Onicomicosis (hongos en uñas), Dermatomicosis (Hongos en la piel de los pies)] → treatments [Tratamiento para la onicocriptosis, Ortonixia:, Espiculotomía:, Matricectomía:, Paroniquia:] → condition UÑA INCARNADA (`unero-1.jpg`, sub `- Onicocriptosis -`) → condition PIÉ DIABÉTICO (`WhatsApp-Image-2024-02-26-at-22.29.08.jpg`) → treatments [Tratamiento Preventivo en Diabéticos, Tratamiento del “Pie diabético”, Plantillas personalizadas para personas con diabetes, Calzado para diabéticos] → treatments [Tratamiento:] (cambio del calzado…) → condition FASCITIS PLANTAR (`dolor-fascitis-plantar.jpg`) → condition VERRUGAS PLANTARES (`verruga_plantar.jpg`) → treatments [Tratamiento:] (oral/ácidos/láser) → treatments [Tratamiento:] (curación avanzada…) → condition HERIDAS Y ÚLCERAS (`WhatsApp-Image-2024-02-26-at-22.26.29.jpg`) → condition ENFERMEDADES ORTOPODOLÓGICAS (`images_2023_01_21_55114416__l-copy.jpg`, sub `- Deformidades en dedos y pies -`) → treatments [Tratamiento:] (ortesis de silicón…) → treatments [Tratamiento:] (valoración integral de la piel…) → condition PIE GERIÁTRICO (`podologia_geriatrico_perdidas.jpg`) → condition TRAUMATISMO DE UÑAS (`gettyimages-142097294-1-1531839264.jpg`) → treatments [Tratamiento:] (valoración integral de la condición de la uña…) → treatments [Tratamiento:] (Quiropodia…) → condition CALLOS Y DUREZA (`pie.jpg`) → condition PIES SECOS - SUDORACIÓN EXCESIVA - MAL OLOR (`f.elconfidencial.com_original_5a3_c60_75b_5a3c6075be36935033b52be15b321f38.jpg`, sub `- Anhidrosis, hiperhidrosis y bromodosis -`) → treatments [Tratamiento:] (productos dermatológicos…) → treatments [Tratamiento:] (valoración en estática…) → condition ALTERACIONES BIOMECÁNICAS DE LA MARCHA (`pie-cavo.jpg`). Los textos de FASCITIS PLANTAR y VERRUGAS PLANTARES están repetidos de otras secciones en el original; se copian igual. | `[fisioterapia, psicologia, medicina-general, servicio-de-estetica]` |
| `psicologia` | `PSICOLOGÍA CLÍNICA` / `especialidades/psicologia` / 2 | 6 `topics`, cada uno con `heading`, `image`, un solo item sin título cuyo `body` son las líneas "✓ …", `showAppointment: true`, alternando `imageSide`: PSICOTERAPIA DE PAREJA (`terapia-de-pareja-1.jpg`), PSICOTERAPIA DE FAMILIA (`102146568_xl-scaled-1.jpg`), DIAGNÓSTICO Y TRATAMIENTO DEL TRASTORNO POR DÉFICIT DE ATENCIÓN (TDA) (`92956.jpg`), ATENCIÓN DEL DUELO (`121901-quando-e-hora-de-procurar-um-psicoterapeuta-740x500-1.jpg`), DEPRESIÓN, ANSIEDAD Y ESTRÉS (`mujer-deprimida-que-busca-consuelo-su-psicoterapeuta-2.jpg`), PSICOLOGÍA INDIVIDUAL (`por_que_fazer_terapia.width-1920-1.jpg`). Ojo: en el dump las listas aparecen antes de su encabezado por el orden del DOM; asignar cada lista al encabezado que le corresponde según la captura `especialidades__psicologia-desktop.png`. | `[fisioterapia, podologia, medicina-general, servicio-de-estetica]` |
| `medicina-general` | `MEDICINA GENERAL Y TRASTORNOS DEL SUEÑO` / `medicina-general` / 3 / menuLabel `Medicina General y Trastornos de Sueño` | 5 `topics` con `heading`, `image`, un item con `title` = la línea h3 y `showAppointment: true`: DICTAMEN MÉDICO (`7xm.xyz934175.jpg`), ENFERMEDADES CRÓNICAS (`rheumatoid-arthritis-1-1.jpg`), ENFERMEDADES AGUDAS (`7xmxyz379062.jpg`), TRASTORNOS DEL SUEÑO (`WhatsApp-Image-2024-03-15-at-20.35.57.jpeg`), CIRUGÍA MENOR (`WhatsApp-Image-2024-03-15-at-20.57.39.jpeg`) | `[fisioterapia, psicologia, podologia, servicio-de-estetica]` |
| `fisioterapia` | ver ejemplo | | |
| `pedicure-clinico` | `Pedicure clínico` / `pedicure-clinico` / 5 / menuLabel `Pedicure Clínico` / `showBackHome: false` | `showTreatmentsHeader: true`; 1 `condition` (heading vacío ⇒ usar `heading: ''` y no pintar h2 si está vacío; img `pedicure-clinico-8.jpg`, sub `- Pedicure clínico -`) + 1 `treatments` [Higiene y mantenimiento, Prevención, Cuidado especializado] | `[]` |
| `audiologia` | `Audiología` / `audiologia` / 6 / `showBackHome: false` | igual que pedicure: condition (img `7xmxyz379062.jpg`, sub `- Audiología -`) + treatments [Evaluación auditiva, Prevención y seguimiento, Soluciones auditivas] | `[]` |
| `escleroterapia` | `Escleroterapia` / `escleroterapia` / 7 / `showBackHome: false` | condition (img `escleroterapia-scaled-1.jpg`, sub `- Escleroterapia -`) + treatments [Tratamiento estético, Mejora circulatoria, Manejo progresivo] | `[]` |
| `servicio-de-estetica` | `SERVICIO DE ESTÉTICA` / `servicio-de-estetica` / 8 / `inMenu: false` / menuLabel `Servicio de Estética` | `heroImage: procedimiento-cosmetico-limpieza-facial-mujer-joven-que-usa-cuchara-tratamiento-acne-limpieza-mecanica-piel-facial_132375-14672.jpg`; 1 `topics` con 4 items solo título (Depilación Tri-laser, Limpiezas faciales, Masajes relajantes y terapéuticos, Masajes descontracturantes) y `showAppointment: true` | `[fisioterapia, psicologia, medicina-general, podologia]` |

Imágenes de `card` (las de la página Especialidades y las tarjetas "Ver más"): podologia `Podologo-y-Podiatra-1024x692-1.jpg` (en Especialidades) — para "Ver más" el original usa `WhatsApp-Image-2024-03-15-at-20.34.37.jpeg`; usar `card.image` = `WhatsApp-Image-2024-03-15-at-20.34.37.jpeg` y en la página Especialidades (Task 9) importar directamente `Podologo-y-Podiatra-1024x692-1.jpg`. psicologia `Como_se_diagnostica_la_diabetes-scaled-1.jpg` (Especialidades usa `testes-psicologicos-1.jpg`, Task 9 la importa directo). medicina-general `DPC-2-1.jpg` (Especialidades usa `7xm.xyz934175.jpg`). fisioterapia `Fisioterapia-deportiva-que-es-tipos-ventajas-y-desventajas.jpg`. servicio-de-estetica `1661351690796.jpg`. pedicure-clinico `pedicure-clinico-8.jpg`, audiologia `7xmxyz379062.jpg`, escleroterapia `escleroterapia-scaled-1.jpg`.

- [ ] **Step 4: Entradas de `specialists`**

Texto literal de `reference/source/nuestros-especialistas.md`. Un YAML por persona, `order` según aparición. Ejemplo completo `src/content/specialists/marvin-madrigal.yaml`:

```yaml
name: Dr. Marvin Madrigal Cháves
shortName: Dr. Marvin Madrigal
role: Enfermero-Podólogo
code: "Códigos: #Lic 2610 (Enfermero) TEC5185 (Podólogo)"
photo: ../../assets/WhatsApp-Image-2024-03-15-at-20.32.18-1-e1764877185688.jpeg
profile:
  - Maestría Intervención Terapéutica.  Universidad de Costa Rica.
  - Posgrado en Curación de Heridas. Instituto de Heridas. Santiago, Chile.
  - Licenciado en Enfermería con especialidad en Salud Mental. Universidad de Costa Rica.
  - Técnico especializado en Podología Clínica. Universidad Americana.
  - Diplomado en Pie Diabético; Universidad Marista , Guadalajara México.
  - Rotación en Clínica del Pie Diabético,  Universidad Complutense, Madrid España.
  - Expresidente de la Asociación Costarricense de Heridas y Ostomías.
  - Expresidente de la Asociación Costarricense de Profesionales en Podología.
  - Exprosecretario de la Confederación Multidisciplinar Latinoamericana de Heridas, Estomas e Incontinencia.
  - CEO y director clínico de Clínica Angular-Costa Rica
group: clinico
order: 1
featured: true
featuredRole: Podología
```

Los valores con salto de línea (`\n`) van entre comillas dobles en YAML para que el `\n` se interprete: `role: "Médico y Cirujano\nEspecialista en Trastornos del Sueño"`.

Lista completa (id → name / role / code / photo / group / order / featured):

1. `marvin-madrigal` (arriba).
2. `milagro-quesada` → Dra. Milagro Quesada Villegas / Psicóloga Clínica / `Código: #1030` / `consultorio-910x1024.jpg` → sin sufijo `consultorio.jpg` / clinico / 2 / featured, featuredRole Psicología, shortName `Dra. Milagro Quesada`. En el home su foto es `Mila-fondo-bl-seria.jpg` (Task 8 la importa directo).
3. `rebeca-ruiz` → Dra. Rebeca Ruiz / Podóloga - Fisioterapeuta / `Código: PAF2184` / `Rebeca-Ruiz.jpg` / clinico / 3.
4. `daniela-calderon` → Dra. Daniela Calderón Ulloa. / Fisioterapeuta / `Código: TF-3836` / `Captura-de-pantalla-2026-03-16-114852.png` / clinico / 4 / featured, featuredRole Fisioterapia, shortName `Lic. Daniela Calderón`.
5. `maynor-quiros` → Dr. Maynor Quirós Sandoval / Enfermero y Especialista en Curación de Heridas / `Código: 3617` / `Dr-Maynor-Quiros.jpg` / clinico / 5.
6. `ana-mora` → Dra. Ana Mora Rojas / `Médico y Cirujano\nEspecialista en Trastornos del Sueño` / `Código: 5965` / `Dra-Ana-Mora-2.jpg` / clinico / 6.
7. `adrian-solano` → Dr. Adrián Solano Salazar / Audiología / `Código: AU-0002` / `Captura-de-pantalla-2026-03-16-115144.png` / clinico / 7.
8. `ricardo-saenz` → Dr. Ricardo Sáenz Coto / Médico General / `Código: 11821` / `Captura-de-pantalla-2026-03-16-115438.png` / clinico / 8.
9. `amada-sequeira` → Téc. Amada Sequeira Chaves / Pedicure Clínico y Estético / sin code / `Amada-Sequeira-1-1.jpg` / clinico / 9.
10. `leticia-piedra` → Téc. Leticia Piedra Quesada / Pedicure Clínico y Estético / sin code / `Captura-de-pantalla-2026-03-16-115710.png` / clinico / 10.
11. `cindy-chacon` → Téc. Cindy Chacón Cortés / Pedicure Clínico y Estético / sin code / `Captura-de-pantalla-2026-03-16-115818.png` / clinico / 11.
12. `marvin-fernandez` → `Lic. Marvin Erick\nFernández Sánchez` / Administrador / sin code / `IMG_2930R.jpg` / administrativo / 12.
13. `marcela-sanchez` → Lic. Marcela Sánchez Valverde (el original repite "Marcela Sánchez" por error de plantilla; dejar una sola vez) / Gestora de Pacientes / `Código: TF475` / `Captura-de-pantalla-2026-03-16-120125.png` / administrativo / 13.
14. `leticia-piedra-esterilizacion` → Leticia Piedra Quesada / Asistente de esterilización / sin code / `Captura-de-pantalla-2026-03-16-115710.png` / administrativo / 14 / `profileTitle: Perfil del Puesto`.
15. `alejandra-zumbado` → Téc. Alejandra Zumbado Chacón / Asistente Administrativo / sin code / `Captura-de-pantalla-2026-03-16-120538.png` / administrativo / 15 / `profileTitle: Perfil del Puesto`.

(Son 15 personas, no 18; el spec decía "equipo" sin número.) Si `Rebeca-Ruiz.jpg` u otro original sin sufijo no se descargó, revisar `src/assets/` y usar el nombre que exista.

- [ ] **Step 5: Verificar que las colecciones validan**

```bash
pnpm check && pnpm build 2>&1 | tail -5
```

Esperado: sin errores de esquema (`InvalidContentEntryDataError`) ni de imágenes no encontradas. Aún no hay páginas que las usen; el build solo valida.

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts src/content
git commit -m "feat: colecciones de servicios y especialistas con el contenido original

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Layout base, TopBar, Header, Footer y botón de WhatsApp

**Files:**
- Create: `src/layouts/Base.astro`, `src/components/TopBar.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/WhatsAppButton.astro`, `src/components/icons/Social.astro`
- Modify: `src/pages/index.astro` (usar el layout; el contenido real llega en Task 8)

**Interfaces:**
- Produces: `<Base title="…" description?>` con slot por defecto. Props: `title: string` (se usa tal cual en `<title>`), `description?: string`, `ogImage?: ImageMetadata`.
- `Social` recibe `name: 'facebook' | 'instagram' | 'tiktok'` y pinta el SVG inline (Font Awesome brands, `fill="currentColor"`), tamaño por `class`.

Referencia visual: `reference/screenshots/index-desktop.png` (parte superior) y `index-mobile.png`; CSS en `reference/css/post-235.css` (header) y `post-475.css` (footer).

- [ ] **Step 1: `src/components/icons/Social.astro`**

```astro
---
interface Props { name: 'facebook' | 'instagram' | 'tiktok'; class?: string }
const { name, class: cls = 'h-4 w-4' } = Astro.props;
const paths = {
  facebook: 'M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z',
  instagram: 'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z',
  tiktok: 'M448 209.91a210.06 210.06 0 0 1-122.77-39.25v178.72A162.55 162.55 0 1 1 185 188.31v89.89a74.62 74.62 0 1 0 52.23 71.18V0h88a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z',
};
const viewBox = { facebook: '0 0 320 512', instagram: '0 0 448 512', tiktok: '0 0 448 512' }[name];
const label = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok' }[name];
---
<svg class={cls} viewBox={viewBox} fill="currentColor" aria-hidden="true" role="img"><title>{label}</title><path d={paths[name]} /></svg>
```

- [ ] **Step 2: `src/components/TopBar.astro`**

Barra blanca: logo a la izquierda (`Logo-Angular-2-e1770681953456.png`, alto ≈ 70px), cuatro cajas con icono + título en negrita 13px + valor 12px (Teléfono, Whatsapp, Correo, Horario), e iconos sociales redondos a la derecha (fondo `primary`, icono blanco, 28px). En móvil (`< lg`) solo se muestra el logo centrado y los iconos sociales.

```astro
---
import { Image } from 'astro:assets';
import logo from '../assets/Logo-Angular-2-e1770681953456.png';
import { site } from '../data/site';
import Social from './icons/Social.astro';

const items = [
  { icon: 'phone', title: 'Teléfono', lines: [site.phone], href: site.phoneHref },
  { icon: 'whatsapp', title: 'Whatsapp', lines: [site.whatsapp], href: `https://wa.me/506${site.whatsapp.replace('-', '')}` },
  { icon: 'mail', title: 'Correo', lines: [site.email], href: `mailto:${site.email}` },
  { icon: 'clock', title: 'Horario', lines: site.hours },
];
const icons: Record<string, string> = {
  phone: 'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z',
  whatsapp: 'M20.5 3.5A11.8 11.8 0 0 0 12 0C5.5 0 .2 5.3.2 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7a11.9 11.9 0 0 0 5.7 1.5c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.9 9.9 0 1 1 8.3 4.6zm5.4-7.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1l-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.5.7.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4z',
  mail: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.5 5v5.3l4.2 2.5-.8 1.2L11 13V7z',
};
---
<div class="border-b border-gray-100 bg-white">
  <div class="container-site flex items-center justify-between gap-4 py-3">
    <a href="/" class="shrink-0" aria-label="Clínica Angular">
      <Image src={logo} alt="Clínica Angular" height={70} class="h-[70px] w-auto" loading="eager" />
    </a>
    <ul class="hidden items-start gap-8 lg:flex">
      {items.map((it) => (
        <li class="flex items-start gap-2">
          <svg class="mt-0.5 h-5 w-5 shrink-0 text-accent" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={icons[it.icon]} /></svg>
          <div>
            <h3 class="text-[13px] font-semibold text-primary">{it.title}</h3>
            {it.lines.map((l) => (
              <p class="text-[12px] leading-4 text-text">{it.href ? <a href={it.href} class="hover:text-primary">{l}</a> : l}</p>
            ))}
          </div>
        </li>
      ))}
    </ul>
    <ul class="flex items-center gap-2">
      {(['facebook', 'instagram', 'tiktok'] as const).map((n) => (
        <li>
          <a href={site.social[n]} target="_blank" rel="noopener" class="grid h-7 w-7 place-items-center rounded-full bg-primary text-white hover:bg-accent" aria-label={n}>
            <Social name={n} class="h-3.5 w-3.5" />
          </a>
        </li>
      ))}
    </ul>
  </div>
</div>
```

- [ ] **Step 3: `src/components/Header.astro`** (barra morada con menú, submenús y hamburguesa)

```astro
---
import { getCollection } from 'astro:content';
import { nav } from '../data/site';

const services = (await getCollection('services'))
  .filter((s) => s.data.inMenu)
  .sort((a, b) => a.data.order - b.data.order)
  .map((s) => ({ label: s.data.menuLabel, href: `/${s.data.slug}/` }));

const items = nav.map((i) => (i.label === 'Especialidades' ? { ...i, children: services } : i));
const current = Astro.url.pathname;
const isActive = (href: string) => href !== '#' && (href === '/' ? current === '/' : current.startsWith(href));
---
<header class="sticky top-0 z-40 bg-primary text-white shadow">
  <div class="container-site flex items-center justify-between">
    <button id="menu-toggle" class="flex items-center gap-2 py-3 text-[12px] font-semibold uppercase tracking-wide lg:hidden" aria-controls="main-nav" aria-expanded="false">
      <span class="i-burger block h-[2px] w-6 bg-white shadow-[0_7px_0_#fff,0_-7px_0_#fff]"></span>
      Menú
    </button>
    <nav id="main-nav" class="hidden w-full lg:block" aria-label="Principal">
      <ul class="flex flex-col lg:flex-row lg:justify-between">
        {items.map((item) => (
          <li class="group relative">
            <a
              href={item.href}
              class:list={[
                'flex items-center justify-between px-5 py-4 text-[12px] font-semibold uppercase tracking-wide transition-colors hover:bg-accent hover:text-primary',
                isActive(item.href) && 'bg-accent text-primary',
              ]}
              aria-haspopup={item.children ? 'true' : undefined}
            >
              {item.label}
              {item.children && <svg class="ml-1 h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M5.5 7.5 10 12l4.5-4.5z" /></svg>}
            </a>
            {item.children && (
              <ul class="submenu bg-white text-primary lg:invisible lg:absolute lg:left-0 lg:top-full lg:min-w-[260px] lg:opacity-0 lg:shadow-lg lg:transition lg:group-hover:visible lg:group-hover:opacity-100">
                {item.children.map((c) => (
                  <li>
                    <a href={c.href} class="block border-b border-gray-100 px-5 py-3 text-[12px] font-medium hover:bg-accent">{c.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  </div>
</header>

<script>
  const btn = document.getElementById('menu-toggle');
  const navEl = document.getElementById('main-nav');
  btn?.addEventListener('click', () => {
    const open = navEl!.classList.toggle('hidden') === false;
    btn.setAttribute('aria-expanded', String(open));
  });
</script>
```

- [ ] **Step 4: `src/components/Footer.astro`**

Fondo `primary`. Tres columnas en escritorio (logo | pagos | Contáctenos) y una franja inferior con el copyright. Se **omiten** los iconos Twitter/Dribbble/Youtube/Pinterest/Medium del original.

```astro
---
import { Image } from 'astro:assets';
import logo from '../assets/Logo-Angular-1.png';
import payments from '../assets/Contactenos-footer.png';
import cards from '../assets/Group-245464935-1.png';
import { site } from '../data/site';
import Social from './icons/Social.astro';
---
<footer class="bg-primary text-white">
  <div class="container-site grid gap-10 py-12 md:grid-cols-3">
    <div>
      <Image src={logo} alt="Clínica Angular" width={260} class="w-[260px]" />
    </div>
    <div>
      <h2 class="text-[22px] font-semibold text-accent">Verified by Visa and Master Card</h2>
      <Image src={payments} alt="Verified by Visa y MasterCard SecureCode" width={220} class="my-4 w-[220px]" />
      <h2 class="text-[14px] font-medium text-white">La forma segura de pagar en línea.</h2>
      <Image src={cards} alt="Tarjetas aceptadas" width={260} class="mt-3 w-[260px]" />
    </div>
    <div>
      <h2 class="text-[22px] font-semibold text-accent">Contáctenos</h2>
      <ul class="mt-4 space-y-3 text-[14px]">
        <li class="flex gap-3"><span class="text-accent">📍</span><h3 class="font-normal text-white">{site.addresses.footer.map((l) => <span class="block">{l}</span>)}</h3></li>
        <li class="flex gap-3"><span class="text-accent">📞</span><h3 class="font-normal text-white"><a href={site.phoneHref}>{site.phoneIntl}</a></h3></li>
        <li class="flex gap-3"><span class="text-accent">✉️</span><h3 class="font-normal text-white"><a href={`mailto:${site.email}`}>{site.email}</a></h3></li>
      </ul>
      <ul class="mt-5 flex gap-2">
        {(['facebook', 'instagram', 'tiktok'] as const).map((n) => (
          <li><a href={site.social[n]} target="_blank" rel="noopener" aria-label={n} class="grid h-8 w-8 place-items-center rounded-full bg-accent text-primary hover:bg-white"><Social name={n} class="h-4 w-4" /></a></li>
        ))}
      </ul>
    </div>
  </div>
  <div class="border-t border-white/10">
    <p class="container-site py-4 text-[12px] text-white/80">{site.copyright}</p>
  </div>
</footer>
```

Reemplazar los tres emojis por los SVG de ubicación/teléfono/correo del original (comparar con `index-desktop.png`, pie de página) usando paths de Font Awesome inline con `fill="currentColor"` y color `accent`.

- [ ] **Step 5: `src/components/WhatsAppButton.astro`**

Botón flotante verde (`#25d366`) abajo a la derecha, 60px, con globo que se abre al hacer clic mostrando el saludo del original y un botón "Chat Directo".

```astro
---
import { CHAT_URL } from '../lib/whatsapp';
---
<div id="joinchat" class="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
  <div id="joinchat-box" class="hidden w-[300px] overflow-hidden rounded-3xl bg-white shadow-2xl">
    <div class="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
      <span class="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-lg">👋</span>
      <div><p class="text-[15px] font-semibold">Clínica Angular</p><p class="text-[12px] opacity-80">Consultas y dudas</p></div>
    </div>
    <div class="bg-[#e5ddd5] p-4 text-[14px] text-slate-800">
      <div class="inline-block rounded-2xl rounded-tl-none bg-white px-3 py-2 shadow">Hola 👋, Bienvenido a Clínica Angular<br />Cómo podemos servirle?</div>
    </div>
    <a href={CHAT_URL} target="_blank" rel="noopener" class="block bg-white py-3 text-center text-[15px] font-semibold text-[#128c7e] hover:bg-gray-50">Chat Directo</a>
  </div>
  <button id="joinchat-btn" class="grid h-[60px] w-[60px] place-items-center rounded-full bg-whatsapp text-white shadow-lg transition hover:scale-105" aria-label="Abrir chat de WhatsApp" aria-expanded="false">
    <svg class="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12 0C5.5 0 .2 5.3.2 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7a11.9 11.9 0 0 0 5.7 1.5c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.9 9.9 0 1 1 8.3 4.6zm5.4-7.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1l-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.5.7.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4z" /></svg>
  </button>
</div>
<script>
  const b = document.getElementById('joinchat-btn');
  const box = document.getElementById('joinchat-box');
  b?.addEventListener('click', () => {
    const open = box!.classList.toggle('hidden') === false;
    b.setAttribute('aria-expanded', String(open));
  });
</script>
```

- [ ] **Step 6: `src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';
import TopBar from '../components/TopBar.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import WhatsAppButton from '../components/WhatsAppButton.astro';
import { site } from '../data/site';

// El sitio original no tiene meta description en ninguna página; se usa una genérica.
interface Props { title: string; description?: string }
const { title, description = 'Clínica Angular: podología clínica, tratamiento avanzado de heridas, fisioterapia, psicología y medicina general en Guadalupe, San José, Costa Rica.' } = Astro.props;
const canonical = new URL(Astro.url.pathname, site.url).href;
---
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={site.name} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={new URL('/favicon.png', site.url).href} />
    <meta property="og:locale" content="es_CR" />
  </head>
  <body class="min-h-screen bg-white">
    <a href="#contenido" class="sr-only focus:not-sr-only">Omitir e ir al contenido</a>
    <TopBar />
    <Header />
    <main id="contenido"><slot /></main>
    <Footer />
    <WhatsAppButton />
  </body>
</html>
```

- [ ] **Step 7: Usar el layout en `src/pages/index.astro` (temporal)**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="Clínica Angular">
  <section class="container-site py-16"><h1 class="text-4xl">Inicio (en construcción)</h1></section>
</Base>
```

- [ ] **Step 8: Verificar**

```bash
pnpm check && pnpm build && grep -o 'href="/especialidades/podologia/"' dist/index.html | head -1 && grep -c 'api.whatsapp.com/send' dist/index.html && grep -c 'Productos' dist/index.html
```

Esperado: enlace a podología presente, `1` o más para WhatsApp, y `0` para "Productos". Abrir `pnpm dev` y comparar con `reference/screenshots/index-desktop.png` (parte superior) e `index-mobile.png`: barra blanca con logo e iconos, menú morado con ítem activo en color accent, hamburguesa en móvil, footer morado de tres columnas.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: layout base con barra superior, menú, footer y botón de WhatsApp

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Componentes compartidos (Button, ContactForm, ContactSection, BackHome, ServiceCard, SpecialistCard)

**Files:**
- Create: `src/components/Button.astro`, `src/components/ContactForm.astro`, `src/components/ContactSection.astro`, `src/components/BackHome.astro`, `src/components/ServiceCard.astro`, `src/components/SpecialistCard.astro`, `src/components/ChatButton.astro`, `src/components/AppointmentButton.astro`

**Interfaces:**
- `Button`: props `href: string`, `variant?: 'accent' | 'primary' | 'white' | 'chat'` (default `accent`), `class?`, `target?`; renderiza `<a>` con `rounded-full px-7 py-3 text-[13px] font-semibold uppercase`.
- `ChatButton`: botón verde "CHAT DIRECTO" (`bg-chat`) a `CHAT_URL`. `AppointmentButton`: botón "Agendar cita" (`bg-primary`) a `CHAT_URL`.
- `ContactForm`: sin props. IDs de campos `name, email, phone, message`. Al enviar abre `buildAppointmentUrl`.
- `ContactSection`: props `address: string`, `showMap?: boolean` (default true), `showChat?: boolean` (default true), `title?: string` (default `¡Contáctenos!`), `subtitle?: string` (default `¡OBTENGA SU CITA YA!`).
- `BackHome`: sin props; sección centrada con título "Volver al Inicio" enlazado a `/`.
- `ServiceCard`: props `label: string`, `href: string`, `image: ImageMetadata`.
- `SpecialistCard`: props `entry: CollectionEntry<'specialists'>`.

- [ ] **Step 1: `Button.astro`, `ChatButton.astro`, `AppointmentButton.astro`**

```astro
---
// src/components/Button.astro
interface Props { href: string; variant?: 'accent' | 'primary' | 'white' | 'chat'; class?: string; target?: string }
const { href, variant = 'accent', class: cls = '', target } = Astro.props;
const styles = {
  accent: 'bg-accent text-primary hover:bg-accent-dark hover:text-white',
  primary: 'bg-primary text-white hover:bg-purple-dark',
  white: 'bg-white text-primary hover:bg-accent',
  chat: 'bg-chat text-white hover:bg-[#2fb878]',
};
---
<a href={href} target={target} rel={target === '_blank' ? 'noopener' : undefined} class:list={['inline-block rounded-full px-7 py-3 text-[13px] font-semibold uppercase tracking-wide transition-colors', styles[variant], cls]}><slot /></a>
```

```astro
---
// src/components/ChatButton.astro
import Button from './Button.astro';
import { CHAT_URL } from '../lib/whatsapp';
const { class: cls = '' } = Astro.props;
---
<Button href={CHAT_URL} variant="chat" target="_blank" class={cls}>Chat directo</Button>
```

```astro
---
// src/components/AppointmentButton.astro
import Button from './Button.astro';
import { CHAT_URL } from '../lib/whatsapp';
const { class: cls = '' } = Astro.props;
---
<Button href={CHAT_URL} variant="primary" target="_blank" class={cls}>Agendar cita</Button>
```

- [ ] **Step 2: `ContactForm.astro`**

```astro
---
// Formulario "Generar una cita": abre WhatsApp con el mensaje prellenado. Sin backend.
---
<form id="appointment-form" class="space-y-3" novalidate>
  <label class="block"><span class="sr-only">Name</span><input name="name" id="name" type="text" required placeholder="Name" class="w-full rounded-full border border-primary/30 bg-white px-4 py-2.5 text-[14px] outline-none focus:border-primary" /></label>
  <label class="block"><span class="sr-only">Email</span><input name="email" id="email" type="email" required placeholder="Email" class="w-full rounded-full border border-primary/30 bg-white px-4 py-2.5 text-[14px] outline-none focus:border-primary" /></label>
  <label class="block"><span class="sr-only">Phone number</span><input name="phone" id="phone" type="tel" required placeholder="Phone number" class="w-full rounded-full border border-primary/30 bg-white px-4 py-2.5 text-[14px] outline-none focus:border-primary" /></label>
  <label class="block"><span class="sr-only">Message</span><textarea name="message" id="message" rows="4" placeholder="Message" class="w-full rounded-3xl border border-primary/30 bg-white px-4 py-2.5 text-[14px] outline-none focus:border-primary"></textarea></label>
  <p id="form-error" class="hidden text-[13px] text-red-600">Complete nombre, correo y teléfono.</p>
  <button type="submit" class="w-full rounded-full bg-primary py-3 text-[13px] font-semibold uppercase tracking-wide text-white hover:bg-purple-dark">Generar una cita</button>
  <a id="form-fallback" href="#" target="_blank" rel="noopener" class="hidden text-center text-[13px] text-primary underline">Si no se abrió WhatsApp, toque aquí.</a>
</form>
<script>
  import { buildAppointmentUrl } from '../lib/whatsapp';
  document.querySelectorAll<HTMLFormElement>('#appointment-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = (id: string) => (form.querySelector<HTMLInputElement>(`[name="${id}"]`)?.value ?? '');
      const fields = { name: f('name'), email: f('email'), phone: f('phone'), message: f('message') };
      const err = form.querySelector<HTMLElement>('#form-error')!;
      if (!form.checkValidity()) { err.classList.remove('hidden'); return; }
      err.classList.add('hidden');
      const url = buildAppointmentUrl(fields);
      const fb = form.querySelector<HTMLAnchorElement>('#form-fallback')!;
      fb.href = url; fb.classList.remove('hidden');
      window.open(url, '_blank', 'noopener');
    });
  });
</script>
```

- [ ] **Step 3: `ContactSection.astro`**

Bloque con fondo `accent`: izquierda tarjeta blanca (título grande `¡Contáctenos!` en accent, subtítulo `¡OBTENGA SU CITA YA!` en primary, formulario); derecha mapa embebido + dirección + teléfono + botón CHAT DIRECTO. Ver `index-desktop.png` (sección naranja inferior).

```astro
---
import ContactForm from './ContactForm.astro';
import ChatButton from './ChatButton.astro';
import { site } from '../data/site';

interface Props { address: string; showMap?: boolean; showChat?: boolean; title?: string; subtitle?: string }
const { address, showMap = true, showChat = true, title = '¡Contáctenos!', subtitle = '¡OBTENGA SU CITA YA!' } = Astro.props;
---
<section class="bg-accent py-14">
  <div class="container-site grid items-start gap-8 lg:grid-cols-2">
    <div class="rounded-3xl bg-white p-8 shadow-sm">
      <h3 class="text-[35px] font-semibold leading-none text-accent md:text-[45px]">{title}</h3>
      <p class="mb-6 mt-2 text-[15px] font-semibold uppercase text-primary">{subtitle}</p>
      <ContactForm />
    </div>
    <div class="space-y-5">
      {showMap && (
        <div class="overflow-hidden rounded-3xl bg-white p-2 shadow-sm">
          <iframe src={site.mapEmbedUrl} title="Ubicación de Clínica Angular" class="h-[300px] w-full rounded-2xl border-0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        </div>
      )}
      <h3 class="flex items-start gap-3 text-[15px] font-medium text-primary"><span aria-hidden="true">📍</span>{address}</h3>
      <h3 class="flex items-center gap-3 text-[15px] font-medium text-primary"><span aria-hidden="true">📞</span><a href={site.phoneHref}>{site.phoneIntl}</a></h3>
      {showChat && <ChatButton />}
    </div>
  </div>
</section>
```

Sustituir los emojis por los mismos SVG de ubicación/teléfono usados en el Footer (extraer a `src/components/icons/Contact.astro` con prop `name: 'pin' | 'phone' | 'mail'` y usarlo en Footer, TopBar y aquí).

- [ ] **Step 4: `BackHome.astro`, `ServiceCard.astro`, `SpecialistCard.astro`**

```astro
---
// src/components/BackHome.astro
---
<section class="py-10 text-center">
  <h2 class="text-[25px] font-semibold"><a href="/" class="text-primary hover:text-accent-dark">Volver al Inicio</a></h2>
</section>
```

```astro
---
// src/components/ServiceCard.astro
import { Image } from 'astro:assets';
interface Props { label: string; href: string; image: ImageMetadata }
const { label, href, image } = Astro.props;
---
<a href={href} class="group block overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg">
  <Image src={image} alt={label} width={600} height={400} class="aspect-[3/2] w-full object-cover" />
  <h2 class="px-4 py-4 text-center text-[19px] font-semibold text-primary group-hover:text-accent-dark">{label}</h2>
</a>
```

```astro
---
// src/components/SpecialistCard.astro
import { Image } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';
interface Props { entry: CollectionEntry<'specialists'>; reverse?: boolean }
const { entry, reverse = false } = Astro.props;
const d = entry.data;
---
<article class:list={['grid items-center gap-8 py-10 md:grid-cols-[320px_1fr]', reverse && 'md:[&>*:first-child]:order-2']}>
  <div class="text-center">
    <h6 class="mb-3 text-[15px] font-semibold uppercase tracking-wide text-accent-dark" set:html={d.role.replace(/\n/g, '<br />')} />
    <Image src={d.photo} alt={d.name} width={320} height={400} class="mx-auto aspect-[4/5] w-[260px] rounded-3xl object-cover object-top shadow-md" />
  </div>
  <div>
    <h2 class="text-[25px] font-semibold text-primary md:text-[35px]" set:html={d.name.replace(/\n/g, '<br />')} />
    {d.code && <h2 class="mt-1 text-[16px] font-medium text-text">{d.code}</h2>}
    <h2 class="mt-4 text-[19px] font-semibold text-accent-dark">{d.profileTitle}</h2>
    <ul class="mt-2 space-y-1 text-[15px] leading-relaxed text-text">
      {d.profile.map((line) => <li>{line}</li>)}
    </ul>
  </div>
</article>
```

- [ ] **Step 5: Verificar con una página de prueba temporal**

Crear `src/pages/_probe.astro` (el guion bajo evita que se publique) que use `ContactSection`, `ServiceCard` (con la card de fisioterapia obtenida con `getEntry('services','fisioterapia')`), `SpecialistCard` (marvin-madrigal) y `BackHome`. Correr `pnpm check && pnpm build`. Luego `pnpm dev`, abrir `/_probe/` no existe: renombrar temporalmente a `probe.astro`, ver en el navegador, y borrarla antes del commit.

```bash
pnpm check && pnpm build && rm -f src/pages/probe.astro src/pages/_probe.astro
```

- [ ] **Step 6: Commit**

```bash
git add src/components
git commit -m "feat: componentes compartidos (botones, formulario de cita, sección de contacto, tarjetas)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Plantilla de servicios `[...slug].astro` y "Ver más especialidades"

**Files:**
- Create: `src/pages/[...slug].astro`, `src/components/RelatedServices.astro`, `src/components/service/ConditionSection.astro`, `src/components/service/TreatmentsSection.astro`, `src/components/service/TopicsSection.astro`

**Interfaces:**
- Consumes: colección `services` (Task 4), `ChatButton`, `AppointmentButton`, `BackHome`, `ServiceCard` (Task 6).
- Produces: rutas `/especialidades/podologia/`, `/especialidades/psicologia/`, `/fisioterapia/`, `/medicina-general/`, `/servicio-de-estetica/`, `/pedicure-clinico/`, `/audiologia/`, `/escleroterapia/`. `RelatedServices` recibe `ids: string[]`.

Referencia visual: `reference/screenshots/especialidades__podologia-desktop.png`, `fisioterapia-desktop.png`, `medicina-general-desktop.png`, `especialidades__psicologia-desktop.png`, `pedicure-clinico-desktop.png`.

- [ ] **Step 1: Componentes de sección**

```astro
---
// src/components/service/ConditionSection.astro
import { Image } from 'astro:assets';
import ChatButton from '../ChatButton.astro';
interface Props { heading: string; image: ImageMetadata; subheading?: string; body: string[]; imageSide: 'left' | 'right'; showChat: boolean }
const { heading, image, subheading, body, imageSide, showChat } = Astro.props;
---
<section class="container-site py-10">
  {heading && <h2 class="mb-6 text-center text-[25px] font-semibold uppercase text-primary md:text-[35px]">{heading}</h2>}
  <div class:list={['grid items-center gap-8 md:grid-cols-2', imageSide === 'right' && 'md:[&>*:first-child]:order-2']}>
    <Image src={image} alt={heading || subheading || ''} width={640} height={480} class="w-full rounded-3xl object-cover shadow-md" />
    <div>
      {subheading && <h3 class="mb-3 text-[20px] font-semibold text-accent-dark">{subheading}</h3>}
      {body.map((p) => <p class="mb-3 text-[15px] leading-relaxed text-text">{p}</p>)}
      {showChat && <ChatButton class="mt-2" />}
    </div>
  </div>
</section>
```

```astro
---
// src/components/service/TreatmentsSection.astro
import AppointmentButton from '../AppointmentButton.astro';
interface Props { heading?: string; items: { title: string; body: string[] }[]; showAppointment: boolean }
const { heading, items, showAppointment } = Astro.props;
const isCheck = (p: string) => p.trim().startsWith('✓');
---
<section class="bg-gray-50 py-10">
  <div class="container-site">
    {heading && <h2 class="mb-6 text-center text-[25px] font-semibold text-primary">{heading}</h2>}
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <div class="rounded-3xl bg-white p-6 shadow-sm">
          <h3 class="mb-2 text-[19px] font-semibold text-primary">{it.title}</h3>
          {it.body.map((p) => (isCheck(p) ? <p class="text-[15px] leading-relaxed text-text">{p}</p> : <p class="mb-2 text-[15px] leading-relaxed text-text">{p}</p>))}
        </div>
      ))}
    </div>
    {showAppointment && <div class="mt-8 text-center"><AppointmentButton /></div>}
  </div>
</section>
```

```astro
---
// src/components/service/TopicsSection.astro
import { Image } from 'astro:assets';
import AppointmentButton from '../AppointmentButton.astro';
import ChatButton from '../ChatButton.astro';
interface Props { heading?: string; image?: ImageMetadata; imageSide: 'left' | 'right'; items: { title?: string; body: string[] }[]; showAppointment: boolean; showChat: boolean }
const { heading, image, imageSide, items, showAppointment, showChat } = Astro.props;
---
<section class="container-site py-10">
  {heading && <h2 class="mb-6 text-center text-[25px] font-semibold uppercase text-primary md:text-[35px]" set:html={heading.replace(/\n/g, '<br />')} />}
  <div class:list={['grid items-start gap-8', image && 'md:grid-cols-2', image && imageSide === 'right' && 'md:[&>*:first-child]:order-2']}>
    {image && <Image src={image} alt={heading ?? ''} width={640} height={480} class="w-full rounded-3xl object-cover shadow-md" />}
    <div class="space-y-6">
      {items.map((it) => (
        <div>
          {it.title && <h2 class="mb-2 text-[20px] font-semibold text-primary">{it.title}</h2>}
          {it.body.map((p) => <p class="mb-2 text-[15px] leading-relaxed text-text">{p}</p>)}
        </div>
      ))}
      <div class="flex flex-wrap gap-3">
        {showChat && <ChatButton />}
        {showAppointment && <AppointmentButton />}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: `RelatedServices.astro`**

```astro
---
import { getCollection } from 'astro:content';
import ServiceCard from './ServiceCard.astro';
interface Props { ids: string[] }
const { ids } = Astro.props;
const all = await getCollection('services');
const items = ids.map((id) => all.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => Boolean(s));
---
{items.length > 0 && (
  <section class="bg-gray-50 py-12">
    <div class="container-site">
      <h2 class="mb-8 text-center text-[30px] font-semibold text-primary md:text-[35px]">Ver más especialidades</h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s) => <ServiceCard label={s.data.card.label} href={`/${s.data.slug}/`} image={s.data.card.image} />)}
      </div>
    </div>
  </section>
)}
```

- [ ] **Step 3: `src/pages/[...slug].astro`**

```astro
---
import { getCollection } from 'astro:content';
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import ChatButton from '../components/ChatButton.astro';
import BackHome from '../components/BackHome.astro';
import RelatedServices from '../components/RelatedServices.astro';
import ConditionSection from '../components/service/ConditionSection.astro';
import TreatmentsSection from '../components/service/TreatmentsSection.astro';
import TopicsSection from '../components/service/TopicsSection.astro';

export async function getStaticPaths() {
  const services = await getCollection('services');
  return services.map((entry) => ({ params: { slug: entry.data.slug }, props: { entry } }));
}
const { entry } = Astro.props;
const d = entry.data;
---
<Base title={d.seoTitle}>
  <section class="container-site pt-12 text-center">
    <h2 class="text-[35px] font-semibold text-primary md:text-[45px]">{d.title}</h2>
    {d.showTreatmentsHeader && (
      <>
        <h2 class="mt-2 text-[20px] font-medium text-accent-dark md:text-[25px]">Padecimientos y Tratamientos</h2>
        <div class="mt-5"><ChatButton /></div>
      </>
    )}
    {d.heroImage && <Image src={d.heroImage} alt={d.title} width={1140} height={520} class="mx-auto mt-8 w-full rounded-3xl object-cover shadow-md" />}
    {d.showChatAfterHero && <div class="mt-6"><ChatButton /></div>}
  </section>

  {d.sections.map((s) => {
    if (s.type === 'condition') return <ConditionSection {...s} />;
    if (s.type === 'treatments') return <TreatmentsSection {...s} />;
    return <TopicsSection {...s} />;
  })}

  <RelatedServices ids={d.related} />
  {d.showBackHome && <BackHome />}
</Base>
```

- [ ] **Step 4: Verificar rutas y contenido**

```bash
pnpm check && pnpm build && for p in especialidades/podologia especialidades/psicologia fisioterapia medicina-general servicio-de-estetica pedicure-clinico audiologia escleroterapia; do test -f "dist/$p/index.html" && echo "ok $p" || echo "FALTA $p"; done
grep -c 'Ver más especialidades' dist/fisioterapia/index.html dist/audiologia/index.html
grep -o '<title>[^<]*' dist/especialidades/podologia/index.html
```

Esperado: 8 `ok`; fisioterapia `1`, audiologia `0`; título `Podología - Clínica Angular`. Comparar visualmente cada servicio con su captura de referencia en escritorio y móvil, ajustando espaciados, orden imagen/texto y tamaños de fuente para que coincidan.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: plantilla de servicios generada desde la colección con secciones y relacionados

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Página de Inicio

**Files:**
- Create: `src/components/home/HeroSlider.astro`, `src/components/home/Welcome.astro`, `src/components/home/SpecialtiesCarousel.astro`, `src/components/home/Team.astro`, `src/components/home/BenefitsBanner.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Base`, `Button`, `ChatButton`, `ContactSection`, colección `specialists` (featured), `site`.

Referencia: `reference/screenshots/index-desktop.png`, `index-mobile.png`, `reference/css/post-151.css`. Se omite la sección TIENDA.

- [ ] **Step 1: `HeroSlider.astro`** (Swiper, 7 slides, autoplay, paginación con puntos)

Slides en orden con imagen de fondo, título, descripción opcional, botón y enlace:

| # | Fondo (src/assets) | Título | Descripción | Botón → href |
|---|---|---|---|---|
| 1 | `Banner-2-e1770682456920.png` (móvil: `Diseno-sin-titulo.jpg`) | `BRINDAMOS MÁS QUE\nUN SERVICIO DE SALUD` | `Ofrecemos desde un proceso de acompañamiento, educación\ny curación, hasta todo el tratamiento posterior\nque requiera el paciente.` | Ver Especialidades → `/especialidades/` |
| 2 | `podologia-banner.jpg` | `PODOLOGÍA` | — | Más información → `/especialidades/podologia/` |
| 3 | `medicina-general-1.jpg` | `MEDICINA GENERAL Y\nTRASTORNOS DEL SUEÑO` | — | Más información → `/medicina-general/` |
| 4 | `Banner-6-e1764877042937.png` | `K-Laser CUBE 4` | `Somos la única clínica de podología en utilizar un láser de alta\npotencia en Costa Rica, capaz de penetrar en la profundidad de los\ntejidos, regenerar células y acelerar el tiempo de recuperación.` | Más información → `/k-laser/` |
| 5 | `Psicologia.jpg` | `PSICOLOGÍA` | — | Más información → `/especialidades/psicologia/` |
| 6 | `Fisioterapia.jpg` | `FISIOTERAPIA` | — | Más información → `/fisioterapia/` |
| 7 | `Estetica.jpg` | `SERVICIO DE ESTÉTICA` | — | Más información → `/servicio-de-estetica/` |

```astro
---
import { Image } from 'astro:assets';
import banner2 from '../../assets/Banner-2-e1770682456920.png';
import banner2Mobile from '../../assets/Diseno-sin-titulo.jpg';
import podologia from '../../assets/podologia-banner.jpg';
import medicina from '../../assets/medicina-general-1.jpg';
import banner6 from '../../assets/Banner-6-e1764877042937.png';
import psicologia from '../../assets/Psicologia.jpg';
import fisioterapia from '../../assets/Fisioterapia.jpg';
import estetica from '../../assets/Estetica.jpg';

const slides = [
  { bg: banner2, bgMobile: banner2Mobile, title: 'BRINDAMOS MÁS QUE\nUN SERVICIO DE SALUD', text: 'Ofrecemos desde un proceso de acompañamiento, educación\ny curación, hasta todo el tratamiento posterior\nque requiera el paciente.', cta: 'Ver Especialidades', href: '/especialidades/', dark: true },
  { bg: podologia, title: 'PODOLOGÍA', cta: 'Más información', href: '/especialidades/podologia/' },
  { bg: medicina, title: 'MEDICINA GENERAL Y\nTRASTORNOS DEL SUEÑO', cta: 'Más información', href: '/medicina-general/' },
  { bg: banner6, title: 'K-Laser CUBE 4', text: 'Somos la única clínica de podología en utilizar un láser de alta\npotencia en Costa Rica, capaz de penetrar en la profundidad de los\ntejidos, regenerar células y acelerar el tiempo de recuperación.', cta: 'Más información', href: '/k-laser/' },
  { bg: psicologia, title: 'PSICOLOGÍA', cta: 'Más información', href: '/especialidades/psicologia/' },
  { bg: fisioterapia, title: 'FISIOTERAPIA', cta: 'Más información', href: '/fisioterapia/' },
  { bg: estetica, title: 'SERVICIO DE ESTÉTICA', cta: 'Más información', href: '/servicio-de-estetica/' },
];
const br = (s: string) => s.replace(/\n/g, '<br />');
---
<section class="hero-swiper swiper relative h-[400px] md:h-[520px]" aria-label="Destacados">
  <div class="swiper-wrapper">
    {slides.map((s, i) => (
      <div class="swiper-slide relative">
        <Image src={s.bg} alt="" width={1920} height={640} class:list={['absolute inset-0 h-full w-full object-cover', s.bgMobile && 'hidden md:block']} loading={i === 0 ? 'eager' : 'lazy'} />
        {s.bgMobile && <Image src={s.bgMobile} alt="" width={800} height={800} class="absolute inset-0 h-full w-full object-cover md:hidden" loading="eager" />}
        <div class="container-site relative flex h-full items-center">
          <div class="max-w-[560px]">
            <h2 class:list={['text-[28px] font-semibold leading-tight md:text-[45px]', s.dark ? 'text-slide' : 'text-primary']} set:html={br(s.title)} />
            {s.text && <p class:list={['mt-4 text-[15px] leading-relaxed md:text-[16px]', s.dark ? 'text-slide' : 'text-text']} set:html={br(s.text)} />}
            <a href={s.href} class="mt-6 inline-block rounded-[22px] bg-accent px-7 py-3 text-[13px] font-semibold uppercase text-primary hover:bg-accent-dark hover:text-white">{s.cta}</a>
          </div>
        </div>
      </div>
    ))}
  </div>
  <div class="swiper-pagination !bottom-4"></div>
</section>

<style is:global>
  .hero-swiper .swiper-pagination-bullet { background: #fff; opacity: .7; width: 10px; height: 10px; }
  .hero-swiper .swiper-pagination-bullet-active { background: #3d387f; opacity: 1; }
</style>

<script>
  import Swiper from 'swiper';
  import { Autoplay, Pagination } from 'swiper/modules';
  import 'swiper/css';
  import 'swiper/css/pagination';
  new Swiper('.hero-swiper', {
    modules: [Autoplay, Pagination],
    loop: true,
    speed: 500,
    autoplay: { delay: 5000, disableOnInteraction: false },
    pagination: { el: '.hero-swiper .swiper-pagination', clickable: true },
  });
</script>
```

- [ ] **Step 2: `Welcome.astro`** (sección "¡Bienvenidos!")

```astro
---
import { Image } from 'astro:assets';
import building from '../../assets/WhatsApp-Image-2025-08-03-at-22.09.53-e1764877128450.jpeg';
import Button from '../Button.astro';
import ChatButton from '../ChatButton.astro';
import { CHAT_URL } from '../../lib/whatsapp';
---
<section class="container-site grid items-center gap-10 py-16 md:grid-cols-2">
  <div>
    <h3 class="text-[45px] font-semibold leading-none text-accent md:text-[65px]">¡Bienvenidos!</h3>
    <h3 class="mt-4 text-[19px] font-semibold text-primary md:text-[20px]">Podologia Clínica y Tratamiento avanzado de heridas</h3>
    <p class="mt-4 text-[15px] leading-relaxed text-text">Somos un centro especializado en podología clínica avanzada, pie diabético, biomecánica y tratamiento avanzado de heridas, con un enfoque centrado en prevención, criterio clínico, tecnología médica y atención multidisciplinaria.</p>
    <Button href={CHAT_URL} variant="primary" target="_blank" class="mt-6 normal-case">Hacer una cita o consultar.</Button>
  </div>
  <div class="text-center">
    <Image src={building} alt="Fachada de Clínica Angular" width={640} height={430} class="w-full rounded-3xl object-cover shadow-md" />
    <ChatButton class="mt-5" />
  </div>
</section>
```

- [ ] **Step 3: `SpecialtiesCarousel.astro`** (fondo accent, carrusel coverflow de 5 imágenes, botón "Más Información")

```astro
---
import { Image } from 'astro:assets';
import img1 from '../../assets/enfermera-paciente-sesion-osteopatia-1-e1764877090615.png';
import img2 from '../../assets/Que-diferencias-existen-entre-la-medicina-general-y-la-medicina-interna.webp';
import img3 from '../../assets/centro-estetica-avanzado.jpg';
import img4 from '../../assets/fisioterapia-deportiva-1920w.webp';
import img5 from '../../assets/por_que_fazer_terapia.width-1920.jpg';
import Button from '../Button.astro';
const images = [
  { src: img1, alt: 'Podología' },
  { src: img2, alt: 'Medicina general' },
  { src: img3, alt: 'Estética' },
  { src: img4, alt: 'Fisioterapia' },
  { src: img5, alt: 'Psicología' },
];
---
<section class="bg-accent py-14">
  <div class="container-site text-center">
    <h2 class="text-[30px] font-semibold text-white md:text-[35px]">Conozca nuestras especialidades</h2>
    <div class="specialties-swiper swiper mt-8">
      <div class="swiper-wrapper">
        {images.map((im) => (
          <div class="swiper-slide !w-[80%] md:!w-[60%]">
            <Image src={im.src} alt={im.alt} width={900} height={560} class="aspect-[16/10] w-full rounded-3xl object-cover shadow-lg" />
          </div>
        ))}
      </div>
      <div class="swiper-pagination !static mt-5"></div>
    </div>
    <Button href="/especialidades/" variant="primary" class="mt-6">Más Información</Button>
  </div>
</section>

<style is:global>
  .specialties-swiper .swiper-pagination-bullet { background: #fff; opacity: .7; }
  .specialties-swiper .swiper-pagination-bullet-active { background: #3d387f; opacity: 1; }
</style>

<script>
  import Swiper from 'swiper';
  import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules';
  import 'swiper/css';
  import 'swiper/css/effect-coverflow';
  new Swiper('.specialties-swiper', {
    modules: [Autoplay, EffectCoverflow, Pagination],
    effect: 'coverflow',
    centeredSlides: true,
    slidesPerView: 'auto',
    loop: true,
    autoplay: { delay: 4000, disableOnInteraction: false },
    coverflowEffect: { rotate: 0, stretch: 0, depth: 200, modifier: 1, slideShadows: false },
    pagination: { el: '.specialties-swiper .swiper-pagination', clickable: true },
  });
</script>
```

- [ ] **Step 4: `Team.astro`** (fondo primary, 3 destacados con foto circular)

Fotos del home: Marvin `WhatsApp-Image-2024-03-15-at-20.32.18-1-e1764877185688.jpeg` (la de la colección), Milagro `Mila-fondo-bl-seria.jpg` (distinta a la de la colección), Daniela `Captura-de-pantalla-2026-03-16-114852.png`.

```astro
---
import { Image } from 'astro:assets';
import { getCollection } from 'astro:content';
import milaHome from '../../assets/Mila-fondo-bl-seria.jpg';
import Button from '../Button.astro';

const featured = (await getCollection('specialists')).filter((s) => s.data.featured).sort((a, b) => a.data.order - b.data.order);
const photoFor = (id: string, fallback: ImageMetadata) => (id === 'milagro-quesada' ? milaHome : fallback);
---
<section class="bg-primary py-16 text-center text-white">
  <div class="container-site">
    <h4 class="text-[30px] font-semibold md:text-[35px]">Nuestro Equipo</h4>
    <div class="mt-10 grid gap-10 sm:grid-cols-3">
      {featured.map((s) => (
        <div>
          <h6 class="text-[15px] font-semibold text-accent">{s.data.featuredRole}</h6>
          <Image src={photoFor(s.id, s.data.photo)} alt={s.data.name} width={200} height={200} class="mx-auto mt-3 h-[150px] w-[150px] rounded-full object-cover object-top" />
          <h2 class="mt-3 text-[16px] font-semibold text-white">{s.data.shortName ?? s.data.name}</h2>
        </div>
      ))}
    </div>
    <Button href="/nuestros-especialistas/" variant="accent" class="mt-10">Conocer más</Button>
  </div>
</section>
```

- [ ] **Step 5: `BenefitsBanner.astro`** (imagen de fondo con overlay y texto blanco grande)

```astro
---
import { Image } from 'astro:assets';
import bg from '../../assets/patoient-osteopatia-recibiendo-masaje-tratamiento-scaled.jpg';
import Button from '../Button.astro';
---
<section class="relative flex min-h-[420px] items-center md:min-h-[520px]">
  <Image src={bg} alt="" width={1920} height={800} class="absolute inset-0 h-full w-full object-cover" />
  <div class="absolute inset-0 bg-black/25"></div>
  <div class="container-site relative">
    <h2 class="max-w-[420px] text-[45px] font-semibold leading-none text-white md:text-[65px]">Conozca nuestros Beneficios</h2>
    <Button href="/nuestros-beneficios/" variant="white" class="mt-6">Más información</Button>
  </div>
</section>
```

- [ ] **Step 6: `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import HeroSlider from '../components/home/HeroSlider.astro';
import Welcome from '../components/home/Welcome.astro';
import SpecialtiesCarousel from '../components/home/SpecialtiesCarousel.astro';
import Team from '../components/home/Team.astro';
import BenefitsBanner from '../components/home/BenefitsBanner.astro';
import ContactSection from '../components/ContactSection.astro';
import { site } from '../data/site';
---
<Base title="Clínica Angular">
  <HeroSlider />
  <Welcome />
  <SpecialtiesCarousel />
  <Team />
  <BenefitsBanner />
  <ContactSection address={site.addresses.home} />
</Base>
```

- [ ] **Step 7: Verificar**

```bash
pnpm check && pnpm build && grep -c 'swiper-slide' dist/index.html && grep -c 'TIENDA' dist/index.html && grep -o 'Nuestro Equipo' dist/index.html | head -1
```

Esperado: `12` slides (7 + 5), `0` TIENDA, "Nuestro Equipo" presente. En `pnpm dev`, comprobar que el slider avanza solo, que los puntos cambian de slide, y comparar sección por sección con `index-desktop.png` e `index-mobile.png`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: página de inicio con slider, bienvenida, carrusel, equipo, beneficios y contacto

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Páginas Nuestra Empresa y Especialidades

**Files:**
- Create: `src/pages/nuestra-empresa.astro`, `src/pages/especialidades/index.astro`

Referencia: `nuestra-empresa-desktop.png`, `especialidades-desktop.png`, `reference/source/nuestra-empresa.md`, `reference/source/especialidades.md`.

- [ ] **Step 1: `nuestra-empresa.astro`**

Se omite "Add Your Heading Text Here". Los tres pilares con texto repetido se copian tal cual.

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import BackHome from '../components/BackHome.astro';
import ContactSection from '../components/ContactSection.astro';
import foto from '../assets/Foto2-Angular-Podologia-Costa-Rica-2.jpg';
import { site } from '../data/site';

const pilares = [
  { title: 'Es obligatorio unirse al movimiento mundial para optimizar el uso de recursos en nuestros procesos.', text: '' },
  { title: 'Es obligatorio unirse al movimiento mundial para optimizar el uso de recursos en nuestros procesos.', text: 'Porque los tiempos lo requieren y nosotros lo ofrecemos.' },
  { title: 'Es obligatorio unirse al movimiento mundial para optimizar el uso de recursos en nuestros procesos.', text: '' },
  { title: 'Creemos en ayudar a nuestros clientes con cada una de sus necesidades con un toque humano.', text: '' },
  { title: 'Por lo que hacemos y a quién atendemos.', text: 'No solo creamos listas de patologías, escuchamos y atendemos a las personas con conciencia plena.' },
];
---
<Base title="Nuestra Empresa - Clínica Angular">
  <section class="container-site py-12 text-center">
    <h2 class="text-[35px] font-semibold text-primary md:text-[45px]">NUESTRA EMPRESA</h2>
    <Image src={foto} alt="Clínica Angular" width={1024} height={684} class="mx-auto mt-8 w-full max-w-[900px] rounded-3xl shadow-md" />
  </section>
  <section class="container-site max-w-[900px] py-6">
    <h2 class="text-[25px] font-semibold text-primary md:text-[35px]">La clínica ANGULAR con el transcurso de los años ha logrado...</h2>
    <p class="mt-4 text-[15px] leading-relaxed text-text">Acuñar una cartera de clientes robusta gracias a, la relación de confianza construida y a la excelencia incluida en cada trabajo, realizado por un equipo de profesionales de la salud altamente calificado.</p>
    <p class="mt-3 text-[15px] leading-relaxed text-text">Somos parte de los drásticos cambios típicos de la era moderna en que vivimos, sin perder nuestra esencia, lo que nos ha permitido marcar la diferencia en el mercado. ¡Estamos listos para dar el siguiente paso!</p>
  </section>
  <section class="bg-accent py-12">
    <div class="container-site grid gap-8 md:grid-cols-2">
      <div class="rounded-3xl bg-white p-8 shadow-sm"><h2 class="text-[25px] font-semibold text-primary">Misión</h2><p class="mt-3 text-[15px] leading-relaxed text-text">Brindar atención especializada y resolutiva en el área de podología y tratamiento de heridas, a través de una valoración humana y personalizada que garantice nuestro compromiso por generar soluciones perdurables en la calidad de vida de los pacientes.</p></div>
      <div class="rounded-3xl bg-white p-8 shadow-sm"><h2 class="text-[25px] font-semibold text-primary">Visión</h2><p class="mt-3 text-[15px] leading-relaxed text-text">Consolidar la clínica integral de podología líder del país en atención, docencia, investigación e innovación, bajo una sólida cultura multidisciplinaria, enfoque y compromiso en la resolución de las necesidades de los pacientes, brindando soluciones integrales en vanguardia y tecnología.</p></div>
    </div>
  </section>
  <section class="container-site py-12">
    <h2 class="text-center text-[30px] font-semibold text-primary md:text-[35px]">Los Pilares de Nuestra Empresa</h2>
    <div class="mt-8 grid gap-6 md:grid-cols-3">
      {pilares.map((p) => (
        <div class="rounded-3xl border border-accent/40 p-6">
          <p class="text-[15px] font-semibold text-primary">{p.title}</p>
          {p.text && <p class="mt-2 text-[15px] text-text">{p.text}</p>}
        </div>
      ))}
    </div>
  </section>
  <BackHome />
  <ContactSection address={site.addresses.empresa} />
</Base>
```

Ajustar la distribución de los pilares (iconos, columnas y qué texto va con cuál) mirando `nuestra-empresa-desktop.png`; el dump pierde la agrupación exacta.

- [ ] **Step 2: `especialidades/index.astro`**

Se omite el campo "Search". Las cinco tarjetas usan las imágenes propias de esta página.

```astro
---
import Base from '../../layouts/Base.astro';
import ServiceCard from '../../components/ServiceCard.astro';
import ContactSection from '../../components/ContactSection.astro';
import podologia from '../../assets/Podologo-y-Podiatra-1024x692-1.jpg';
import psicologia from '../../assets/testes-psicologicos-1.jpg';
import fisioterapia from '../../assets/Fisioterapia-deportiva-que-es-tipos-ventajas-y-desventajas.jpg';
import medicina from '../../assets/7xm.xyz934175.jpg';
import estetica from '../../assets/1661351690796.jpg';
import { site } from '../../data/site';

const cards = [
  { label: 'Podología', href: '/especialidades/podologia/', image: podologia },
  { label: 'Psicología', href: '/especialidades/psicologia/', image: psicologia },
  { label: 'Fisioterapia', href: '/fisioterapia/', image: fisioterapia },
  { label: 'Medicina General y Trastornos de Sueño', href: '/medicina-general/', image: medicina },
  { label: 'Servicio de Estética', href: '/servicio-de-estetica/', image: estetica },
];
---
<Base title="Especialidades - Clínica Angular">
  <section class="container-site py-12 text-center">
    <h2 class="text-[35px] font-semibold text-primary md:text-[45px]">ESPECIALIDADES</h2>
    <h4 class="mt-3 text-[16px] font-medium uppercase text-accent-dark">Conozca nuestras especialidades<br />y agende cita con nosotros</h4>
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => <ServiceCard {...c} />)}
    </div>
  </section>
  <ContactSection address={site.addresses.especialidades} />
</Base>
```

El script solo quita el sufijo `-WxH` cuando va justo antes de la extensión; `Podologo-y-Podiatra-1024x692-1.jpg` y `121901-…-740x500-1.jpg` conservan su nombre completo.

- [ ] **Step 3: Verificar y commit**

```bash
pnpm check && pnpm build && test -f dist/nuestra-empresa/index.html && test -f dist/especialidades/index.html && grep -c 'Add Your Heading' dist/nuestra-empresa/index.html
git add -A
git commit -m "feat: páginas Nuestra Empresa y Especialidades

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Esperado: ambos archivos existen y el grep devuelve `0`.

---

### Task 10: Páginas Nuestros Especialistas y Nuestros Beneficios

**Files:**
- Create: `src/pages/nuestros-especialistas.astro`, `src/pages/nuestros-beneficios.astro`

Referencia: `nuestros-especialistas-desktop.png`, `nuestros-beneficios-desktop.png`, `reference/source/nuestros-beneficios.md`.

- [ ] **Step 1: `nuestros-especialistas.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import SpecialistCard from '../components/SpecialistCard.astro';
import BackHome from '../components/BackHome.astro';
import ContactSection from '../components/ContactSection.astro';
import { site } from '../data/site';

const all = (await getCollection('specialists')).sort((a, b) => a.data.order - b.data.order);
const clinico = all.filter((s) => s.data.group === 'clinico');
const admin = all.filter((s) => s.data.group === 'administrativo');
---
<Base title="Nuestros Especialistas - Clínica Angular">
  <section class="container-site py-12">
    <h2 class="text-center text-[35px] font-semibold text-primary md:text-[45px]">NUESTRO EQUIPO DE TRABAJO</h2>
    <div class="divide-y divide-accent/30">
      {clinico.map((s, i) => <SpecialistCard entry={s} reverse={i % 2 === 1} />)}
    </div>
    <h2 class="mt-16 text-center text-[30px] font-semibold text-primary md:text-[35px]">Nuestro Equipo Administrativo</h2>
    <div class="divide-y divide-accent/30">
      {admin.map((s, i) => <SpecialistCard entry={s} reverse={i % 2 === 1} />)}
    </div>
  </section>
  <BackHome />
  <ContactSection address={site.addresses.especialistas} />
</Base>
```

Comprobar en la captura si el original alterna la foto izquierda/derecha; si no alterna, pasar `reverse={false}` siempre.

- [ ] **Step 2: `nuestros-beneficios.astro`**

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import Button from '../components/Button.astro';
import BackHome from '../components/BackHome.astro';
import ContactForm from '../components/ContactForm.astro';
import medismart from '../assets/Logo-Boton2-MediSmart-Angular-Clinica-del-pie-Costa-Rica-1.png';
import i1 from '../assets/Group-245464941.png';
import i2 from '../assets/Group-245464930.png';
import i3 from '../assets/Group-245464931.png';
import i4 from '../assets/Group-245464932.png';
import i5 from '../assets/Group-245464933.png';
import kLaser from '../assets/antisel-physio-k-laser-cube-4-f.jpg';
import pion from '../assets/Captura-de-pantalla-2026-03-16-121826.png';
const icons = [i1, i2, i3, i4, i5];
---
<Base title="Nuestros Beneficios - Clínica Angular">
  <section class="container-site py-12 text-center">
    <h2 class="text-[35px] font-semibold text-primary md:text-[45px]">NUESTROS BENEFICIOS</h2>
  </section>
  <section class="bg-accent py-14">
    <div class="container-site grid items-center gap-10 lg:grid-cols-[1fr_380px]">
      <div class="text-center lg:text-left">
        <h2 class="text-[35px] font-semibold leading-none text-primary md:text-[45px]">PAGUE UN</h2>
        <h2 class="text-[65px] font-bold leading-none text-white md:text-[90px]">50% MENOS</h2>
        <h2 class="text-[25px] font-semibold text-primary md:text-[35px]">EN SU CONSULTA MÉDICA</h2>
        <Image src={medismart} alt="MediSmart" width={320} class="mx-auto mt-6 w-[320px] lg:mx-0" />
      </div>
      <div class="rounded-3xl bg-white p-8 shadow-sm">
        <h3 class="mb-5 text-[35px] font-semibold leading-none text-accent">¡Contáctenos!</h3>
        <ContactForm />
      </div>
    </div>
  </section>
  <section class="container-site py-14 text-center">
    <h2 class="text-[30px] font-semibold text-primary md:text-[35px]">¿Por qué elegir Nuestros Servicios?</h2>
    <h2 class="mt-2 text-[20px] font-medium text-accent-dark md:text-[25px]">Somos una opción accesible para la clase media</h2>
    <div class="mt-10 grid grid-cols-2 gap-6 md:grid-cols-5">
      {icons.map((ic) => <Image src={ic} alt="" width={200} class="mx-auto w-[140px]" />)}
    </div>
  </section>
  <section class="bg-gray-50 py-14">
    <div class="container-site">
      <h2 class="text-center text-[30px] font-semibold text-primary md:text-[35px]">Contamos con Tecnología Actualizada</h2>
      <div class="mt-10 grid items-center gap-10 md:grid-cols-2">
        <div>
          <h2 class="text-[25px] font-semibold text-primary">Cube 4 K-Laser</h2>
          <p class="mt-3 text-[15px] leading-relaxed text-text">Sinónimo de terapia dinámica. El software intuitivo k-laser consta de varias etapas dinámicas que caracterizan el tratamiento seleccionado.</p>
          <Button href="/k-laser/" variant="primary" class="mt-5">Más Información</Button>
        </div>
        <Image src={kLaser} alt="K-Laser Cube 4" width={640} class="w-full rounded-3xl shadow-md" />
        <Image src={pion} alt="Láser Pion" width={640} class="w-full rounded-3xl shadow-md" />
        <div>
          <h2 class="text-[25px] font-semibold text-primary">Láser Pion</h2>
          <p class="mt-3 text-[15px] leading-relaxed text-text">Usada para tratar onicomicosis, verrugas plantares, helomas y aliviar dolores como la fascitis plantar.</p>
          <Button href="/laser-pion/" variant="primary" class="mt-5">Más Información</Button>
        </div>
      </div>
    </div>
  </section>
  <BackHome />
</Base>
```

Los cinco iconos `Group-2454649xx.png` llevan texto incrustado en la imagen; verificar el orden contra la captura.

- [ ] **Step 3: Verificar y commit**

```bash
pnpm check && pnpm build && grep -c '<article' dist/nuestros-especialistas/index.html && grep -c '50% MENOS' dist/nuestros-beneficios/index.html
git add -A
git commit -m "feat: páginas Nuestros Especialistas y Nuestros Beneficios

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Esperado: `15` artículos y `1`.

---

### Task 11: Páginas K-laser, Láser Pion y Contáctenos

**Files:**
- Create: `src/pages/k-laser.astro`, `src/pages/laser-pion.astro`, `src/pages/contactenos.astro`

Referencia: `k-laser-desktop.png`, `laser-pion-desktop.png`, `contactenos-desktop.png` y los `.md` correspondientes.

- [ ] **Step 1: `laser-pion.astro`**

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import AppointmentButton from '../components/AppointmentButton.astro';
import BackHome from '../components/BackHome.astro';
import ContactSection from '../components/ContactSection.astro';
import pion from '../assets/Captura-de-pantalla-2026-03-16-121826.png';
import { site } from '../data/site';
---
<Base title="Láser Pion - Clínica Angular">
  <section class="container-site grid items-center gap-10 py-12 md:grid-cols-2">
    <div>
      <h2 class="text-[30px] font-semibold text-primary md:text-[45px]">TECNOLOGÍA DE AVANZADA</h2>
      <p class="mt-4 text-[15px] leading-relaxed text-text">El láser Pioon de diodo para podología es una herramienta versátil de 3ª generación de alta potencia (hasta 10-15W) usada para tratar onicomicosis, verrugas plantares, helomas y aliviar dolores como la fascitis plantar. Proporciona tratamientos no invasivos, rápidos e indoloros, utilizando fototermólisis para eliminar patógenos sin dañar tejidos sanos.</p>
      <AppointmentButton class="mt-6" />
    </div>
    <div class="text-center">
      <Image src={pion} alt="Láser Pion" width={640} class="w-full rounded-3xl shadow-md" />
      <h3 class="mt-4 text-[20px] font-semibold uppercase text-accent-dark">Laboratorio de pisada</h3>
    </div>
  </section>
  <section class="bg-gray-50 py-12">
    <div class="container-site max-w-[900px]">
      <h2 class="text-[25px] font-semibold text-primary md:text-[35px]">Ventajas Destacadas:</h2>
      <ul class="mt-4 space-y-3 text-[15px] leading-relaxed text-text">
        <li><strong>Sesiones Rápidas:</strong> Suelen durar entre 2 y 10 minutos por zona.</li>
        <li><strong>No Invasivo:</strong> Generalmente no requiere anestesia y permite la reincorporación inmediata a la actividad diaria.</li>
        <li><strong>Alta Efectividad:</strong> Con resultados visibles y alta tasa de éxito tras varias sesiones.</li>
      </ul>
      <AppointmentButton class="mt-6" />
    </div>
  </section>
  <BackHome />
  <ContactSection address={site.addresses.laserPion} />
</Base>
```

- [ ] **Step 2: `k-laser.astro`**

Contenido literal de `reference/source/k-laser.md`. Estructura: hero (título + lista de "Tratamiento:" con ✓ + Agendar cita | imagen `pisada.jpg` + "LABORATORIO DE PISADA"), bloque de tecnologías (5 títulos con párrafo: NEC Easy Foot Care, OZONOTERAPIA, ALTA FRECUENCIA, PLASMA RICO EN PLAQUETAS, K-LASER CUBE 4), sección "K-LASER CUBE 4" con párrafo largo e imagen `Cube4conombra_d37fe5ad-f6f0-4952-9c6f-e24dd9420413_740x.webp`, "Especialidades donde aplicamos el K-Láser Cube 4" + "Laserterapia" + "Usos en Podología" con tres tarjetas (Hongo en la Uña `image-16.png`, Papilomas `image-17.png`, Uso en heridas y úlceras de Pie Diabético `image-18.png`) + Agendar cita, BackHome y ContactSection con `site.addresses.kLaser`.

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import AppointmentButton from '../components/AppointmentButton.astro';
import BackHome from '../components/BackHome.astro';
import ContactSection from '../components/ContactSection.astro';
import pisada from '../assets/pisada.jpg';
import cube from '../assets/Cube4conombra_d37fe5ad-f6f0-4952-9c6f-e24dd9420413_740x.webp';
import img16 from '../assets/image-16.png';
import img17 from '../assets/image-17.png';
import img18 from '../assets/image-18.png';
import { site } from '../data/site';

const tratamiento = [
  '✓ Valoración en estática o en camilla',
  '✓ Valoración dinámica en una plataforma digital computarizada conocida como Baropodómetro',
  '✓ Escaneo del pie con el Podoscan',
  '✓ Se toman las medidas de los piess',
  '✓ Se diseñan las plantillas con base en las particularidades de cada pie',
  '✓ Confección de la plantilla personalizada',
];
const tecnologias = [
  { title: 'TECNOLOGÍAS: NEC Easy Foot Care', text: 'NEC© el método de reconstrucción ungueal y única clínica podológica en Centroamérica que cuenta con el moderno sistema europeo.' },
  { title: 'TECNOLOGÍAS: OZONOTERAPIA', text: 'Equipo de grado médico útil en úlceras infectadas y de dificil cicatrización, especialmente en pie diabético.' },
  { title: 'TECNOLOGÍAS: ALTA FRECUENCIA', text: 'Tecnología que estimula la producción de colágeno en la piel sana y en la regeneración de heridas. Mejora la limpieza facial.' },
  { title: 'PLASMA RICO EN PLAQUETAS', text: 'El Plasma Rico en Plaquetas es una tecnología innovadora, natural y segura para el cuidado de la piel que utiliza las plaquetas de su propia sangre para rejuvenecerla. También la utilizamos para generar una rápida curación de heridas' },
  { title: 'TECNOLOGÍAS: K-LASER CUBE 4', text: 'Nuestra clínica es la única que cuenta con esta tecnología en todo Centroamérica. En heridas puede ayudar a cicatrizar, prevenir infecciones y reducir la apariencia de las cicatrices. Es el primer tratamiento aprobado por la FDA que utiliza la terapia láser para atacar las infecciones bacterianas y los hongos en las uñas.' },
];
const usos = [
  { title: 'Hongo en la Uña', image: img16, text: 'El tratamiento de la onicomicosis es un tratamiento rápido, seguro e indoloro. La terapia se realiza por efecto térmico, ya que tanto el hongo como las esporas son eliminadas en contacto con el calor, empleando el principio de la fototermolisis selectiva. Para lograr el calentamiento el K-laser emplea la longitud de onda de 970 nm, que es muy absorbida por el agua de los tejidos, de manera que seatransformada en calor.' },
  { title: 'Papilomas', image: img17, text: 'Al igual que en el caso de la onicomicosis el láser actúa mediante efecto térmico.La terapia láser tiene la ventaja de permitir controlar la zona tratada con mucha precisión, siendo muy selectivos en el tejido que vamos a eliminar. El K-Laser Cube puede emplearse también en la reducción del dolor de los helomas e ipk.' },
  { title: 'Uso en heridas y úlceras de\nPie Diabético', image: img18, text: 'La luz láser ha demostrado su efectividad en la mejora de la curación de heridasabiertas, en la reducción del dolor y en la disminución del riesgo de infección. La laserterapia es empleada en el tratamiento de úlceras de pie diabético, úlceras por presión, quemaduras así como en heridas infectadas, traumáticas y post- quirúrgicas, que no cicatrizan correctamente.\nLa luz láser acelera el proceso de estimula la producción de fibroblastos (los fibroblastos son los bloques que forman el colágeno, predominante en la curación de heridas) del tejido dañado y reduce la formación de tejido cicatrizal que ennumerosos casos acaba siendo una fuente de dolor crónico.\nEl K-Laser Cube mejora la actividad vascular, incrementando significativamente la formación de nuevos capilares y la vasodilatación en el tejido dañado, acelerando el proceso de curación y reduciendo la formación de tejido fibroso. Un mayor riegosanguíneo equivale a una curación más rápida y a un menor dolor.' },
];
---
<Base title="K-laser - Clínica Angular">
  <section class="container-site grid items-center gap-10 py-12 md:grid-cols-2">
    <div>
      <h2 class="text-[30px] font-semibold text-primary md:text-[45px]">TECNOLOGÍA DE AVANZADA</h2>
      <h3 class="mt-4 text-[19px] font-semibold text-accent-dark">Tratamiento:</h3>
      <p class="mt-1 text-[15px] text-text">El estudio de pisada consiste en:</p>
      <ul class="mt-2 space-y-1 text-[15px] leading-relaxed text-text">{tratamiento.map((t) => <li>{t}</li>)}</ul>
      <AppointmentButton class="mt-6" />
    </div>
    <div class="text-center">
      <Image src={pisada} alt="Laboratorio de pisada" width={640} class="w-full rounded-3xl shadow-md" />
      <h3 class="mt-4 text-[20px] font-semibold uppercase text-accent-dark">Laboratorio de pisada</h3>
    </div>
  </section>
  <section class="bg-gray-50 py-12">
    <div class="container-site grid gap-8 md:grid-cols-2">
      {tecnologias.map((t) => (
        <div class="rounded-3xl bg-white p-6 shadow-sm"><h2 class="text-[20px] font-semibold text-primary">{t.title}</h2><p class="mt-2 text-[15px] leading-relaxed text-text">{t.text}</p></div>
      ))}
    </div>
  </section>
  <section class="container-site grid items-center gap-10 py-12 md:grid-cols-2">
    <div>
      <h2 class="text-[30px] font-semibold text-primary md:text-[35px]">K-LASER CUBE 4</h2>
      <p class="mt-4 text-[15px] leading-relaxed text-text">El K-Laser Cube es un equipo multiláser, capaz de aplicar longitudes de onda diferentes, permitiendo realizar tratamientos en distintos campos de la podología, tanto bioestimulativos y de tratamiento del dolor (talalgias, espolón calcáreo, fascitis plantar, esguinces), de cicatrización de heridas (pie diabético, úlceras, tratamientos post- quirúrgicos) y tratamientos térmicos de onicomicosis y verrugas plantares. Una nueva pieza quirúrgica amplía aún más la versatilidad del K-Laser Cube para la cirugía de uña encarnada, reduciendo los tiempos de curación y las posibilidades de recidiva.</p>
    </div>
    <Image src={cube} alt="K-Laser Cube 4" width={740} class="w-full rounded-3xl" />
  </section>
  <section class="bg-accent py-12">
    <div class="container-site text-center">
      <h2 class="text-[30px] font-semibold text-white md:text-[35px]">Especialidades donde aplicamos el K-Láser Cube 4</h2>
      <h2 class="mt-6 text-[25px] font-semibold text-primary">Laserterapia</h2>
      <p class="mx-auto mt-3 max-w-[900px] text-[15px] leading-relaxed text-primary">La laserterapia es una modalidad de tratamiento no invasivo, seguro y efectivo donde la luz se emplea para aliviar el dolor, reducir la inflamación, y estimular la cicatrización de heridas y curación de tejidos blandos. La terapia laser de alta potencia penetra en profundidad en los tejidos y acelera el tiempo de recuperación, regeneración de células y reparación de los tejidos.</p>
    </div>
  </section>
  <section class="container-site py-12">
    <h2 class="text-center text-[30px] font-semibold text-primary md:text-[35px]">Usos en Podología</h2>
    <div class="mt-10 grid gap-8 md:grid-cols-3">
      {usos.map((u) => (
        <div class="text-center">
          <h2 class="text-[20px] font-semibold text-primary" set:html={u.title.replace(/\n/g, '<br />')} />
          <Image src={u.image} alt={u.title} width={400} class="mx-auto my-4 w-full max-w-[320px] rounded-3xl" />
          {u.text.split('\n').map((p) => <p class="mb-2 text-left text-[15px] leading-relaxed text-text">{p}</p>)}
        </div>
      ))}
    </div>
    <div class="mt-8 text-center"><AppointmentButton /></div>
  </section>
  <BackHome />
  <ContactSection address={site.addresses.kLaser} />
</Base>
```

- [ ] **Step 3: `contactenos.astro`**

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import ContactForm from '../components/ContactForm.astro';
import BackHome from '../components/BackHome.astro';
import Social from '../components/icons/Social.astro';
import insta from '../assets/Insta-GC-2-1.jpg';
import horario from '../assets/Group-245464942.png';
import ubicacion from '../assets/Group-245464943.png';
import { site } from '../data/site';
---
<Base title="Contáctenos - Clínica Angular">
  <section class="bg-accent py-14">
    <div class="container-site grid items-start gap-8 lg:grid-cols-2">
      <div class="rounded-3xl bg-white p-8 shadow-sm">
        <h2 class="text-[35px] font-semibold leading-none text-accent md:text-[45px]">CONTÁCTENOS</h2>
        <p class="mb-6 mt-2 text-[15px] font-semibold uppercase text-primary">¡OBTENGA SU CITA YA!</p>
        <ContactForm />
        <h3 class="mt-6 text-[15px] font-medium text-primary">{site.addresses.contacto}</h3>
        <h3 class="mt-2 text-[15px] font-medium text-primary"><a href={site.phoneHref}>{site.phoneIntl}</a></h3>
      </div>
      <div class="space-y-6">
        <Image src={insta} alt="Clínica Angular" width={640} class="w-full rounded-3xl shadow-md" />
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="rounded-3xl bg-white p-6 text-center shadow-sm">
            <Image src={horario} alt="Horario" width={80} class="mx-auto w-[80px]" />
            {site.hoursLong.map((h) => <p class="mt-2 text-[14px] text-text">{h}</p>)}
          </div>
          <div class="rounded-3xl bg-white p-6 text-center shadow-sm">
            <Image src={ubicacion} alt="Ubicación" width={80} class="mx-auto w-[80px]" />
            <p class="mt-2 text-[14px] text-text">{site.addresses.contactoLargo}</p>
            <p class="mt-1 text-[14px] text-text"><a href={site.phoneHref}>{site.phoneIntl}</a></p>
            <p class="text-[14px] text-text"><a href={`mailto:${site.email}`}>{site.email}</a></p>
            <p class="text-[14px] text-text">{site.whatsappIntl}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="container-site py-14 text-center">
    <h2 class="text-[25px] font-semibold text-primary md:text-[35px]">¡Síganos también en Redes Sociales!</h2>
    <ul class="mt-8 grid gap-6 sm:grid-cols-3">
      <li><a href={site.social.facebook} target="_blank" rel="noopener" class="flex flex-col items-center gap-2 text-primary hover:text-accent-dark"><Social name="facebook" class="h-10 w-10" /><h2 class="text-[16px] font-semibold">facebook.com/AngularClinica</h2></a></li>
      <li><a href={site.social.instagram} target="_blank" rel="noopener" class="flex flex-col items-center gap-2 text-primary hover:text-accent-dark"><Social name="instagram" class="h-10 w-10" /><h2 class="text-[16px] font-semibold">instagram.com/clinica_angular</h2></a></li>
      <li><a href={site.social.tiktok} target="_blank" rel="noopener" class="flex flex-col items-center gap-2 text-primary hover:text-accent-dark"><Social name="tiktok" class="h-10 w-10" /><h2 class="text-[16px] font-semibold">@ClinicaDelPieAngular</h2></a></li>
    </ul>
  </section>
  <BackHome />
</Base>
```

- [ ] **Step 4: Verificar y commit**

```bash
pnpm check && pnpm build && for p in k-laser laser-pion contactenos; do test -f dist/$p/index.html && echo ok $p; done && ls dist | sort
git add -A
git commit -m "feat: páginas K-laser, Láser Pion y Contáctenos

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Esperado: 3 `ok`; `dist/` contiene exactamente: `_astro audiologia contactenos escleroterapia especialidades favicon.png fisioterapia index.html k-laser laser-pion medicina-general nuestra-empresa nuestros-beneficios nuestros-especialistas pedicure-clinico robots.txt servicio-de-estetica sitemap-0.xml sitemap-index.xml`.

---

### Task 12: QA visual, enlaces, sitemap y deploy de preview en Vercel

**Files:**
- Modify: cualquier componente/página que necesite ajuste visual
- Create: `scripts/check-links.mjs`

- [ ] **Step 1: Script de enlaces internos rotos**

```js
// scripts/check-links.mjs — verifica que todo href interno de dist/ apunte a una página generada.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (p.endsWith('.html')) yield p;
  }
}
const missing = new Set();
for await (const file of walk('dist')) {
  const html = await readFile(file, 'utf8');
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = m[1];
    if (href.startsWith('/_astro/') || href === '/favicon.png' || href === '/robots.txt') continue;
    const target = href.endsWith('/') ? join('dist', href, 'index.html') : join('dist', href);
    try { await stat(target); } catch { missing.add(`${file} -> ${href}`); }
  }
}
if (missing.size) { console.error([...missing].join('\n')); process.exit(1); }
console.log('Todos los enlaces internos resuelven.');
```

Añadir a `package.json`: `"links": "node scripts/check-links.mjs"`.

```bash
pnpm build && pnpm links && grep -c '<loc>' dist/sitemap-0.xml
```

Esperado: "Todos los enlaces internos resuelven." y `16` URLs en el sitemap.

- [ ] **Step 2: Comparación visual página por página**

Con `pnpm dev` corriendo, para cada una de las 16 rutas abrir en el navegador a 1440px y 390px y comparar contra `reference/screenshots/<pagina>-desktop.png` y `-mobile.png`. Corregir en los componentes cualquier diferencia de: orden de secciones, imagen izquierda/derecha, color de fondo de sección, tamaño de títulos, radio de bordes, espaciado vertical. Usar `reference/css/post-<id>.css` para sacar valores exactos (ids: home 151, empresa 447, especialidades 488, podología 1345, psicología 1399, fisioterapia 1411, medicina 1677, estética 1679, pedicure 1997, audiología 2641, escleroterapia 2654, especialistas 596, beneficios 641, k-laser 686, láser pion 2703, contacto 689, header 235, footer 475).

Checklist mínimo que debe cumplirse antes de seguir:
- Header: ítem activo con fondo accent; submenús de Especialidades (7) y Tecnología (2) abren al pasar el cursor; en móvil el menú se despliega con el botón.
- Home: el slider rota; el carrusel de especialidades muestra la imagen central más grande; no existe TIENDA.
- Formulario: al enviar con campos válidos se abre `wa.me/50683056444?text=…`; con campos vacíos se muestra el error y no se abre nada.
- Botón WhatsApp flotante: abre el globo y "Chat Directo" lleva a `api.whatsapp.com`.
- Footer: sin Twitter/Dribbble/Youtube/Pinterest/Medium.

- [ ] **Step 3: Commit de ajustes**

```bash
git add -A
git commit -m "fix: ajustes visuales tras comparar con el sitio original

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

- [ ] **Step 4: Deploy de preview en Vercel**

```bash
vercel link --yes
vercel deploy --yes
```

Si `vercel link` pide elegir equipo/proyecto de forma interactiva, crear el proyecto con nombre `clinica-angular`. Copiar la URL de preview de la salida.

- [ ] **Step 5: Verificar redirects y páginas en el preview**

```bash
URL="<url-de-preview>"
for p in productos cart checkout my-account; do curl -s -o /dev/null -w "$p %{http_code} %{redirect_url}\n" "$URL/$p/"; done
curl -s -o /dev/null -w "home %{http_code}\n" "$URL/"
curl -s -o /dev/null -w "podologia %{http_code}\n" "$URL/especialidades/podologia/"
```

Esperado: los cuatro redirigen `308` o `301` a `/`; home y podología `200`. Si el proyecto tiene Deployment Protection activada, `curl` devolverá `401`: comprobarlo en el navegador o desactivar la protección para previews.

- [ ] **Step 6: Push y cierre**

```bash
git push origin main
```

Reportar al dueño: URL del preview, lista de residuos eliminados, y las inconsistencias de contenido detectadas para que decida (dirección distinta en Especialidades/Contacto vs. Inicio; textos repetidos en Fascitis Plantar y Verrugas Plantares de Podología; pilares repetidos en Nuestra Empresa). El cambio de DNS de `angular.cr` a Vercel queda como paso manual del dueño.
