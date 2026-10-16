# -*- coding: utf-8 -*-
"""Componentes compartidos para generar las páginas estáticas de Clínica Angular."""

DOMINIO = "https://angular.cr"
TEL = "+50622538303"
TEL_DISPLAY = "+(506) 2253-8303"
WA = "50683056444"
WA_DISPLAY = "+(506) 8305-6444"
CORREO = "info@angular.cr"
DIRECCION = "Guadalupe, del Estadio Coyella Fonseca, 75 m oeste, San José, Costa Rica"
HORARIO = "Lunes a Viernes 9:00 am – 5:00 pm · Sábado 9:00 am – 1:00 pm · Domingo cerrado"


def wa_link(msg):
    import urllib.parse
    return f"https://wa.me/{WA}?text={urllib.parse.quote(msg)}"


NAV_ITEMS = [
    ("/", "Inicio"),
    ("/nuestra-clinica/", "Nuestra Clínica"),
    ("/especialidades/", "Especialidades"),
    ("/nuestros-especialistas/", "Especialistas"),
    ("/tecnologias/", "Tecnologías"),
    ("/instalaciones/", "Instalaciones"),
    ("/blog/", "Blog"),
    ("/contactenos/", "Contáctenos"),
]


def header(active_path=""):
    links = ""
    for href, label in NAV_ITEMS:
        cur = ' aria-current="page"' if href == active_path else ""
        links += f'<li><a href="{href}"{cur}>{label}</a></li>\n'
    return f"""
<a class="skip-link" href="#main">Saltar al contenido principal</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="logo" href="/">Clínica <span>Angular</span></a>
    <nav class="main-nav" aria-label="Navegación principal">
      <ul>{links}</ul>
    </nav>
    <div class="header-cta">
      <a class="btn btn-call" href="tel:{TEL}" aria-label="Llamar a Clínica Angular">📞 Llamar</a>
      <a class="btn btn-whatsapp" href="{wa_link('Hola, quisiera agendar una cita en Clínica Angular.')}" target="_blank" rel="noopener">WhatsApp</a>
      <a class="btn btn-primary" href="/contactenos/">Agendar cita</a>
    </div>
    <button class="nav-toggle" aria-expanded="false" aria-label="Abrir menú">☰</button>
  </div>
</header>
"""


def footer():
    return f"""
<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <h4>Clínica Angular</h4>
      <p>Podología clínica, tratamiento avanzado de heridas, fisioterapia, psicología clínica y medicina general bajo un mismo techo. Guadalupe, San José, Costa Rica.</p>
    </div>
    <div>
      <h4>Contacto</h4>
      <p>
        Tel: <a href="tel:{TEL}">{TEL_DISPLAY}</a><br>
        WhatsApp: <a href="{wa_link('Hola, quisiera más información sobre Clínica Angular.')}">{WA_DISPLAY}</a><br>
        Correo: <a href="mailto:{CORREO}">{CORREO}</a>
      </p>
    </div>
    <div>
      <h4>Ubicación y horario</h4>
      <p>{DIRECCION}</p>
      <p>{HORARIO}</p>
    </div>
    <div>
      <h4>Enlaces</h4>
      <p>
        <a href="/nuestra-clinica/">Nuestra Clínica</a><br>
        <a href="/nuestros-especialistas/">Nuestros Especialistas</a><br>
        <a href="/blog/">Centro de Conocimiento</a><br>
        <a href="/politica-de-privacidad/">Política de Privacidad</a><br>
        <a href="/terminos/">Términos y Condiciones</a>
      </p>
    </div>
  </div>
  <div class="container footer-bottom">
    © <span id="year"></span> Clínica Angular. Todo el contenido clínico es revisado por el equipo profesional de la clínica. Este sitio no sustituye una valoración presencial.
  </div>
</footer>
<div class="sticky-cta" aria-label="Contacto rápido">
  <div class="container">
    <a class="btn btn-whatsapp" href="{wa_link('Hola, quisiera agendar una cita en Clínica Angular.')}" target="_blank" rel="noopener">💬 WhatsApp</a>
    <a class="btn btn-primary" href="tel:{TEL}">📞 Llamar ahora</a>
  </div>
</div>
<script>document.getElementById('year').textContent = new Date().getFullYear();</script>
"""


def page(
    slug,
    title,
    description,
    body_html,
    schema_json="",
    active_path="",
    og_image="/assets/img/og-default.svg",
    extra_head="",
    extra_scripts="",
):
    canonical = f"{DOMINIO}{slug}"
    return f"""<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{DOMINIO}{og_image}">
<meta property="og:locale" content="es_CR">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/styles.css">
{extra_head}
{schema_json}
</head>
<body>
{header(active_path)}
<main id="main">
{body_html}
</main>
{footer()}
<script src="/assets/js/config.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="/assets/js/main.js"></script>
{extra_scripts}
</body>
</html>
"""
