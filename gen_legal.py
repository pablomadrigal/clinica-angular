# -*- coding: utf-8 -*-
"""
Política de Privacidad y Términos y Condiciones.

IMPORTANTE: el documento maestro no incluye texto legal redactado para
estas dos páginas. Para no fabricar contenido legal como si fuera texto
ya aprobado, se genera aquí un BORRADOR DE TRABAJO basado únicamente en
los datos operativos ya confirmados en el resto del sitio (qué datos se
piden en el formulario de citas, para qué se usan, y la referencia legal
costarricense aplicable: Ley N.º 8968 de Protección de la Persona frente
al tratamiento de sus datos personales). Cada página incluye un aviso
visible de que es un borrador pendiente de revisión por un abogado antes
de publicarse como política definitiva. Esto evita dos errores: dejar un
enlace roto en el pie de página / formulario de citas, o publicar texto
legal inventado presentándolo como válido.
"""
from gen_common import page, write_page, DOMINIO, breadcrumb_html, breadcrumb_schema, ld_json

DRAFT_NOTICE = """
<div class="callout" role="note">
  <strong>Aviso: documento en borrador.</strong>
  <p style="margin:.6rem 0 0;">Este texto es un borrador de trabajo generado a partir de la información operativa confirmada del sitio (datos solicitados en el formulario de citas y canales de contacto). No ha sido revisado ni aprobado por un abogado especializado en protección de datos. Clínica Angular debe validar este contenido con asesoría legal costarricense antes de considerarlo su política definitiva.</p>
</div>
"""


def build_privacidad():
    slug = "/politica-de-privacidad/"
    crumbs = [("Inicio", "/"), ("Política de Privacidad", None)]
    breadcrumb = breadcrumb_html(crumbs)
    body = f"""
    <section style="padding-top:1.5rem;">
      <div class="container" data-animate>
        <h1>Política de Privacidad</h1>
        {DRAFT_NOTICE}
        <p>Clínica Angular ("la Clínica") trata los datos personales de sus pacientes y visitantes del sitio web conforme a la Ley N.º 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales de Costa Rica y su reglamento.</p>

        <h2>1. Datos que recopilamos</h2>
        <p>A través del formulario de citas en <a href="/contactenos/">Contáctenos</a> recopilamos: nombre completo, correo electrónico, número de celular, servicio de interés, fecha y horario preferidos, y el contenido del mensaje que el paciente decida escribir. No solicitamos datos sensibles (como historial clínico detallado) a través del formulario web; esa información se recopila únicamente durante la consulta presencial, bajo consentimiento informado específico.</p>

        <h2>2. Finalidad del tratamiento</h2>
        <ul>
          <li>Gestionar, confirmar y recordar la cita solicitada.</li>
          <li>Contactar al paciente por WhatsApp, correo electrónico o teléfono en relación con su cita.</li>
          <li>Elaborar el expediente clínico electrónico cuando el paciente asiste a consulta.</li>
          <li>Cumplir obligaciones legales y de registro sanitario aplicables a servicios de salud en Costa Rica.</li>
        </ul>
        <p>No vendemos ni cedemos datos personales a terceros con fines comerciales o publicitarios.</p>

        <h2>3. Encargados y canales de comunicación</h2>
        <p>Utilizamos WhatsApp (Meta/WhatsApp Inc.) como canal de contacto directo mediante enlaces <code>wa.me</code>. Al escribirnos por WhatsApp, el tratamiento de ese canal específico se rige también por la política de privacidad de WhatsApp.</p>

        <h2>4. Derechos del paciente (Ley 8968)</h2>
        <p>Toda persona tiene derecho a acceder, rectificar, cancelar y oponerse al tratamiento de sus datos personales, así como a revocar su consentimiento en cualquier momento. Para ejercer estos derechos puede escribir a <a href="mailto:info@angular.cr">info@angular.cr</a> o llamar al <a href="tel:+50622538303">+(506) 2253-8303</a>.</p>

        <h2>5. Conservación de datos</h2>
        <p>Los datos del expediente clínico se conservan durante el plazo que exige la normativa sanitaria costarricense vigente. Los datos de contacto recopilados únicamente para agendar una cita se conservan mientras sean necesarios para ese fin.</p>

        <h2>6. Seguridad</h2>
        <p>Aplicamos medidas razonables de seguridad técnica y organizativa para proteger los datos personales contra acceso no autorizado, pérdida o alteración.</p>

        <h2>7. Cambios a esta política</h2>
        <p>Esta política puede actualizarse. La fecha de la última revisión se indicará en esta misma página una vez validada por asesoría legal.</p>
      </div>
    </section>
    """
    graph = [{"@type": "WebPage", "url": DOMINIO + slug, "name": "Política de Privacidad"}]
    graph.append(breadcrumb_schema([(l, u or slug) for l, u in crumbs]))
    html = page(
        slug=slug,
        title="Política de Privacidad | Clínica Angular",
        description="Política de privacidad de Clínica Angular: cómo se recopilan, usan y protegen los datos personales de pacientes, conforme a la Ley 8968 de Costa Rica.",
        body_html=breadcrumb + body,
        schema_json=ld_json(graph),
        active_path="",
    )
    write_page(slug, html)
    print("OK", slug)


def build_terminos():
    slug = "/terminos/"
    crumbs = [("Inicio", "/"), ("Términos y Condiciones", None)]
    breadcrumb = breadcrumb_html(crumbs)
    body = f"""
    <section style="padding-top:1.5rem;">
      <div class="container" data-animate>
        <h1>Términos y Condiciones</h1>
        {DRAFT_NOTICE}

        <h2>1. Objeto</h2>
        <p>Estos términos regulan el uso del sitio web angular.cr, operado por Clínica Angular, Guadalupe, San José, Costa Rica.</p>

        <h2>2. Naturaleza informativa del sitio</h2>
        <p>El contenido clínico publicado en este sitio (incluyendo las páginas de especialidades, tecnologías y el blog) tiene fines informativos y educativos. No sustituye una valoración médica o podológica presencial. Ante cualquier síntoma o duda clínica, se debe consultar directamente con un profesional de la salud.</p>

        <h2>3. Agenda de citas en línea</h2>
        <p>El formulario de citas permite enviar una solicitud de cita. El envío del formulario no constituye una cita confirmada: la confirmación final se comunica por WhatsApp o correo electrónico según disponibilidad real de agenda.</p>

        <h2>4. Uso aceptable del sitio</h2>
        <p>El usuario se compromete a utilizar el sitio de forma lícita, sin intentar vulnerar su seguridad ni suministrar información falsa en los formularios de contacto o agenda.</p>

        <h2>5. Propiedad intelectual</h2>
        <p>Los textos, imágenes y materiales propios de Clínica Angular publicados en este sitio son de su titularidad o se usan con la debida autorización. Queda prohibida su reproducción total o parcial sin autorización previa.</p>

        <h2>6. Enlaces a WhatsApp y redes sociales</h2>
        <p>Este sitio incluye enlaces directos a WhatsApp y a perfiles de redes sociales de la Clínica. El uso de esos servicios está sujeto a los términos y políticas de cada plataforma.</p>

        <h2>7. Limitación de responsabilidad</h2>
        <p>Clínica Angular no garantiza resultados clínicos específicos. La información sobre tecnologías y tratamientos publicada en el sitio refleja el nivel de evidencia científica disponible al momento de su redacción, el cual puede evolucionar.</p>

        <h2>8. Legislación aplicable</h2>
        <p>Estos términos se rigen por la legislación de la República de Costa Rica.</p>

        <h2>9. Contacto</h2>
        <p>Para consultas sobre estos términos: <a href="mailto:info@angular.cr">info@angular.cr</a> · <a href="tel:+50622538303">+(506) 2253-8303</a>.</p>
      </div>
    </section>
    """
    graph = [{"@type": "WebPage", "url": DOMINIO + slug, "name": "Términos y Condiciones"}]
    graph.append(breadcrumb_schema([(l, u or slug) for l, u in crumbs]))
    html = page(
        slug=slug,
        title="Términos y Condiciones | Clínica Angular",
        description="Términos y condiciones de uso del sitio web de Clínica Angular en San José, Costa Rica.",
        body_html=breadcrumb + body,
        schema_json=ld_json(graph),
        active_path="",
    )
    write_page(slug, html)
    print("OK", slug)


if __name__ == "__main__":
    build_privacidad()
    build_terminos()
