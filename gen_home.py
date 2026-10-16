# -*- coding: utf-8 -*-
import json
from gen_common import page, wa_link, DOMINIO

SCHEMA = f"""<script type="application/ld+json">
{json.dumps({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      "@id": f"{DOMINIO}/#clinica",
      "name": "Clínica Angular",
      "url": DOMINIO,
      "image": f"{DOMINIO}/assets/img/fachada.svg",
      "telephone": "+506-2253-8303",
      "email": "info@angular.cr",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Del Estadio Coyella Fonseca, 75 m oeste",
        "addressLocality": "Guadalupe",
        "addressRegion": "San José",
        "addressCountry": "CR"
      },
      "medicalSpecialty": ["Podiatric", "Wound Care", "Physiotherapy"],
      "openingHoursSpecification": [
        {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "17:00"},
        {"@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "13:00"}
      ]
    },
    {
      "@type": "WebSite",
      "@id": f"{DOMINIO}/#website",
      "url": DOMINIO,
      "name": "Clínica Angular",
      "inLanguage": "es-CR"
    }
  ]
}, ensure_ascii=False, indent=2)}
</script>"""

BODY = f"""
<section class="hero">
  <div class="hero-media">
    <img src="/assets/img/hero-equipo.svg" alt="Equipo clínico de Clínica Angular durante una consulta de podología" loading="eager" fetchpriority="high">
  </div>
  <div class="hero-overlay"></div>
  <div class="container hero-content">
    <p class="eyebrow">Podología clínica · Pie diabético · Heridas · Fisioterapia · Psicología · Medicina general</p>
    <h1>Tu pie merece un criterio clínico que no improvisa.</h1>
    <p class="lead">Somos un centro especializado en podología clínica avanzada, pie diabético, biomecánica y tratamiento avanzado de heridas — con un enfoque que antepone la prevención, el criterio clínico y la evidencia a la tecnología por sí sola, sostenido por un equipo multidisciplinario bajo un mismo techo.</p>
    <p class="closing-line">No somos comerciales. Somos diferentes y progresistas de vanguardia.</p>
    <div class="btn-row">
      <a class="btn btn-primary" href="/contactenos/">Agendar cita</a>
      <a class="btn btn-whatsapp" href="{wa_link('Hola, quisiera agendar una cita en Clínica Angular.')}" target="_blank" rel="noopener">WhatsApp</a>
      <a class="btn btn-outline" href="tel:+50622538303">Llamar</a>
    </div>
  </div>
</section>

<section>
  <div class="container" data-animate>
    <span class="evidence-badge evidence-clinical">La honestidad como criterio clínico</span>
    <h2 style="margin-top:1rem;">"¿Ya te dijeron que 'eso' se cura con láser en una sesión?"</h2>
    <p>Empezamos la página con la misma honestidad que aplicamos en cada consulta: en salud, la certeza fácil suele ser la señal de alerta, no la garantía. Por eso en cada tratamiento te explicamos qué está demostrado, qué es prometedor, y qué todavía no lo sabemos con certeza.</p>
  </div>
</section>

<section class="bg-alt">
  <div class="container">
    <span class="section-eyebrow">Accesos directos</span>
    <h2>Especialidades destacadas</h2>
    <div class="card-grid">
      <a class="service-card" href="/pie-diabetico/" data-animate>
        <img src="/assets/img/pie-diabetico-card.svg" alt="Valoración de pie diabético en consultorio" loading="lazy">
        <div class="card-body"><h3>Clínica de Pie Diabético</h3><p>Prevención activa, no solo curación reactiva.</p></div>
      </a>
      <a class="service-card" href="/heridas-cronicas/" data-animate>
        <img src="/assets/img/heridas-card.svg" alt="Curación avanzada de heridas crónicas" loading="lazy">
        <div class="card-body"><h3>Tratamiento Avanzado de Heridas</h3><p>Encontramos la causa antes de elegir el apósito.</p></div>
      </a>
      <a class="service-card" href="/k-laser-cube-4/" data-animate>
        <img src="/assets/img/klaser-card.svg" alt="Aplicación de K-Laser CUBE 4" loading="lazy">
        <div class="card-body"><h3>K-Laser CUBE 4</h3><p>Tecnología con evidencia explicada, sin exageración.</p></div>
      </a>
      <a class="service-card" href="/hongos-unas-onicomicosis/" data-animate>
        <img src="/assets/img/onicomicosis-card.svg" alt="Valoración de hongos en las uñas" loading="lazy">
        <div class="card-body"><h3>Hongos en las uñas</h3><p>Diagnóstico confirmado antes que tratamiento.</p></div>
      </a>
    </div>
  </div>
</section>

<section class="brand-strip">
  <div class="container">
    <h2>Por qué Clínica Angular</h2>
    <div class="stat-grid">
      <div data-animate><div class="stat-num"><span data-count="11">0</span>+ años</div><p>de trayectoria clínica continua.</p></div>
      <div data-animate><div class="stat-num"><span data-count="400">0</span> m²</div><p>de instalaciones propias, accesibles (Ley 7600) y con bioseguridad estricta.</p></div>
      <div data-animate><div class="stat-num"><span data-count="5">0</span> disciplinas</div><p>bajo un mismo techo: podología, heridas, fisioterapia, psicología, medicina general.</p></div>
      <div data-animate><div class="stat-num">50–70</div><p>consultas especializadas atendidas por semana.</p></div>
    </div>
  </div>
</section>

<section>
  <div class="container" style="display:grid; gap:2.5rem; grid-template-columns: 1.1fr 1fr; align-items:center;" data-animate>
    <div>
      <span class="section-eyebrow">Nuestro equipo</span>
      <h2>Diez profesionales, una sola forma de trabajar</h2>
      <p>Con criterio verificable, no con títulos decorativos.</p>
      <a class="btn btn-primary" href="/nuestros-especialistas/">Conocé a nuestro equipo</a>
    </div>
    <div class="reveal-media">
      <img src="/assets/img/equipo-grupo.svg" alt="Equipo multidisciplinario de Clínica Angular" loading="lazy">
    </div>
  </div>
</section>

<section class="bg-alt">
  <div class="container">
    <span class="section-eyebrow">Centro de Conocimiento</span>
    <h2>Contenido con nivel de evidencia declarado</h2>
    <div class="card-grid">
      <a class="service-card" href="/blog/" data-animate>
        <div class="card-body">
          <span class="evidence-badge evidence-strong">Evidencia sólida</span>
          <h3 style="margin-top:.8rem;">¿El láser cura los hongos en las uñas?</h3>
          <p>Qué dice la evidencia y qué es exageración de marketing.</p>
        </div>
      </a>
      <a class="service-card" href="/blog/" data-animate>
        <div class="card-body">
          <span class="evidence-badge evidence-mixed">Evidencia mixta</span>
          <h3 style="margin-top:.8rem;">Plantillas "genéricas" vs. estudio biomecánico</h3>
          <p>Por qué no toda plantilla resuelve el mismo problema.</p>
        </div>
      </a>
      <a class="service-card" href="/blog/" data-animate>
        <div class="card-body">
          <span class="evidence-badge evidence-clinical">Manejo clínico</span>
          <h3 style="margin-top:.8rem;">Pie diabético: prevención antes que curación</h3>
          <p>Qué revisar en casa y cuándo consultar de inmediato.</p>
        </div>
      </a>
    </div>
  </div>
</section>

<section>
  <div class="container" style="display:grid; gap:2.5rem; grid-template-columns:1fr 1.1fr; align-items:center;" data-animate>
    <div class="reveal-media">
      <img src="/assets/img/instalaciones-plano.svg" alt="Plano de las instalaciones de 400 m² de Clínica Angular" loading="lazy">
    </div>
    <div>
      <span class="section-eyebrow">Instalaciones</span>
      <h2>400 m² diseñados para el cuidado integral del pie</h2>
      <a class="btn btn-primary" href="/instalaciones/">Conocé nuestras instalaciones</a>
    </div>
  </div>
</section>

<section class="bg-alt text-center" data-animate>
  <div class="container">
    <span class="section-eyebrow">Confianza</span>
    <h2>Testimonios y respaldo profesional</h2>
    <p style="margin:0 auto;">Espacio reservado para testimonios reales de pacientes, publicados solo con consentimiento informado, y logos de asociaciones profesionales (Colegio de Enfermeras de Costa Rica, Asociación Costarricense de Heridas y Ostomías).</p>
  </div>
</section>
"""

HTML = page(
    slug="/",
    title="Clínica Angular | Podología y Heridas en San José, CR",
    description="Clínica Angular: podología, tratamiento avanzado de heridas y pie diabético en San José, Costa Rica. Fundamento científico, sin promesas exageradas.",
    body_html=BODY,
    schema_json=SCHEMA,
    active_path="/",
)

with open("site/index.html", "w", encoding="utf-8") as f:
    f.write(HTML)

print("Home generada.")
