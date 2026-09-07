# Clínica Angular — migración de WordPress a Astro (etapa 1)

Fecha: 2026-09-07

## Objetivo

Reemplazar el sitio https://angular.cr/ (WordPress + Hello Elementor + Elementor Pro + WooCommerce) por un sitio estático en Astro que sea **visualmente idéntico** al actual, con código propio y limpio (sin copiar el HTML/CSS generado por Elementor). Sin CMS y sin tienda en esta etapa.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Fidelidad | Mismo layout, colores, tipografía, textos e imágenes. Componentes Astro reescritos desde cero. |
| Hosting | Vercel, salida estática. |
| Formulario "Generar una cita" | Sin backend: al enviar abre WhatsApp (`wa.me/50683056444`) con el mensaje prellenado. |
| Tienda | Oculta por completo en etapa 1. Sin sección TIENDA en el home, sin "Productos" en el menú. |
| Residuos de plantilla | Se eliminan los obvios (lista abajo). Todo lo demás se copia tal cual. |
| Contenido | Colecciones de contenido + componentes + Tailwind v4. |

## Alcance de páginas

Las URLs se mantienen idénticas a las actuales para no perder posicionamiento.

| Ruta | Tipo |
|---|---|
| `/` | Página propia (Inicio) |
| `/nuestra-empresa/` | Página propia |
| `/especialidades/` | Página propia (índice de servicios) |
| `/especialidades/podologia/` | Colección `services` |
| `/especialidades/psicologia/` | Colección `services` |
| `/fisioterapia/` | Colección `services` |
| `/medicina-general/` | Colección `services` |
| `/servicio-de-estetica/` | Colección `services` |
| `/pedicure-clinico/` | Colección `services` |
| `/audiologia/` | Colección `services` |
| `/escleroterapia/` | Colección `services` |
| `/nuestros-especialistas/` | Página propia (usa colección `specialists`) |
| `/nuestros-beneficios/` | Página propia |
| `/k-laser/` | Página propia |
| `/laser-pion/` | Página propia |
| `/contactenos/` | Página propia |

Redirecciones 301 a `/` (configuradas en `vercel.json`): `/productos/`, `/cart/`, `/checkout/`, `/my-account/`.

No se migran: `/romeria-2025/` (promoción vencida de agosto 2025), `/elementor-landing-page-*` (devuelven 404), `/2023/09/05/hello-world/` (post de ejemplo).

## Elementos globales (en todas las páginas)

- **Barra superior**: Teléfono 2253-8303, WhatsApp 8305-6444, Correo info@angular.cr, Horario (L-V 9 am a 5 pm, Sáb 9 am a 1 pm, Dom cerrado), iconos Facebook / Instagram / TikTok.
- **Header**: logo, menú Inicio · Nuestra Empresa · Especialidades (submenú: Podología, Psicología, Medicina General y Trastornos de Sueño, Fisioterapia, Pedicure Clínico, Audiología, Escleroterapia) · Nuestros Especialistas · Nuestros Beneficios · Tecnología (submenú: K-laser, Láser Pion) · Contáctenos. Menú hamburguesa en móvil.
- **Footer**: logo, bloque "Verified by Visa and Master Card / La forma segura de pagar en línea" con sus imágenes, bloque Contáctenos (dirección, teléfono, correo), iconos Facebook / Instagram / TikTok, línea de copyright.
- **Botón flotante de WhatsApp** (esquina inferior derecha, verde `#25d366`) con globo "Hola 👋, Bienvenido a Clínica Angular. Cómo podemos servirle?" y botón "Chat Directo" que abre `https://api.whatsapp.com/send/?phone=50683056444`.
- Enlaces sociales: `facebook.com/AngularClinica`, `instagram.com/clinica_angular`, `tiktok.com/@clinicadelpieangular`.

## Residuos de plantilla que se eliminan

- Título "Add Your Heading Text Here" en Nuestra Empresa.
- Iconos sociales de relleno Twitter, Dribbble, Youtube, Pinterest y Medium en el footer y en las tarjetas de especialistas (se dejan solo Facebook, Instagram, TikTok donde el original los tiene).
- Campo "Search" sin función en Especialidades.
- Se conservan tal cual los tres textos repetidos de "Los Pilares de Nuestra Empresa" porque no hay forma de saber el texto correcto.

Nota: la dirección del footer en Especialidades ("Edificio sur de la Clínica Católica, Oficentro Centauro") difiere de la del home ("75m Oeste del Estadio Colleya Fonseca"). Se copia cada una como está; el dueño decide después cuál es la vigente.

## Arquitectura

- **Astro 5**, `output: 'static'`, adaptador Vercel solo para redirects y headers.
- **Tailwind v4** con tokens tomados del kit de Elementor:
  - `primary: #3D387F`, `accent: #EFB37D`, `text: #54595F`, `secondary: #FFFFFF`, `whatsapp: #25d366`.
  - Fuente única Montserrat (pesos 400, 500, 600, 700), autohospedada con `@fontsource-variable/montserrat`.
- **Imágenes**: se descargan una sola vez desde `angular.cr/wp-content/uploads/` a `src/assets/` y se sirven con `astro:assets` (formatos modernos y tamaños responsivos). El logo y las imágenes de pago van en `public/` si se referencian desde CSS.
- **SEO**: `<title>` y `meta description` copiados página por página del sitio actual (los genera All in One SEO), `@astrojs/sitemap`, `robots.txt`, Open Graph básico con el logo.

### Estructura de carpetas

```
src/
  assets/            imágenes descargadas del WP
  components/
    TopBar.astro
    Header.astro
    Footer.astro
    WhatsAppButton.astro
    Hero.astro
    SectionTitle.astro
    ServiceCard.astro
    SpecialistCard.astro
    ContactForm.astro
  content/
    services/*.md    8 servicios
    specialists/*.md equipo
    config.ts        esquemas
  layouts/
    Base.astro       html, head, TopBar, Header, slot, Footer, WhatsAppButton
  pages/
    index.astro
    nuestra-empresa.astro
    especialidades/index.astro
    nuestros-especialistas.astro
    nuestros-beneficios.astro
    k-laser.astro
    laser-pion.astro
    contactenos.astro
    [...slug].astro  genera los 8 servicios desde la colección
  styles/global.css  @import tailwind + tokens
```

### Colección `services`

Esquema (`zod`):

```
title        string   ej. "PODOLOGÍA"
slug         string   ruta final, ej. "especialidades/podologia" o "fisioterapia"
menuLabel    string   texto en el menú
order        number   orden en el menú y en la página Especialidades
card         { image, blurb? }         tarjeta para Inicio y Especialidades
intro        string?  párrafo bajo el título
blocks       { heading, subheading?, body, image?, imageSide?: 'left'|'right' }[]
related      string[] slugs para "Ver más especialidades"
seo          { title, description }
```

La plantilla `[...slug].astro` pinta: título, "Padecimientos y Tratamientos" (si hay bloques), los bloques alternando imagen/texto, la sección "Ver más especialidades" con `ServiceCard` y el botón "Volver al Inicio".

### Colección `specialists`

```
name         string   ej. "Dr. Marvin Madrigal Cháves"
shortName    string   ej. "Dr. Marvin Madrigal" (para el home)
role         string   ej. "Enfermero-Podólogo"
codes        string?  ej. "#Lic 2610 (Enfermero) TEC5185 (Podólogo)"
photo        image
profile      string   texto "Perfil Profesional"
order        number
featured     boolean  aparece en la sección "Nuestro Equipo" del home
```

## Formulario de contacto

`ContactForm.astro` reproduce el formulario del home, Especialidades y Contáctenos (Name, Email, Phone number, Message, botón "GENERAR UNA CITA"). Un script cliente mínimo:

1. Valida con atributos HTML (`required`, `type=email`, `type=tel`).
2. Al enviar, arma el texto:
   ```
   Hola, quiero agendar una cita.
   Nombre: …
   Correo: …
   Teléfono: …
   Mensaje: …
   ```
3. Abre `https://wa.me/50683056444?text=<encodeURIComponent(texto)>` en una pestaña nueva.

Sin dependencias, sin backend. La función que arma la URL vive en `src/lib/whatsapp.ts` y se prueba con Vitest.

## Manejo de errores

- Sitio estático: no hay errores de runtime salvo el formulario. Si el navegador bloquea la pestaña nueva, el `<a>` de respaldo con el mismo `href` queda visible bajo el botón.
- El build falla (no advierte) si una entrada de colección no cumple el esquema o una imagen no existe: `astro check` y `astro build` en CI de Vercel.

## Verificación

1. `astro check` y `astro build` sin errores ni advertencias de tipos.
2. Pruebas Vitest de `src/lib/whatsapp.ts`.
3. Comparación visual página por página contra angular.cr en escritorio (1440px) y móvil (375px), corrigiendo diferencias de espaciado, tamaños de fuente y colores.
4. Verificación manual de que cada enlace del menú, del footer y de las tarjetas lleva a la ruta correcta y de que los redirects funcionan en el deploy de Vercel.

## Deploy

- Repositorio git inicializado en este directorio.
- `vercel.json` con los redirects 301.
- Deploy de preview desde la CLI de Vercel para validar. El cambio de DNS de `angular.cr` al proyecto de Vercel es un paso manual del dueño, fuera de este alcance.

## Fuera de alcance (etapa 2)

- Tienda / productos / carrito / pagos.
- CMS o panel para editar contenido.
- Envío de correo desde el formulario.
- Página Romería 2025 u otras promociones.
