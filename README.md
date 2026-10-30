# Sitio web de Clínica Angular (angular.cr)

Sitio estático (HTML + CSS + JavaScript, sin framework ni build step) con 34 páginas, listo para que Pablo lo pruebe localmente y lo despliegue en Vercel apuntando al dominio angular.cr.

## ⚠️ Para Pablo: cómo probar el sitio ANTES de desplegar

**No abras los archivos `.html` haciendo doble clic.** El navegador los abre con el protocolo `file://`, y bajo ese protocolo las rutas absolutas del sitio (`/assets/css/styles.css`, `/assets/js/main.js`, imágenes, etc.) no se resuelven — el navegador las busca desde la raíz del disco, no desde la carpeta `site/`. Por eso la página se ve sin estilos o "rota" al abrirla así. Esto no es un archivo corrupto ni un bug del código: es cómo funciona el protocolo `file://` con rutas absolutas, y se resuelve serviendo el sitio con un servidor local, igual que correrá en producción.

**Solución — un solo comando:**

```bash
# Opción 1: con Node.js instalado
npx serve site -l 3000

# Opción 2: con Python instalado (si no tenés Node)
cd site && python3 -m http.server 8000
```

O simplemente ejecutá el script incluido:
- Mac/Linux: `./start-local-server.sh`
- Windows: doble clic en `start-local-server.bat`

Después abrí `http://localhost:3000` (o el puerto que indique la terminal) en el navegador. Ahí sí vas a ver el sitio completo, con estilos, animaciones y navegación funcionando igual que en producción.

## Estructura del proyecto

```
angular-web/
├── site/                      ← esto es lo que se despliega (la raíz pública del sitio)
│   ├── index.html             ← Home
│   ├── nuestra-clinica/
│   ├── contactenos/
│   ├── instalaciones/
│   ├── blog/
│   ├── tienda/
│   ├── especialidades/        ← índice + categoría Podología
│   ├── nuestros-especialistas/
│   ├── sobre-el-dr-madrigal/
│   ├── tecnologias/
│   ├── fisioterapia/
│   ├── politica-de-privacidad/
│   ├── terminos/
│   ├── [20 páginas de servicio individuales: pie-diabetico, heridas-cronicas, etc.]
│   ├── assets/
│   │   ├── css/styles.css
│   │   ├── js/ (main.js, config.js, booking.js)
│   │   └── img/ (placeholders de marca — ver sección "Fotografía" abajo)
│   ├── robots.txt
│   ├── sitemap.xml
│   └── llms.txt               ← resumen del sitio para motores de IA (AEO/GEO)
├── booking-system/
│   ├── schema.sql              ← esquema de base de datos para el sistema de citas
│   └── api-contract.md         ← contrato de API: qué falta construir en el backend
├── gen_*.py                     ← scripts que generan site/ a partir del documento maestro
│                                   (no son necesarios para desplegar; son el "código fuente"
│                                   editorial, por si se necesita regenerar una página)
├── package.json
├── start-local-server.sh / .bat
└── README.md                   ← este archivo
```

**Lo único que se despliega es la carpeta `site/`.** Todo lo demás (scripts `gen_*.py`, `booking-system/`) es documentación y herramientas de trabajo, no parte del sitio público.

## Despliegue a producción (angular.cr)

1. Subir este proyecto a un repositorio de GitHub (puede ser privado).
2. En Vercel: "Add New Project" → importar ese repositorio.
3. **Configuración del proyecto en Vercel — importante:**
   - *Root Directory*: `site`
   - *Framework Preset*: "Other" (no hay build step, es HTML estático)
   - *Build Command*: dejar vacío
   - *Output Directory*: dejar vacío (o `.`)
4. Desplegar. Vercel da una URL de prueba tipo `algo.vercel.app` — abrirla y confirmar que todas las páginas cargan bien antes de conectar el dominio.
5. Conectar el dominio: en el proyecto de Vercel → Settings → Domains → agregar `angular.cr` y `www.angular.cr`, y seguir las instrucciones de Vercel para los registros DNS (si el dominio ya está comprado en otro proveedor, se agregan registros tipo A/CNAME ahí, no hay que mover el dominio de proveedor).

## Qué incluye este entregable (vs. lo que falta)

**Completo y probado:**
- 34 páginas: Home, Nuestra Clínica, Contáctenos, Instalaciones, Blog (estructura), Tienda (reservada), Especialidades (índice + Podología), Fisioterapia, Tecnologías (índice), Nuestros Especialistas + perfil completo del Dr. Madrigal, los 20 servicios individuales de podología/heridas/fisioterapia/psicología/medicina general, las 5 páginas de tecnologías, y Política de Privacidad / Términos.
- Menú de navegación: **los 8 enlaces del menú principal llevan todos a contenido real** (antes 6 de 8 llevaban a páginas inexistentes). Verificado automáticamente: cero enlaces internos rotos en todo el sitio.
- Diseño con parallax sutil (GSAP + ScrollTrigger), respetando `prefers-reduced-motion` para accesibilidad.
- Esquema schema.org (JSON-LD) en cada página: MedicalClinic, MedicalWebPage, FAQPage, BreadcrumbList.
- `robots.txt`, `sitemap.xml` (34 URLs) y `llms.txt` regenerados y sincronizados con las páginas reales.
- Todo el contenido clínico sale **textualmente** del documento maestro (`Angular_Contenido_Web_Maestro_2.3rev.docx`) — no se inventó ni resumió contenido clínico.

**Pendiente — requiere decisión o trabajo adicional, no es responsabilidad de este entregable:**
- **Fotografía real.** Todas las imágenes del sitio son marcadores de posición (SVG con el color de marca y una etiqueta de texto) — **no son fotos de stock ni generadas por IA**, por diseño, pero tampoco son las fotos reales de la clínica. Hay que sustituir cada archivo en `site/assets/img/` por fotografía profesional real de las instalaciones y el equipo, respetando el mismo nombre de archivo para no tener que tocar el HTML.
- **Backend del sistema de citas.** El formulario de 5 pasos en `/contactenos/` funciona en el navegador (valida los campos y muestra una confirmación), pero **todavía no envía los datos a ningún servidor** — hoy solo los registra en la consola del navegador. `booking-system/schema.sql` y `booking-system/api-contract.md` documentan exactamente qué construir (endpoints, base de datos, notificaciones por WhatsApp/correo, recordatorios automáticos) para que esto quede operativo.
- **Política de Privacidad y Términos.** El documento maestro no incluía texto legal redactado para estas dos páginas, así que se generó un **borrador de trabajo** basado en los datos que realmente pide el formulario de citas y en la Ley 8968 de Costa Rica — cada una lo indica con un aviso visible al inicio. Un abogado debe revisar y aprobar este texto antes de que se considere la política definitiva. Esto evita dos errores: dejar el enlace roto en el pie de página, o publicar texto legal inventado como si ya fuera válido.
- **Integración real de WhatsApp Business API / Google Calendar / CRM o expediente clínico electrónico.** Documentado como pendiente de decisión en `booking-system/api-contract.md`, sección 3, 6 y 7 — no se implementó porque requiere decisiones de negocio (qué proveedor, qué sistema ya usa la clínica) antes de programarlo.

## Preguntas frecuentes

**¿Por qué hay 34 páginas y no 30?** El documento maestro definía ~29-30 páginas de contenido; se agregaron 2 páginas de índice de categoría necesarias para que el menú de navegación tenga destino real (Especialidades y Tecnologías como páginas "paraguas" con tarjetas hacia las páginas individuales) más Política de Privacidad y Términos, que no estaban redactadas en el documento pero son necesarias para que el formulario de citas (que pide aceptar la política de privacidad) no enlace a una página inexistente.

**¿Puedo seguir editando el contenido sin tocar código?** El contenido vive en los scripts `gen_*.py`, no en una base de datos ni un CMS — este entregable es un sitio estático. Para cambios de contenido puntuales, es más rápido editar directamente el HTML final en `site/`. Para cambios estructurales grandes, hay que editar el script `gen_*.py` correspondiente y volver a ejecutarlo.
