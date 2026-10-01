# -*- coding: utf-8 -*-
import json
from gen_common import page, wa_link, DOMINIO

SLUG = "/contactenos/"

SCHEMA = f"""<script type="application/ld+json">
{json.dumps({
  "@context": "https://schema.org",
  "@graph": [
    {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Inicio", "item": DOMINIO + "/"},
        {"@type": "ListItem", "position": 2, "name": "Contáctenos", "item": DOMINIO + SLUG}
    ]}
  ]
}, ensure_ascii=False, indent=2)}
</script>"""

BODY = f"""
<nav class="breadcrumb container" aria-label="Ruta de navegación"><a href="/">Inicio</a> / <span>Contáctenos</span></nav>

<section style="padding-top:1.5rem;">
  <div class="container" data-animate>
    <h1>Agenda tu cita en pocos pasos</h1>
    <p>Elegí el servicio, el profesional, la sede y el horario que prefieras. Confirmamos por WhatsApp y correo.</p>
  </div>
</section>

<section class="bg-alt">
  <div class="container">
    <form id="booking-form" novalidate aria-label="Formulario de reserva de cita" data-animate>
      <ol id="booking-steps" style="list-style:none; padding:0; display:flex; gap:.6rem; flex-wrap:wrap; margin-bottom:2rem;">
        <li class="step-pill" data-step="1">1. Servicio</li>
        <li class="step-pill" data-step="2">2. Profesional</li>
        <li class="step-pill" data-step="3">3. Sede</li>
        <li class="step-pill" data-step="4">4. Fecha y hora</li>
        <li class="step-pill" data-step="5">5. Tus datos</li>
      </ol>

      <div class="booking-panel" data-panel="1">
        <div class="form-field">
          <label for="servicio">¿Qué servicio necesitás?</label>
          <select id="servicio" name="servicio" required>
            <option value="">Seleccioná un servicio</option>
            <option value="onicomicosis">Hongos en las uñas (onicomicosis)</option>
            <option value="una-encarnada">Uña encarnada</option>
            <option value="pie-diabetico">Clínica de pie diabético</option>
            <option value="heridas">Tratamiento avanzado de heridas</option>
            <option value="fascitis">Fascitis plantar</option>
            <option value="biomecanico">Estudio biomecánico / plantillas</option>
            <option value="psicologia">Psicología clínica</option>
            <option value="medicina-general">Medicina general</option>
            <option value="otro">Otro / no estoy seguro</option>
          </select>
          <p class="error" role="alert">Elegí un servicio para continuar.</p>
        </div>
        <button type="button" class="btn btn-primary" data-next="2">Continuar</button>
      </div>

      <div class="booking-panel" data-panel="2" hidden>
        <div class="form-field">
          <label for="profesional">Profesional (opcional)</label>
          <select id="profesional" name="profesional">
            <option value="">Sin preferencia — el equipo asigna según disponibilidad</option>
            <option value="dr-madrigal">Dr. Marvin Madrigal Chaves — Podología clínica</option>
            <option value="dra-ruiz">Dra. Rebeca Ruiz — Podología y Fisioterapia</option>
          </select>
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-call" data-prev="1">Atrás</button>
          <button type="button" class="btn btn-primary" data-next="3">Continuar</button>
        </div>
      </div>

      <div class="booking-panel" data-panel="3" hidden>
        <div class="form-field">
          <label for="sede">Sede</label>
          <select id="sede" name="sede" required>
            <option value="guadalupe">Guadalupe, San José (sede principal)</option>
          </select>
          <p class="hint">Actualmente atendemos en una sola sede. Este campo queda listo para cuando se sumen sedes adicionales.</p>
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-call" data-prev="2">Atrás</button>
          <button type="button" class="btn btn-primary" data-next="4">Continuar</button>
        </div>
      </div>

      <div class="booking-panel" data-panel="4" hidden>
        <div class="form-field">
          <label for="fecha">Fecha preferida</label>
          <input type="date" id="fecha" name="fecha" required>
        </div>
        <div class="form-field">
          <label for="hora">Hora preferida</label>
          <select id="hora" name="hora" required>
            <option value="">Seleccioná un horario</option>
            <option>9:00 am</option><option>10:00 am</option><option>11:00 am</option>
            <option>1:00 pm</option><option>2:00 pm</option><option>3:00 pm</option><option>4:00 pm</option>
          </select>
          <p class="hint">Este horario es una preferencia — la confirmación final llega por WhatsApp o correo según disponibilidad real de agenda.</p>
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-call" data-prev="3">Atrás</button>
          <button type="button" class="btn btn-primary" data-next="5">Continuar</button>
        </div>
      </div>

      <div class="booking-panel" data-panel="5" hidden>
        <div class="form-field">
          <label for="nombre">Tu nombre completo</label>
          <input type="text" id="nombre" name="nombre" required minlength="2" autocomplete="name">
          <p class="error" role="alert">Ingresá tu nombre (mínimo 2 caracteres).</p>
        </div>
        <div class="form-field">
          <label for="email">Correo electrónico</label>
          <input type="email" id="email" name="email" required autocomplete="email">
          <p class="error" role="alert">Ingresá un correo válido.</p>
        </div>
        <div class="form-field">
          <label for="celular">Celular (8 dígitos, Costa Rica)</label>
          <input type="tel" id="celular" name="celular" required pattern="[0-9]{{8}}" autocomplete="tel">
          <p class="error" role="alert">Ingresá un celular válido de 8 dígitos.</p>
        </div>
        <div class="form-field">
          <label for="mensaje">Contanos brevemente tu consulta (opcional)</label>
          <textarea id="mensaje" name="mensaje" maxlength="500" rows="4"></textarea>
        </div>
        <div class="form-field">
          <label style="display:flex; gap:.6rem; font-weight:400; align-items:flex-start;">
            <input type="checkbox" id="consentimiento" name="consentimiento" required style="width:auto; margin-top:.3rem;">
            <span>Acepto la <a href="/politica-de-privacidad/" target="_blank">Política de Privacidad</a> y el tratamiento de mis datos personales para gestionar esta cita.</span>
          </label>
          <p class="error" role="alert">Debés aceptar la política de privacidad para continuar.</p>
        </div>
        <input type="hidden" id="origen" name="origen" value="">
        <div class="btn-row">
          <button type="button" class="btn btn-call" data-prev="4">Atrás</button>
          <button type="submit" class="btn btn-primary">Generar mi cita</button>
        </div>
      </div>

      <div class="booking-panel" data-panel="confirmacion" hidden>
        <div class="callout" role="status">
          <strong>¡Tu solicitud quedó registrada!</strong>
          <p style="margin:.6rem 0 0;">Un miembro del equipo confirmará tu cita por WhatsApp o correo en las próximas horas hábiles. Guardá este resumen:</p>
          <p id="resumen-cita" style="margin-top:.6rem; font-weight:600;"></p>
        </div>
        <h3>¿Cómo llegar?</h3>
        <p>{ "Guadalupe, del Estadio Coyella Fonseca, 75 m oeste, San José, Costa Rica." }</p>
        <h3>Instrucciones previas</h3>
        <p>Llegá 10 minutos antes de tu horario. Si tu consulta es de podología, no es necesario preparar nada especial; si es una primera valoración de heridas, traé estudios o imágenes previas si las tenés.</p>
        <div class="btn-row">
          <a class="btn btn-whatsapp" href="{wa_link('Hola, acabo de agendar una cita desde la web.')}" target="_blank" rel="noopener">Confirmar por WhatsApp</a>
          <a class="btn btn-primary" href="https://www.google.com/maps/search/?api=1&query=Cl%C3%ADnica+Angular+Guadalupe+San+Jos%C3%A9" target="_blank" rel="noopener">Cómo llegar (Google Maps)</a>
        </div>
      </div>
    </form>
  </div>
</section>

<section>
  <div class="container" style="display:grid; gap:2.5rem; grid-template-columns:1fr 1fr;" data-animate>
    <div>
      <h2>Información de contacto</h2>
      <p>Teléfono: <a href="tel:+50622538303">+(506) 2253-8303</a><br>
      WhatsApp: <a href="{wa_link('Hola, quisiera más información.')}">+(506) 8305-6444</a><br>
      Correo: <a href="mailto:info@angular.cr">info@angular.cr</a><br>
      Dirección: Guadalupe, del Estadio Coyella Fonseca, 75 m oeste, San José, Costa Rica.<br>
      Horario: Lunes a Viernes 9:00 am – 5:00 pm · Sábado 9:00 am – 1:00 pm · Domingo cerrado.</p>
      <p><strong>Accesibilidad:</strong> instalaciones conformes a la Ley 7600, rampa de acceso y servicio sanitario adaptado. Parqueo para 8 vehículos.</p>
    </div>
    <div class="reveal-media">
      <iframe title="Mapa de ubicación de Clínica Angular" src="https://www.google.com/maps?q=Guadalupe,+San+Jos%C3%A9,+Costa+Rica&output=embed" width="100%" height="360" style="border:0; border-radius:18px;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>
</section>
"""

EXTRA_HEAD = """<style>
.step-pill{ background:#fff; border:1px solid var(--color-border); border-radius:999px; padding:.4rem 1rem; font-size:.85rem; font-weight:600; color:#6b5f80; }
.step-pill.active{ background:var(--color-primary); color:#fff; border-color:var(--color-primary); }
</style>"""

HTML = page(
    slug=SLUG,
    title="Contáctenos | Clínica Angular San José, CR",
    description="Agende su cita en Clínica Angular, Guadalupe, San José, Costa Rica. WhatsApp, teléfono, correo y ubicación con mapa.",
    body_html=BODY,
    schema_json=SCHEMA,
    active_path="/contactenos/",
    extra_head=EXTRA_HEAD,
    extra_scripts='<script src="/assets/js/booking.js"></script>',
)

import os
os.makedirs("site/contactenos", exist_ok=True)
with open("site/contactenos/index.html", "w", encoding="utf-8") as f:
    f.write(HTML)

print("Página de contacto/agenda generada.")
