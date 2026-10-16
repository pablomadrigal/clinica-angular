# -*- coding: utf-8 -*-
import json, os
from gen_common import page, DOMINIO

SLUG = "/nuestra-clinica/"

SCHEMA = f"""<script type="application/ld+json">
{json.dumps({
  "@context": "https://schema.org",
  "@graph": [
    {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Inicio", "item": DOMINIO + "/"},
        {"@type": "ListItem", "position": 2, "name": "Nuestra Clínica", "item": DOMINIO + SLUG}
    ]}
  ]
}, ensure_ascii=False, indent=2)}
</script>"""

BODY = """
<nav class="breadcrumb container" aria-label="Ruta de navegación"><a href="/">Inicio</a> / <span>Nuestra Clínica</span></nav>

<section style="padding-top:1.5rem;">
  <div class="container" data-animate>
    <h1>Ciencia clínica, tecnología de vanguardia y trato humano al servicio de la salud del pie</h1>
    <p>Somos un centro costarricense especializado en podología clínica avanzada, tratamiento integral del pie diabético, manejo avanzado de heridas, biomecánica, ortopodología y fisioterapia. Cada paciente recibe una valoración clínica integral orientada a identificar la causa raíz de su condición —no solo a tratar el síntoma— y a construir un plan terapéutico individualizado, sustentado en evidencia científica actualizada.</p>
    <p>Nuestro modelo de atención integra criterio clínico riguroso, tecnología diagnóstica y terapéutica de última generación —incluyendo terapia láser de alta potencia—, protocolos clínicos estandarizados, un sistema de expediente clínico electrónico y un equipo multidisciplinario comprometido con la excelencia asistencial.</p>
    <p>Con más de 11 años de trayectoria clínica ininterrumpida, actualmente atendemos entre 50 y 70 consultas especializadas por semana.</p>
  </div>
</section>

<section class="bg-alt">
  <div class="container" style="display:grid; gap:2rem; grid-template-columns:1fr 1fr;" data-animate>
    <div>
      <h2>Nuestra Misión</h2>
      <p>Brindar atención especializada en podología clínica, tratamiento avanzado de heridas, biomecánica y salud integral del pie, mediante diagnósticos precisos, tratamientos personalizados y protocolos basados en evidencia, orientados a prevenir complicaciones, aliviar el dolor, restaurar la función y sostener la calidad de vida de cada paciente.</p>
    </div>
    <div>
      <h2>Nuestra Visión</h2>
      <p>Consolidarnos como la clínica privada de referencia en Costa Rica y Centroamérica en podología clínica avanzada, salud integral del pie y unidad de heridas complejas y regenerativas. Aspiramos a posicionar a Clínica Angular como un referente clínico y académico en América Latina.</p>
    </div>
  </div>
</section>

<section data-animate>
  <div class="container">
    <h2>Nuestros Valores</h2>
    <ul>
      <li><strong>Compromiso con el paciente</strong> — cada decisión clínica prioriza su seguridad, bienestar y calidad de vida.</li>
      <li><strong>Excelencia clínica</strong> — actuamos con rigor científico, criterio clínico profesional y mejora continua.</li>
      <li><strong>Humanización</strong> — escuchamos, acompañamos y atendemos con empatía y respeto.</li>
      <li><strong>Ética e integridad</strong> — ejercemos con honestidad, transparencia y responsabilidad profesional.</li>
      <li><strong>Innovación responsable</strong> — incorporamos tecnologías y procedimientos respaldados por evidencia.</li>
      <li><strong>Trabajo multidisciplinario</strong> — integramos disciplinas para soluciones más completas y efectivas.</li>
      <li><strong>Docencia e investigación</strong> — promovemos la actualización permanente y la generación de conocimiento.</li>
    </ul>
  </div>
</section>

<section class="bg-alt" data-animate>
  <div class="container">
    <h2>¿Qué nos diferencia?</h2>
    <ul>
      <li>Atención fundamentada en evidencia científica actualizada, no en prácticas heredadas sin respaldo.</li>
      <li>Valoración clínica integral: tratamos la causa, no solo el síntoma.</li>
      <li>Tecnología diagnóstica y terapéutica de última generación, incluyendo láser de alta potencia y baropodómetro.</li>
      <li>Equipo multidisciplinario especializado en podología, biomecánica, fisioterapia, enfermería y medicina.</li>
      <li>Protocolos clínicos estandarizados adaptados a cada caso particular.</li>
      <li>Enfoque preventivo y resolutivo, no únicamente paliativo.</li>
    </ul>
  </div>
</section>

<section data-animate>
  <div class="container">
    <h2>Nuestro Compromiso con la Calidad</h2>
    <p>Operamos bajo protocolos de bioseguridad y esterilización, además de procesos clínicos estandarizados, con formación continua de nuestro equipo y una cultura de mejora permanente centrada en la seguridad del paciente. Contamos con un sistema de expediente clínico electrónico que estandariza el registro de cada consulta y sienta la base de datos clínicos propios necesarios para futura investigación.</p>
  </div>
</section>

<section class="brand-strip text-center" data-animate>
  <div class="container">
    <h2>Conocé al equipo detrás de este criterio clínico</h2>
    <a class="btn btn-primary" style="background:#fff; color:var(--color-primary-dark);" href="/nuestros-especialistas/">Nuestros Especialistas</a>
  </div>
</section>
"""

HTML = page(
    slug=SLUG,
    title="Nuestra Clínica: Misión, Visión y Valores | Angular",
    description="Conozca la misión, visión y valores de Clínica Angular en San José, Costa Rica: atención especializada en podología y heridas.",
    body_html=BODY,
    schema_json=SCHEMA,
    active_path="/nuestra-clinica/",
)

os.makedirs("site/nuestra-clinica", exist_ok=True)
with open("site/nuestra-clinica/index.html", "w", encoding="utf-8") as f:
    f.write(HTML)

print("Nuestra Clínica generada.")
