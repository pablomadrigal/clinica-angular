# -*- coding: utf-8 -*-
"""
Genera las páginas de índice/categoría y perfiles que faltan:
Instalaciones, Blog (estructura), Tienda Virtual (reservada),
Especialidades (índice general), Podología (categoría),
Fisioterapia (categoría), Tecnologías (índice), Nuestros Especialistas
(índice con 9 perfiles resumen) y Sobre el Dr. Madrigal (perfil completo).

Reutiliza el motor de renderizado genérico de build_service_pages.py
(mismo documento, mismos índices de párrafo ya verificados) para no
duplicar lógica ni inventar contenido.
"""
import re
from gen_common import page, write_page, wa_link, DOMINIO, breadcrumb_html, breadcrumb_schema, ld_json
from build_service_pages import PARAS, render_body, is_skip, NAME_TO_SLUG, linkify_enlaces

results = []


def log(slug):
    results.append(slug)
    print("OK", slug)


# ---------------------------------------------------------------------------
# 1) INSTALACIONES  (141-171)
# ---------------------------------------------------------------------------
def build_instalaciones():
    slug = "/instalaciones/"
    crumbs = [("Inicio", "/"), ("Instalaciones", None)]
    breadcrumb = breadcrumb_html(crumbs)
    hero = """
    <section class="hero" style="min-height:auto; padding:3rem 0;">
      <div class="container" data-animate>
        <h1>400 m² — Un edificio diseñado para el cuidado integral del pie y la cicatrización de heridas</h1>
        <p class="lead">Cada espacio de nuestras instalaciones responde a una función clínica específica —desde la valoración inicial hasta la esterilización del instrumental— siguiendo protocolos estrictos de bioseguridad y accesibilidad universal.</p>
      </div>
    </section>
    """
    areas = [
        "Sala de recepción — primer contacto y espera.",
        "Siete consultorios — valoración y tratamiento.",
        "Laboratorio de estudio de pisada — biomecánica y baropodometría.",
        "Sala de cirugía menor — procedimientos mínimamente invasivos con sedación no profunda.",
        "Área de descontaminación y esterilización — manejo de equipo estéril.",
        "Servicio sanitario adaptado — conforme a Ley 7600.",
        "Oficina administrativa.",
        "Bodega.",
        "Área de limpieza.",
        "Comedor de colaboradores.",
        "Parqueo para 8 vehículos.",
        "Rampa de acceso — conforme a Ley 7600.",
    ]
    areas_html = "".join(f"<li>{a}</li>" for a in areas)
    porque = [
        "Separación de flujos: la sala de cirugía menor y el área de esterilización están diferenciadas del resto del edificio, reduciendo riesgo de contaminación cruzada.",
        "Capacidad multidisciplinaria: siete consultorios permiten atención simultánea sin comprometer tiempos de espera ni privacidad.",
        "Tecnología con espacio propio: el laboratorio de estudio de la marcha tiene área dedicada, separada de los consultorios de valoración general.",
    ]
    porque_html = "".join(f"<li>{p}</li>" for p in porque)

    body_main = f"""
    <section class="bg-alt" data-animate>
      <div class="container">
        <h2>Distribución del espacio — 12 áreas</h2>
        <ul>{areas_html}</ul>
      </div>
    </section>
    <section data-animate>
      <div class="container split" style="gap:2rem;">
        <div>
          <h2>Accesibilidad universal</h2>
          <p>Contamos con rampa de acceso y servicio sanitario adaptado conforme a la Ley 7600 de Costa Rica, garantizando que cualquier paciente pueda ingresar y movilizarse dentro de nuestras instalaciones sin barreras físicas.</p>
        </div>
        <div>
          <h2>Bioseguridad y protocolos</h2>
          <p>Área dedicada de descontaminación y esterilización, rotulación de seguridad visible en todo el edificio y un plan de emergencias documentado, revisado y conocido por todo el equipo de colaboradores.</p>
        </div>
      </div>
    </section>
    <section class="bg-alt" data-animate>
      <div class="container">
        <h2>Por qué el espacio importa tanto como el criterio clínico</h2>
        <ul>{porque_html}</ul>
      </div>
    </section>
    """
    cta = f"""
    <section class="brand-strip text-center" data-animate>
      <div class="container">
        <h2>¿Querés conocer nuestras instalaciones en persona?</h2>
        <div class="btn-row" style="justify-content:center;">
          <a class="btn btn-primary" style="background:#fff; color:var(--color-primary-dark);" href="/contactenos/">Agendar cita</a>
          <a class="btn btn-whatsapp" href="{wa_link('Hola, quisiera conocer las instalaciones de Clínica Angular.')}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
    </section>
    """
    graph = [{"@type": "MedicalWebPage", "url": DOMINIO + slug, "name": "Instalaciones"}]
    graph.append(breadcrumb_schema([(l, u or slug) for l, u in crumbs]))
    html = page(
        slug=slug,
        title="Instalaciones | Clínica Angular San José, CR",
        description="Conozca las instalaciones de Clínica Angular: 400 m² diseñados para el cuidado integral del pie en San José, Costa Rica.",
        body_html=breadcrumb + hero + body_main + cta,
        schema_json=ld_json(graph),
        active_path="/instalaciones/",
    )
    write_page(slug, html)
    log(slug)


# ---------------------------------------------------------------------------
# 2) BLOG — estructura (171-185)
# ---------------------------------------------------------------------------
def build_blog():
    slug = "/blog/"
    crumbs = [("Inicio", "/"), ("Blog", None)]
    breadcrumb = breadcrumb_html(crumbs)
    categorias = [
        ("Pie diabético y cicatrización de heridas", "evidence-clinical"),
        ("Uñas y piel del pie", "evidence-strong"),
        ("Biomecánica y dolor", "evidence-mixed"),
        ("Tecnología con criterio científico", "evidence-strong"),
        ("Bienestar integral", "evidence-clinical"),
    ]
    cards = "".join(
        f'''<div class="service-card" data-animate>
          <div class="card-body">
            <span class="evidence-badge {cls}">Categoría</span>
            <h3 style="margin-top:.8rem;">{nombre}</h3>
            <p>Próximamente: artículos con nivel de evidencia declarado (Evidencia sólida / Evidencia mixta / Manejo clínico), preguntas frecuentes y referencias.</p>
          </div>
        </div>'''
        for nombre, cls in categorias
    )
    body_main = f"""
    <section style="padding-top:1.5rem;">
      <div class="container" data-animate>
        <h1>Centro de Conocimiento</h1>
        <p class="lead">Artículos clínicos de Clínica Angular sobre podología, heridas y pie diabético, con fundamento científico real y nivel de evidencia declarado en cada publicación.</p>
        <div class="callout"><strong>Nota:</strong> esta sección se irá llenando progresivamente con artículos conforme se publiquen. Cada artículo incluirá URL propia, title SEO, meta descripción, al menos un "Punto clave", preguntas frecuentes, etiqueta de nivel de evidencia, referencias cuando aplique y schema JSON-LD (Article o MedicalWebPage + FAQPage) — el mismo estándar aplicado en el resto del sitio.</div>
      </div>
    </section>
    <section class="bg-alt">
      <div class="container">
        <h2>Estructura definida (5 categorías, a llenar progresivamente)</h2>
        <div class="card-grid">{cards}</div>
      </div>
    </section>
    """
    graph = [{"@type": "CollectionPage", "url": DOMINIO + slug, "name": "Centro de Conocimiento"}]
    graph.append(breadcrumb_schema([(l, u or slug) for l, u in crumbs]))
    html = page(
        slug=slug,
        title="Centro de Conocimiento | Clínica Angular CR",
        description="Artículos clínicos de Clínica Angular sobre podología, heridas y pie diabético en San José, Costa Rica, con fundamento científico real.",
        body_html=breadcrumb + body_main,
        schema_json=ld_json(graph),
        active_path="/blog/",
    )
    write_page(slug, html)
    log(slug)


# ---------------------------------------------------------------------------
# 3) TIENDA VIRTUAL — reservada (185-190)
# ---------------------------------------------------------------------------
def build_tienda():
    slug = "/tienda/"
    crumbs = [("Inicio", "/"), ("Tienda Virtual", None)]
    breadcrumb = breadcrumb_html(crumbs)
    body_main = """
    <section style="padding-top:1.5rem;">
      <div class="container text-center" data-animate>
        <h1>Tienda Virtual</h1>
        <p class="lead" style="margin:0 auto;">Esta sección está en construcción. Próximamente podrás encontrar aquí productos recomendados por nuestro equipo clínico.</p>
        <div class="callout" style="text-align:left; max-width:640px; margin:2rem auto 0;">
          <strong>Página reservada.</strong>
          <p style="margin:.6rem 0 0;">La tienda virtual no existe todavía — esta ruta queda programada en la navegación del sitio, sin contenido ni funcionalidad de e-commerce hasta que se defina el catálogo de productos y la plataforma. Mientras tanto, para cualquier producto o insumo relacionado con tu tratamiento, escribinos directamente.</p>
        </div>
        <div class="btn-row" style="justify-content:center; margin-top:2rem;">
          <a class="btn btn-whatsapp" href="https://wa.me/50683056444?text=Hola%2C%20quisiera%20consultar%20sobre%20productos." target="_blank" rel="noopener">Consultar por WhatsApp</a>
        </div>
      </div>
    </section>
    """
    graph = [{"@type": "WebPage", "url": DOMINIO + slug, "name": "Tienda Virtual"}]
    graph.append(breadcrumb_schema([(l, u or slug) for l, u in crumbs]))
    html = page(
        slug=slug,
        title="Tienda Virtual (próximamente) | Clínica Angular",
        description="La tienda virtual de Clínica Angular está en construcción. Escribinos por WhatsApp para consultas sobre productos.",
        body_html=breadcrumb + body_main,
        schema_json=ld_json(graph),
        active_path="/blog/",
    )
    write_page(slug, html)
    log(slug)


# ---------------------------------------------------------------------------
# 4) ESPECIALIDADES — índice general (sin contenido propio en el doc;
#    enlaza a las 5 categorías según la estructura de navegación acordada)
# ---------------------------------------------------------------------------
def build_especialidades_index():
    slug = "/especialidades/"
    crumbs = [("Inicio", "/"), ("Especialidades", None)]
    breadcrumb = breadcrumb_html(crumbs)
    cats = [
        ("Podología Clínica", "/especialidades/podologia/", "Onicomicosis, uña encarnada, verrugas plantares, deformidades, pie geriátrico y pediátrico, callos, pie diabético y más.", "/assets/img/onicomicosis-card.svg"),
        ("Clínica de Heridas", "/heridas-cronicas/", "Tratamiento avanzado de heridas crónicas y úlceras de difícil cierre.", "/assets/img/heridas-card.svg"),
        ("Fisioterapia Especializada", "/fisioterapia/", "Rehabilitación del adulto mayor, manejo de dolor musculoesquelético, post-quirúrgica y de amputados, fascitis plantar.", "/assets/img/klaser-card.svg"),
        ("Psicología Clínica", "/psicologia-clinica/", "Terapia individual, de pareja y familia: ansiedad, depresión, duelo y TDA.", "/assets/img/pie-diabetico-card.svg"),
        ("Medicina General", "/medicina-general/", "Valoración médica general en coordinación con el equipo multidisciplinario.", "/assets/img/onicomicosis-card.svg"),
    ]
    cards = "".join(
        f'''<a class="service-card" href="{url}" data-animate>
          <img src="{img}" alt="{nombre}" loading="lazy">
          <div class="card-body"><h3>{nombre}</h3><p>{desc}</p></div>
        </a>'''
        for nombre, url, desc, img in cats
    )
    body_main = f"""
    <section style="padding-top:1.5rem;">
      <div class="container" data-animate>
        <h1>Especialidades</h1>
        <p class="lead">Cinco disciplinas bajo un mismo techo, articuladas con un mismo criterio: diagnóstico antes que tratamiento, evidencia antes que promesa.</p>
      </div>
    </section>
    <section class="bg-alt">
      <div class="container">
        <div class="card-grid">{cards}</div>
      </div>
    </section>
    """
    graph = [{"@type": "CollectionPage", "url": DOMINIO + slug, "name": "Especialidades"}]
    graph.append(breadcrumb_schema([(l, u or slug) for l, u in crumbs]))
    html = page(
        slug=slug,
        title="Especialidades | Clínica Angular San José, CR",
        description="Podología clínica, heridas, fisioterapia, psicología y medicina general: conozca las cinco especialidades de Clínica Angular.",
        body_html=breadcrumb + body_main,
        schema_json=ld_json(graph),
        active_path="/especialidades/",
    )
    write_page(slug, html)
    log(slug)


# ---------------------------------------------------------------------------
# 5) PODOLOGÍA — categoría (191-196)
# ---------------------------------------------------------------------------
def build_podologia_categoria():
    slug = "/especialidades/podologia/"
    crumbs = [("Inicio", "/"), ("Especialidades", "/especialidades/"), ("Podología", None)]
    breadcrumb = breadcrumb_html(crumbs)
    servicios = [
        ("Hongos en las uñas (Onicomicosis)", "/hongos-unas-onicomicosis/"),
        ("Uña encarnada (Onicocriptosis)", "/una-encarnada/"),
        ("Verruga plantar (VPH)", "/verruga-plantar-vph/"),
        ("Deformidades en dedos y pies", "/deformidades-dedos-pies/"),
        ("Pie geriátrico", "/pie-geriatrico/"),
        ("Pie pediátrico", "/pie-pediatrico/"),
        ("Traumatismo de uñas", "/traumatismo-de-unas/"),
        ("Callos y durezas", "/callos-y-durezas/"),
        ("Pies secos, sudoración y mal olor", "/pies-secos-sudoracion-mal-olor/"),
        ("Clínica de pie diabético", "/pie-diabetico/"),
    ]
    cards = "".join(
        f'<a class="service-card" href="{url}" data-animate><div class="card-body"><h3>{nombre}</h3></div></a>'
        for nombre, url in servicios
    )
    body_main = f"""
    <section style="padding-top:1.5rem;">
      <div class="container" data-animate>
        <h1>Podología</h1>
        <p class="lead">Diagnóstico confirmado antes que tratamiento. Diez condiciones del pie abordadas con criterio clínico y evidencia actualizada.</p>
      </div>
    </section>
    <section class="bg-alt">
      <div class="container">
        <div class="card-grid">{cards}</div>
      </div>
    </section>
    """
    graph = [{"@type": "CollectionPage", "url": DOMINIO + slug, "name": "Podología"}]
    graph.append(breadcrumb_schema([(l, u or slug) for l, u in crumbs]))
    html = page(
        slug=slug,
        title="Podología Clínica | Clínica Angular CR",
        description="Podología clínica en San José, Costa Rica: diagnóstico confirmado y tratamiento basado en evidencia para diez condiciones del pie.",
        body_html=breadcrumb + body_main,
        schema_json=ld_json(graph),
        active_path="/especialidades/",
    )
    write_page(slug, html)
    log(slug)


# ---------------------------------------------------------------------------
# 6) FISIOTERAPIA — categoría (620-638)
# ---------------------------------------------------------------------------
def build_fisioterapia_categoria():
    slug = "/fisioterapia/"
    crumbs = [("Inicio", "/"), ("Especialidades", "/especialidades/"), ("Fisioterapia Especializada", None)]
    breadcrumb = breadcrumb_html(crumbs)
    secciones = [
        ("Rehabilitación del adulto mayor", "Evaluación cuatridimensional exhaustiva, valoración y rehabilitación de la marcha, rehabilitación post-quirúrgica, manejo de demencia y control del dolor."),
        ("Manejo de dolores musculares", "Técnicas manuales, ejercicio terapéutico, oscilaciones profundas, tecarterapia, electropunción, punción seca y corrientes eléctricas, individualizado según sintomatología."),
        ("Rehabilitación post-quirúrgica y de amputados", "Disminuir dolor, normalizar sensibilidad del muñón y lograr funcionalidad para uso de prótesis."),
        ("Espolón calcáneo y fascitis plantar", "Valoración física integral, identificación de la causa de estrés repetitivo de la fascia plantar, trastornos de la marcha, calzado inadecuado o biomecánica. Se implementan protocolos de rehabilitación y reducción de factores generadores."),
    ]
    secciones_html = "".join(f"<h3>{t}</h3><p>{d}</p>" for t, d in secciones)
    cards = """
    <a class="service-card" href="/fascitis-plantar/" data-animate><div class="card-body"><h3>Fascitis plantar</h3></div></a>
    <a class="service-card" href="/biomecanica-plantillas/" data-animate><div class="card-body"><h3>Estudio biomecánico y plantillas personalizadas</h3></div></a>
    """
    body_main = f"""
    <section style="padding-top:1.5rem;">
      <div class="container" data-animate>
        <h1>Fisioterapia especializada</h1>
      </div>
    </section>
    <section>
      <div class="container" data-animate>
        {secciones_html}
        <p><strong>Enlaces internos sugeridos:</strong> <a href="/pie-geriatrico/">Pie geriátrico</a> · <a href="/fascitis-plantar/">Fascitis plantar</a> · <a href="/biomecanica-plantillas/">Biomecánica y plantillas</a></p>
      </div>
    </section>
    <section class="bg-alt">
      <div class="container">
        <h2>Páginas relacionadas</h2>
        <div class="card-grid">{cards}</div>
      </div>
    </section>
    """
    graph = [{"@type": "MedicalWebPage", "url": DOMINIO + slug, "name": "Fisioterapia especializada"}]
    graph.append(breadcrumb_schema([(l, u or slug) for l, u in crumbs]))
    html = page(
        slug=slug,
        title="Fisioterapia Especializada en Costa Rica | Clínica Angular",
        description="Fisioterapia especializada en San José, Costa Rica: rehabilitación del adulto mayor, dolor musculoesquelético, post-quirúrgica y de amputados. Agende hoy.",
        body_html=breadcrumb + body_main,
        schema_json=ld_json(graph),
        active_path="/especialidades/",
    )
    write_page(slug, html)
    log(slug)


# ---------------------------------------------------------------------------
# 7) TECNOLOGÍAS — índice (775-778)
# ---------------------------------------------------------------------------
def build_tecnologias_index():
    slug = "/tecnologias/"
    crumbs = [("Inicio", "/"), ("Tecnologías", None)]
    breadcrumb = breadcrumb_html(crumbs)
    techs = [
        ("K-Laser CUBE 4", "/k-laser-cube-4/", "Terapia láser de alta potencia: qué dice la evidencia, sin promesas exageradas."),
        ("Baropodómetro", "/baropodometro/", "Estudio de presión plantar: qué mide, para qué sirve y qué tan confiable es."),
        ("Desbridamiento ultrasónico", "/desbridamiento-ultrasonico/", "Eliminación de tejido no viable en heridas crónicas con ultrasonido de baja frecuencia."),
        ("Centrífuga PRP", "/centrifuga-prp/", "Plasma Rico en Plaquetas: qué es, cómo se prepara y qué muestra la evidencia en heridas."),
        ("Ozonoterapia", "/ozonoterapia-heridas/", "Ozonoterapia tópica aplicada al manejo de heridas."),
    ]
    cards = "".join(
        f'<a class="service-card" href="{url}" data-animate><div class="card-body"><h3>{nombre}</h3><p>{desc}</p></div></a>'
        for nombre, url, desc in techs
    )
    body_main = f"""
    <section style="padding-top:1.5rem;">
      <div class="container" data-animate>
        <h1>Tecnologías</h1>
        <p class="lead">Tecnología con criterio científico: cada equipo se describe con lo que la evidencia realmente respalda, qué sigue siendo incierto, y para qué lo usamos en Clínica Angular.</p>
      </div>
    </section>
    <section class="bg-alt">
      <div class="container">
        <div class="card-grid">{cards}</div>
      </div>
    </section>
    """
    graph = [{"@type": "CollectionPage", "url": DOMINIO + slug, "name": "Tecnologías"}]
    graph.append(breadcrumb_schema([(l, u or slug) for l, u in crumbs]))
    html = page(
        slug=slug,
        title="Tecnologías Clínicas | Clínica Angular CR",
        description="Conozca las tecnologías diagnósticas y terapéuticas de Clínica Angular en San José, Costa Rica, explicadas con criterio científico.",
        body_html=breadcrumb + body_main,
        schema_json=ld_json(graph),
        active_path="/tecnologias/",
    )
    write_page(slug, html)
    log(slug)


# ---------------------------------------------------------------------------
# 8) NUESTROS ESPECIALISTAS — índice con 9 perfiles resumen (750-775)
# ---------------------------------------------------------------------------
PERFILES = [
    ("Dra. Rebeca Ruiz", "Podóloga y Fisioterapeuta", "Licenciada en Terapia Física (Universidad Santa Paula) · Técnico Especializado en Podología Clínica (Universidad Americana) · Técnica en masoterapia y reflexología básica · Esteticista desde 2006, experiencia en Tabacón Resort y Four Seasons Resort. Código: PAF-2184."),
    ("Dr. Maynor Quirós Sandoval", "Enfermero, Especialista en Curación de Heridas", "Maestría en Cuidados Intensivos (Universidad Iberoamericana) · Licenciatura en Enfermería (Universidad Santa Lucía) · Diploma en cuidado integral de heridas y ostomías (UNAM, México) · Diploma en Pie Diabético y Medicina Podiátrica (Universidad Marista, Guadalajara) · Formación en L-PRF (2022) · Fundador y CEO de Ancamedica. Código: 3617."),
    ("Dra. Ana Mora Rojas", "Médica y Cirujana, Especialista en Trastornos del Sueño", "Master Propio en Sueño: Fisiología y Medicina (Universidad de Murcia) · Licenciada en Medicina y Cirugía (UIA) · Formación en Universidad de Minnesota, SES España, ACMES, Universidad Peruana Cayetano Heredia, Global Sleep Education. Código: 5965."),
    ("Dra. Milagro Quesada Villegas", "Psicóloga Clínica", "Maestría en Psicología Clínica (UNIBE) · Licenciada en Psicología (UCR) · 32 años de experiencia en terapia individual, pareja, familia y grupo · Autora del programa \"Crianza sin culpa\". Código: #1030."),
    ("Dr. Adrián Solano Salazar", "Audiología", "Colegiado en el Colegio de Médicos y Cirujanos de Costa Rica (2015) · Máster en Audiología · Posgrado en rehabilitación auditiva con audífonos (Universidad Santa Paula). Código: AU-0002."),
    ("Dr. Ricardo Sáenz Coto", "Médico General", "Licenciatura (UACA) · Valoraciones vasculares básicas, escleroterapia, curación de úlceras, manejo de dolor e inflamación de piernas. Código: 11821."),
    ("Téc. Amada Sequeira Chaves", "Especialista en Pedicure", "Especialista en pedicure estético y clínico, técnicas faciales, masaje relajante y descontracturante terapéutico, estudios de estilismo."),
    ("Téc. Leticia Piedra Quesada", "Técnica en Quiropodia", "Curso de Quiropodia (2024)."),
    ("Téc. Cindy Chacón Cortés", "Técnica en Quiropodia", "Estilista profesional, Instituto Hermandades del Trabajo (1995); pedicurista."),
]


def build_especialistas_index():
    slug = "/nuestros-especialistas/"
    crumbs = [("Inicio", "/"), ("Nuestros Especialistas", None)]
    breadcrumb = breadcrumb_html(crumbs)
    madrigal_card = """
    <a class="profile-card" href="/sobre-el-dr-madrigal/" data-animate>
      <img src="/assets/img/equipo-grupo.svg" alt="Dr. Marvin Madrigal" loading="lazy">
      <div class="card-body">
        <h3>Dr. Marvin Madrigal</h3>
        <p class="role">Fundador y Director — Podología Clínica y Curación de Heridas</p>
        <p>Enfermero y podólogo clínico. Más de 11 años de trayectoria. Perfil completo de formación y filosofía clínica.</p>
      </div>
    </a>
    """
    otras_cards = "".join(
        f'''<div class="profile-card" data-animate>
          <img src="/assets/img/equipo-grupo.svg" alt="{nombre}" loading="lazy">
          <div class="card-body">
            <h3>{nombre}</h3>
            <p class="role">{rol}</p>
            <p>{creds}</p>
          </div>
        </div>'''
        for nombre, rol, creds in PERFILES
    )
    nota = '<div class="callout"><strong>Nota de rigor:</strong> se mantienen únicamente datos verificables de formación y colegiatura. No se agregan calificativos como "el mejor" sin sustento — mismo criterio en todo el sitio.</div>'
    body_main = f"""
    <section style="padding-top:1.5rem;">
      <div class="container" data-animate>
        <h1>Nuestro equipo</h1>
        <p class="lead">Diez profesionales, una sola forma de trabajar: con criterio verificable, no con títulos decorativos.</p>
      </div>
    </section>
    <section class="bg-alt">
      <div class="container">
        <div class="card-grid">{madrigal_card}</div>
      </div>
    </section>
    <section>
      <div class="container">
        <h2>Resto del equipo</h2>
        <div class="card-grid">{otras_cards}</div>
        {nota}
      </div>
    </section>
    """
    graph = [{"@type": "CollectionPage", "url": DOMINIO + slug, "name": "Nuestros Especialistas"}]
    graph.append(breadcrumb_schema([(l, u or slug) for l, u in crumbs]))
    html = page(
        slug=slug,
        title="Nuestro Equipo Multidisciplinario | Clínica Angular CR",
        description="Conozca al equipo multidisciplinario de Clínica Angular en San José, Costa Rica: podología, heridas, fisioterapia, psicología y medicina general.",
        body_html=breadcrumb + body_main,
        schema_json=ld_json(graph),
        active_path="/nuestros-especialistas/",
    )
    write_page(slug, html)
    log(slug)


# ---------------------------------------------------------------------------
# 9) SOBRE EL DR. MADRIGAL — perfil completo (715-750), vía render_body genérico
# ---------------------------------------------------------------------------
def build_dr_madrigal():
    slug = "/sobre-el-dr-madrigal/"
    h1 = "Sobre el Dr. Marvin Madrigal"
    body_main, faqs = render_body(716, 749, h1)
    crumbs = [("Inicio", "/"), ("Nuestros Especialistas", "/nuestros-especialistas/"), ("Dr. Marvin Madrigal", None)]
    breadcrumb = breadcrumb_html(crumbs)
    hero = f"""
    <section style="padding-top:1.5rem;">
      <div class="container" data-animate>
        <h1>{h1}</h1>
      </div>
    </section>
    """
    cta = f"""
    <section class="brand-strip text-center" data-animate>
      <div class="container">
        <h2>¿Querés una valoración con el Dr. Madrigal?</h2>
        <div class="btn-row" style="justify-content:center;">
          <a class="btn btn-primary" style="background:#fff; color:var(--color-primary-dark);" href="/contactenos/">Agendar cita</a>
          <a class="btn btn-whatsapp" href="{wa_link('Hola, quisiera agendar una cita con el Dr. Madrigal.')}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
    </section>
    """
    graph = [{"@type": "Physician", "url": DOMINIO + slug, "name": "Marvin Madrigal"}]
    if faqs:
        graph.append({
            "@type": "FAQPage",
            "mainEntity": [
                {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
                for q, a in faqs if a
            ],
        })
    graph.append(breadcrumb_schema([(l, u or slug) for l, u in crumbs]))
    html = page(
        slug=slug,
        title="Dr. Marvin Madrigal | Podólogo Clínico en Costa Rica",
        description="Conoce al Dr. Marvin Madrigal: enfermero y podólogo clínico, especialista en pie diabético y curación de heridas, director de Clínica Angular.",
        body_html=breadcrumb + hero + body_main + cta,
        schema_json=ld_json(graph),
        active_path="/nuestros-especialistas/",
    )
    write_page(slug, html)
    log(slug)


if __name__ == "__main__":
    build_instalaciones()
    build_blog()
    build_tienda()
    build_especialidades_index()
    build_podologia_categoria()
    build_fisioterapia_categoria()
    build_tecnologias_index()
    build_especialistas_index()
    build_dr_madrigal()
    print(f"\nTotal páginas extra generadas: {len(results)}")
