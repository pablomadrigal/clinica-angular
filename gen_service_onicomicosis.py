# -*- coding: utf-8 -*-
import json
from gen_common import page, wa_link, DOMINIO

SLUG = "/hongos-unas-onicomicosis/"

SCHEMA = f"""<script type="application/ld+json">
{json.dumps({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalWebPage",
      "url": f"{DOMINIO}{SLUG}",
      "name": "Tratamiento de Onicomicosis",
      "about": {"@type": "MedicalCondition", "name": "Onicomicosis"},
      "specialty": "Podiatric Medicine",
      "lastReviewed": "2026-08-01",
      "reviewedBy": {
        "@type": "Person",
        "name": "Dr. Marvin Madrigal Chaves",
        "jobTitle": "Podólogo Clínico"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "¿El láser cura los hongos?",
          "acceptedAnswer": {"@type": "Answer", "text": "Es un complemento, no una solución única."}
        },
        {
          "@type": "Question",
          "name": "¿Cuánto tarda en verse una uña sana?",
          "acceptedAnswer": {"@type": "Answer", "text": "Entre 8 y 12 meses — la uña del pie crece despacio."}
        },
        {
          "@type": "Question",
          "name": "¿Por qué vuelven a aparecer los hongos?",
          "acceptedAnswer": {"@type": "Answer", "text": "Por no completar el tratamiento o no controlar factores como calzado, prendas de vestir, pisos, humedad u hongos en la piel."}
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Inicio", "item": DOMINIO + "/"},
        {"@type": "ListItem", "position": 2, "name": "Especialidades", "item": DOMINIO + "/especialidades/podologia/"},
        {"@type": "ListItem", "position": 3, "name": "Hongos en las uñas", "item": DOMINIO + SLUG}
      ]
    }
  ]
}, ensure_ascii=False, indent=2)}
</script>"""

BODY = f"""
<nav class="breadcrumb container" aria-label="Ruta de navegación">
  <a href="/">Inicio</a> / <a href="/especialidades/podologia/">Podología</a> / <span>Hongos en las uñas</span>
</nav>

<section style="padding-top:2rem;">
  <div class="container" style="display:grid; gap:2.5rem; grid-template-columns:1.1fr 1fr; align-items:center;">
    <div data-animate>
      <span class="evidence-badge evidence-mixed">Evidencia mixta — el láser es complemento, no cura única</span>
      <h1 style="margin-top:1rem;">Hongos en las uñas (Onicomicosis)</h1>
      <p>Puede ser onicomicosis —infección causada casi siempre por hongos dermatofitos— pero no toda uña gruesa o amarilla tiene hongos (traumatismo, psoriasis, mala circulación). Por eso el primer paso siempre es confirmar, no tratar.</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="/contactenos/?servicio=onicomicosis">Agendar valoración</a>
        <a class="btn btn-whatsapp" href="{wa_link('Hola, quiero consultar sobre tratamiento de hongos en las uñas (onicomicosis).')}" target="_blank" rel="noopener">Preguntar por WhatsApp</a>
      </div>
    </div>
    <div class="reveal-media">
      <img src="/assets/img/onicomicosis-hero.svg" alt="Valoración clínica de uña con sospecha de onicomicosis" loading="lazy">
    </div>
  </div>
</section>

<section class="bg-alt">
  <div class="container" data-animate>
    <h2>Diagnóstico antes que tratamiento</h2>
    <p>Confirmamos el origen del cambio en la uña antes de proponer cualquier tratamiento — tratar sin diagnóstico es el error más común y el que más retrasa una solución real.</p>
    <div class="callout">
      <strong>Punto clave:</strong> tratar una uña sin diagnóstico confirmado retrasa el tratamiento correcto y puede enmascarar otras causas (psoriasis, traumatismo, mala circulación).
    </div>
  </div>
</section>

<section>
  <div class="container" data-animate>
    <h2>Tratamiento</h2>
    <ul>
      <li><strong>Antifúngicos orales:</strong> opción de referencia en casos moderados o extensos.</li>
      <li><strong>Antifúngicos tópicos:</strong> casos leves o terapia combinada.</li>
      <li><strong>Manejo podológico de la uña:</strong> reduce grosor y mejora penetración del tratamiento tópico.</li>
      <li><strong>Láser podológico:</strong> complemento en diversos casos, no sustituto (ver <a href="/k-laser-cube-4/">K-Laser CUBE 4</a>).</li>
    </ul>
    <p><strong>Duración aproximada:</strong> el tratamiento se mide en meses, no en sesiones — la uña del pie tarda entre 8 y 12 meses en renovarse por completo.</p>
    <p><strong>Especialista a cargo:</strong> podología clínica, con interconsulta a medicina general cuando el cuadro lo amerita.</p>
  </div>
</section>

<section class="bg-alt">
  <div class="container" data-animate>
    <h2>Preguntas frecuentes</h2>
    <div class="faq-list">
      <details class="faq-item">
        <summary>¿El láser cura los hongos?</summary>
        <p>Es un complemento, no una solución única.</p>
      </details>
      <details class="faq-item">
        <summary>¿Cuánto tarda en verse una uña sana?</summary>
        <p>Entre 8 y 12 meses — la uña del pie crece despacio.</p>
      </details>
      <details class="faq-item">
        <summary>¿Por qué vuelven a aparecer?</summary>
        <p>Por no completar el tratamiento o no controlar factores como calzado, prendas de vestir, pisos, humedad u hongos en la piel. Por eso la educación, propuestas de higienización y productos especiales son parte del plan terapéutico, no un extra.</p>
      </details>
    </div>
  </div>
</section>

<section>
  <div class="container" data-animate>
    <h2>Respaldo científico</h2>
    <p style="font-size:.95rem; color:#4a3f5c;">
      Meretsky CR, et al. <em>Efficacy of Laser Therapy for Onychomycosis: Systematic Review and Meta-Analysis.</em> Cureus. 2024.<br>
      Bristow IR. <em>The effectiveness of lasers in onychomycosis: systematic review.</em> J Foot Ankle Res. 2014.
    </p>
    <p><strong>Enlaces relacionados:</strong> <a href="/pie-diabetico/">Pie diabético</a> · <a href="/una-encarnada/">Uña encarnada</a> · <a href="/k-laser-cube-4/">K-Laser CUBE 4</a></p>
  </div>
</section>

<section class="brand-strip text-center" data-animate>
  <div class="container">
    <h2>Confirmemos tu diagnóstico</h2>
    <div class="btn-row" style="justify-content:center;">
      <a class="btn btn-primary" style="background:#fff; color:var(--color-primary-dark);" href="/contactenos/?servicio=onicomicosis">Agendar cita</a>
      <a class="btn btn-whatsapp" href="{wa_link('Hola, quiero agendar una valoración por hongos en las uñas.')}" target="_blank" rel="noopener">WhatsApp: +506 8305-6444</a>
    </div>
  </div>
</section>
"""

HTML = page(
    slug=SLUG,
    title="Tratamiento de Hongos en las Uñas | Clínica Angular CR",
    description="Tratamiento clínico de onicomicosis (hongos en uñas) en San José, Costa Rica: diagnóstico confirmado y opciones basadas en evidencia. Agenda tu valoración.",
    body_html=BODY,
    schema_json=SCHEMA,
    active_path="",
)

import os
os.makedirs("site/hongos-unas-onicomicosis", exist_ok=True)
with open("site/hongos-unas-onicomicosis/index.html", "w", encoding="utf-8") as f:
    f.write(HTML)

print("Página de servicio piloto generada.")
