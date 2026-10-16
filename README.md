# Clínica Angular — Sitio web (fase 1 de construcción)

## Qué contiene este entregable

```
site/                       ← el sitio en sí (HTML/CSS/JS, listo para publicar)
  index.html                   Inicio — completa
  hongos-unas-onicomicosis/    Página de servicio piloto (plantilla de referencia)
  contactenos/                 Contacto + formulario de agenda multi-paso
  nuestra-clinica/             Institucional — completa
  assets/css/styles.css        Sistema de diseño (colores, tipografía, componentes)
  assets/js/main.js            Parallax con GSAP + ScrollTrigger (respeta "reducir movimiento")
  assets/js/booking.js         Lógica del formulario de agenda
  assets/js/config.js          Datos de contacto centralizados (NAP)
  robots.txt / sitemap.xml / llms.txt

booking-system/
  schema.sql                Modelo de datos completo del sistema de citas a la medida
  api-contract.md           Contrato de la API que falta programar y desplegar
```

## ⚠️ Para Pablo (o cualquier dev): cómo correr esto localmente

**No abras `site/index.html` con doble clic.** Este sitio usa rutas absolutas
(`/assets/css/styles.css`, `/assets/js/main.js`, etc.) para que funcionen
igual en cualquier página sin importar cuántos niveles de carpeta tenga —
es el patrón correcto para producción, pero significa que bajo `file://`
el navegador busca esos archivos en la raíz del disco, no en `site/`.
Resultado: la página carga sin CSS ni JS, como si estuviera rota. **No está
rota — falta servirla con un servidor local**, aunque sea el más simple.

Tres formas de arrancarlo (elegí la que ya tengas instalada):

```bash
# Opción 1 — con Node (no requiere instalar nada extra)
npx serve site -l 3000

# Opción 2 — con Python 3
cd site && python3 -m http.server 3000

# Opción 3 — doble clic / ejecutar el script incluido
./start-local-server.sh      # Mac/Linux
start-local-server.bat       # Windows
```

Luego abrí **http://localhost:3000** en el navegador (no `file:///...`).
Ahí todo carga con estilos, tipografías, el parallax de GSAP y el formulario
de agenda funcionando.

Si vas a montar esto en un proyecto Next.js/Astro más adelante (recomendado
para conectar el backend de citas), estas mismas rutas absolutas se colocan
tal cual dentro de la carpeta `public/` — no hay que reescribir nada.

## Qué SÍ está terminado y lo podés revisar ya

- Sistema de diseño completo: paleta púrpura/dorado, tipografía Fraunces + Work Sans,
  botones grandes táctiles, alto contraste, `prefers-reduced-motion` respetado.
- Parallax sutil con GSAP/ScrollTrigger en el hero y en imágenes de sección.
- Home completa con la estructura que definiste en el documento maestro.
- Una página de servicio (onicomicosis) con la estructura síntomas → causas →
  diagnóstico → tratamiento → FAQ → respaldo científico, y schema.org
  (`MedicalWebPage`, `FAQPage`, `BreadcrumbList`) ya inyectado — esta es la
  plantilla para replicar a las ~30 páginas de servicio restantes.
- Contáctenos con el formulario de agenda de 5 pasos (servicio → profesional →
  sede → fecha/hora → datos → confirmación), validado, accesible, con captura
  de fuente del paciente (UTM/origen).
- `robots.txt`, `sitemap.xml`, `llms.txt` según la Parte 0 del documento maestro.
- Modelo de datos y contrato de API documentados para el sistema de citas
  a la medida (tu elección) — ver `booking-system/`.

## Qué falta (honesto, sin maquillaje)

1. **~30 páginas restantes** (servicios, especialistas, tecnologías, blog,
   instalaciones, especialidades por categoría) — se construyen replicando
   el patrón de `gen_service_onicomicosis.py` con el contenido ya redactado
   en tu documento maestro. Es trabajo mecánico pero extenso.
2. **Fotografías reales** — todas las imágenes del sitio son marcadores
   de posición (rectángulos con texto). El documento pide explícitamente
   fotos reales de la clínica, no stock ni generadas por IA — hay que
   agendar una sesión fotográfica profesional antes de publicar.
3. **Backend del sistema de citas** — el formulario funciona en el
   navegador (valida, arma el resumen), pero **no persiste nada todavía**.
   Falta programar las funciones de `/api/citas` (ver `booking-system/api-contract.md`)
   y desplegarlas con una base de datos real (Supabase recomendado).
4. **WhatsApp Business API real** — hoy los botones usan enlaces `wa.me`
   con mensaje precargado (funcionales, gratis). La API real (multi-agente,
   plantillas aprobadas por Meta) requiere contratar Twilio/360dialog.
5. **Despliegue** — el sitio no está publicado en `angular.cr` todavía.
   Ver guía abajo.

## Cómo publicar esto en angular.cr (sin necesitar saber programar)

1. Creá una cuenta gratuita en **GitHub** (github.com) si no tenés una.
2. Subí la carpeta `site/` a un repositorio nuevo (se puede arrastrar los
   archivos directamente desde la web de GitHub, sin usar la terminal).
3. Creá una cuenta gratuita en **Vercel** (vercel.com) con tu cuenta de GitHub.
4. "Import Project" → elegí el repositorio → Deploy. Vercel te da una URL
   de prueba en segundos (algo como `angular-web.vercel.app`).
5. En Vercel, Settings → Domains → agregá `angular.cr` y `www.angular.cr`.
   Te va a pedir apuntar unos registros DNS — se hacen desde donde
   compraste el dominio (te guío en ese momento si querés).
6. HTTPS se activa automático apenas el dominio verifica.

Esto publica el sitio estático tal cual está hoy (Home, Contacto, Nuestra
Clínica, la página piloto). El sistema de citas a la medida necesita un
paso adicional (Supabase + funciones serverless) antes de estar realmente
conectado — no lo actives hasta tener eso listo, para no prometerle al
paciente una confirmación que todavía no llega a ningún lado.

## Próxima fase sugerida

1. Confirmá el criterio de priorización: ¿qué 5 servicios se publican primero?
   (recomiendo los de mayor volumen de consulta: pie diabético, heridas,
   onicomicosis, uña encarnada, fascitis plantar).
2. Yo genero esas páginas siguiendo la misma plantilla.
3. En paralelo: programá la sesión de fotos y elegí el proveedor de WhatsApp
   Business API si vas a necesitarlo pronto.
4. Cuando el contenido esté completo, programamos juntos el backend de citas.
