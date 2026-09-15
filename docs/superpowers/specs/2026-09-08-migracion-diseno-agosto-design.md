# Migración al diseño de agosto — spec

Fecha: 2026-09-08

## Contexto

Existen dos entregables paralelos para Clínica Angular:

- **El repo actual** (`clinica-angular-astro`, septiembre): réplica fiel de
  angular.cr en Astro 7 + Tailwind v4. Contenido real: 8 servicios en YAML,
  15 especialistas con fotos reales, 10 rutas. Desplegado en Vercel.
- **El entregable de agosto** (`angularwebfase1`): rediseño de marca en HTML
  estático generado con scripts de Python. 4 páginas, imágenes placeholder,
  redacción clínica nueva, formulario de agenda de 5 pasos y el diseño de un
  sistema de citas (`schema.sql` + contrato de API).

Se migra el repo al diseño de agosto, implementado en Astro/JS. Los scripts
de Python no se portan: su rol (generar HTML repetitivo) ya lo cumplen los
componentes y las colecciones de contenido de Astro.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Contenido | Híbrido: se conserva el texto y las fotos reales del repo, reestructurados al formato de agosto |
| Estructura | Una página por padecimiento, entregada por fases |
| Agenda | Formulario de 5 pasos, solo frontend, enviando a WhatsApp |
| Evidencia científica | Campo opcional; solo se pinta si hay referencias aportadas por la clínica |
| Páginas nuevas | Tecnologías, Nuestra Clínica, Instalaciones y Blog entran en esta migración |
| Parallax | GSAP + ScrollTrigger |
| Enfoque técnico | Re-skin por capas sobre el repo actual (se conserva Astro + Tailwind v4) |

## Alcance real medido

De los 8 servicios, **solo podología se parte en páginas por padecimiento**:
tiene 12 secciones `condition` con su bloque `treatments` correspondiente.
Audiología, escleroterapia y pedicure clínico tienen una sola sección
`condition` con encabezado vacío — ya son de un solo tema y no se parten.
Fisioterapia, psicología, medicina general y estética usan secciones `topics`,
no padecimientos separables, y mantienen su plantilla actual.

Los 12 padecimientos de podología, con los 5 de mayor demanda marcados:

| # | Padecimiento | Slug | Fase |
|---|---|---|---|
| 1 | Hongos en uñas y pies (onicomicosis, dermatomicosis) | `/hongos-unas-onicomicosis/` | 2 |
| 2 | Uña incarnada (onicocriptosis) | `/una-incarnada-onicocriptosis/` | 2 |
| 3 | Pie diabético | `/pie-diabetico/` | 2 |
| 4 | Fascitis plantar | `/fascitis-plantar/` | 2 |
| 5 | Heridas y úlceras | `/heridas-cronicas/` | 2 |
| 6 | Verrugas plantares | `/verrugas-plantares/` | 3 |
| 7 | Enfermedades ortopodológicas | `/enfermedades-ortopodologicas/` | 3 |
| 8 | Pie geriátrico | `/pie-geriatrico/` | 3 |
| 9 | Traumatismo de uñas | `/traumatismo-de-unas/` | 3 |
| 10 | Callos y durezas | `/callos-y-durezas/` | 3 |
| 11 | Pies secos, sudoración excesiva, mal olor | `/pies-secos-sudoracion-mal-olor/` | 3 |
| 12 | Alteraciones biomecánicas de la marcha | `/alteraciones-biomecanicas-marcha/` | 3 |

## Arquitectura

### 1. Sistema de diseño

`src/styles/global.css` cambia sus tokens `@theme`. Tailwind v4 declara el tema
como variables CSS, que es la misma forma en que el entregable de agosto define
el suyo, así que la migración es un reemplazo de valores, no una reescritura.

```
--color-primary        #6B21A8   (era #3d387f)
--color-primary-dark   #4C1578
--color-accent         #D97706   (era #efb37d)
--color-accent-light   #F3C57A
--color-text           #241B33   (era #54595f)
--color-bg             #FBF9F6
--color-bg-alt         #F3EEF9
--color-border         #E4DCEF
--color-evidence-strong    #1E7A4C
--color-evidence-mixed     #B5860B
--color-evidence-clinical  #6B21A8
--font-display  Fraunces Variable
--font-body     Work Sans Variable
```

Se conservan `--color-whatsapp` y `--color-chat` (verdes de marca de esos
botones, no parte de la paleta).

Escala de texto accesible de agosto: base 18px, cuerpo 1.65 de interlínea,
párrafos con `max-width: 68ch`. Radios 10/18/28px y las dos sombras de agosto.
Foco visible con `outline` dorado de 3px y `outline-offset: 2px`.

Fuentes servidas locales con `@fontsource-variable/fraunces` y
`@fontsource-variable/work-sans` (ambos 5.3.0, verificados). Se elimina
`@fontsource-variable/montserrat` y no se agregan enlaces a Google Fonts.

**Movimiento.** GSAP 3.15 + ScrollTrigger para el parallax del hero y de las
imágenes de sección. Se carga de forma diferida y solo se inicializa si
`window.matchMedia('(prefers-reduced-motion: reduce)')` no coincide. Sin
JavaScript o con movimiento reducido, la página se ve completa y estática.

### 2. Modelo de contenido

Colección nueva `conditions` en `src/content/conditions/*.yaml`:

```yaml
title:       # encabezado de la página
slug:        # ruta sin barras, en la raíz del sitio
service:     # id del servicio padre, p.ej. "podologia"
menuLabel:
order:
seoTitle:
hero:
  image:     # foto real heredada del servicio
  lead:      # entradilla
symptoms: []     # cada string es un <li>; vacío = sección no se pinta
causes: []
diagnosis: []
treatments:      # heredado del bloque `treatments` actual
  - title:
    body: []
faq: []          # { question, answer }; vacío = sección no se pinta
evidence:        # opcional; ausente = sección no se pinta
  - claim:
    level:       # strong | mixed | clinical
    source:
related: []      # ids de otros padecimientos
```

**Regla de integridad:** ninguna sección se rellena con texto inventado. Los
campos que hoy no tienen material (`symptoms`, `causes`, `diagnosis`, `faq`,
`evidence`) se crean vacíos y su sección no se renderiza hasta que la clínica
aporte el contenido. `evidence` en particular es contenido médico: solo se
transcribe lo que el Dr. Madrigal entregue, sin agregar ni interpretar. El
único caso lleno de entrada es onicomicosis, tomado del entregable de agosto.

La colección `services` se conserva. Su plantilla cambia según el caso:

- **Podología** pasa a ser índice: descripción de la especialidad más tarjetas
  hacia sus 12 padecimientos.
- **Los otros 7 servicios** mantienen la plantilla actual de secciones,
  re-estilizada con la paleta nueva.

Colección nueva `posts` para el blog (`title`, `slug`, `date`, `excerpt`,
`cover?`, cuerpo en Markdown), con índice y plantilla de artículo. Arranca
vacía; el índice muestra un estado vacío explícito, no una página rota.

### 3. Rutas y navegación

Se agregan:

```
/[padecimiento]/     12 rutas nuevas en la raíz
/tecnologias/        índice de K-Laser y Láser Pion
/instalaciones/      estructura completa, con una sola foto real disponible
/blog/               índice (vacío) + /blog/[slug]/
```

**Advertencia sobre Instalaciones.** En `src/assets` hay 91 imágenes y solo
una es de las instalaciones (`consultorio.jpg`). La página se construye con su
texto (los 400 m², las áreas de la clínica) y esa foto, dejando el resto de los
espacios de imagen sin renderizar hasta que exista la sesión de fotos. Va a
verse escueta y eso es correcto: es el estado real del material disponible, no
un defecto de la implementación.

Se renombra `/nuestra-empresa/` a `/nuestra-clinica/`, con redirect 301 en
`vercel.json`. `/k-laser/` y `/laser-pion/` **no se mueven**: se mantienen sus
URLs y `/tecnologias/` las enlaza, para no romper enlaces existentes.

Menú resultante, siguiendo la navegación de agosto:

```
Inicio · Nuestra Clínica (› Nuestros Beneficios) · Especialidades (›)
Nuestros Especialistas · Tecnologías (›) · Instalaciones · Blog · Contáctenos
```

"Nuestros Beneficios" existe en el repo pero no en la navegación de agosto; se
conserva como hijo de Nuestra Clínica en vez de eliminarla o dejar 9 ítems de
primer nivel.

### 4. Formulario de agenda

`site/assets/js/booking.js` (87 líneas) se porta a
`src/components/booking/AppointmentWizard.astro` más su script de isla,
conservando:

- Los 5 pasos: servicio → profesional → sede → fecha/hora → datos → confirmación
- Validación por paso y navegación con teclado
- Errores de formulario en texto comprensible, asociados al campo con
  `aria-describedby` y anunciados con una región `aria-live`
- Captura de UTM y página de origen

Las listas de servicios y profesionales se alimentan de las colecciones
`services` y `specialists`, no de constantes duplicadas.

**Envío:** al confirmar, arma el mensaje de WhatsApp con el resumen precargado
usando `src/lib/whatsapp.ts`. No hay llamada a API y no se le muestra al
paciente una confirmación de cita que nadie recibió.

`booking-system/schema.sql` y `booking-system/api-contract.md` se copian a
`docs/booking-system/` para la fase del backend.

### 5. Componentes

Nuevos, en `src/components/condition/`: `SymptomList`, `CauseList`,
`DiagnosisBlock`, `FaqAccordion`, `EvidenceTable`. Cada uno recibe su array y
**no renderiza nada si viene vacío** — la decisión de ocultar vive en el
componente, no repartida por las plantillas.

Se re-estilizan los existentes (`Header`, `Footer`, `TopBar`, `Button`,
`ServiceCard`, `SpecialistCard`, `ContactSection`, los de `home/` y `service/`).
Su estructura y su comportamiento responsive no cambian: el PR #2 ya corrigió
el móvil y ese trabajo se conserva.

### 6. SEO

Se portan de agosto: `llms.txt`, y el schema.org `MedicalWebPage` + `FAQPage` +
`BreadcrumbList` por página de padecimiento. `robots.txt` y `sitemap.xml` ya los
genera el repo (`@astrojs/sitemap`) y no se tocan.

## Fases

Cada fase es un PR revisable con el sitio funcionando de punta a punta, y
cada una recibe su propio plan de implementación antes de arrancar.

1. **Sistema de diseño y base.** Tokens, fuentes, GSAP, layout, header, footer,
   home y contacto con el formulario de agenda de 5 pasos.
2. **Padecimientos, primera tanda.** Colección `conditions`, plantilla de
   padecimiento, componentes de sección, índice de podología y los 5
   padecimientos de mayor demanda.
3. **Padecimientos restantes.** Los 7 que faltan.
4. **Páginas institucionales.** Nuestra Clínica, Tecnologías, Instalaciones,
   Nuestros Especialistas y los 7 servicios no partidos, re-estilizados.
5. **Blog.** Colección `posts`, índice con estado vacío y plantilla de artículo.

## Verificación

Se conserva lo que ya corre: `npm run check` (astro check), `vitest` y
`scripts/check-links.mjs`.

Se agrega:

- **Prueba del partidor de contenido.** Al pasar los 12 padecimientos de
  `podologia.yaml` a `conditions/`, una prueba compara los textos y las rutas de
  imagen de origen y destino y falla si se pierde o se altera cualquiera.
  Esta prueba corre una sola vez, durante la fase 2, y se conserva como
  regresión.
- **Prueba de contraste.** Verifica cada par de color de la paleta nueva contra
  WCAG AA en los tamaños de la escala accesible. El púrpura sobre el fondo
  crema y el dorado sobre blanco son los pares de riesgo.
- **Prueba de secciones vacías.** Un padecimiento sin `symptoms`, `faq` ni
  `evidence` renderiza sin encabezados huérfanos ni contenedores vacíos.
- **Verificación de movimiento reducido.** Con `prefers-reduced-motion: reduce`,
  GSAP no se inicializa y la página se ve completa.

## Fuera de alcance

- Backend del sistema de citas (Supabase, `/api/citas`, notificaciones)
- WhatsApp Business API real (se mantienen los enlaces `wa.me`)
- Sesión de fotos profesional
- Artículos del blog
- Redacción de síntomas, causas, diagnóstico, FAQ y evidencia: los campos
  quedan construidos y vacíos, a la espera del material de la clínica
