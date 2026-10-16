# -*- coding: utf-8 -*-
"""
Genera automáticamente todas las páginas de especialidad, fisioterapia,
psicología, medicina general y tecnologías, leyendo directamente los
párrafos del documento maestro (por rango de índice, ya verificado
contra los marcadores "URL:" / "URL sugerida:" del documento) y
renderizándolos con el mismo sistema de diseño que Inicio/Contacto.

No se inventa contenido: todo el texto sale literal del docx. El único
trabajo "creativo" es el formateo (listas, FAQ, callouts, referencias).
"""
import re, json
import docx
from gen_common import page, write_page, wa_link, DOMINIO, breadcrumb_html, breadcrumb_schema, ld_json

DOC_PATH = "/root/.claude/uploads/553506c0-ee10-55a0-b9ae-493f4853ec76/9d6e72cd-Angular_Contenido_Web_Maestro_2.3rev.docx"
d = docx.Document(DOC_PATH)
PARAS = [(p.style.name, p.text.strip()) for p in d.paragraphs]

# (key, slug, h1, start, end, categoria_label, categoria_url, skip_heading_as_title)
PAGES = [
    ("hongos", "/hongos-unas-onicomicosis/", "Hongos en las uñas (Onicomicosis)", 196, 220, "Podología", "/especialidades/podologia/"),
    ("una-encarnada", "/una-encarnada/", "Uña encarnada (Onicocriptosis)", 220, 280, "Podología", "/especialidades/podologia/"),
    ("verruga-plantar", "/verruga-plantar-vph/", "Verruga plantar (VPH)", 280, 339, "Podología", "/especialidades/podologia/"),
    ("deformidades", "/deformidades-dedos-pies/", "Deformidades en dedos y pies", 339, 391, "Podología", "/especialidades/podologia/"),
    ("pie-geriatrico", "/pie-geriatrico/", "Pie geriátrico", 391, 405, "Podología", "/especialidades/podologia/"),
    ("pie-pediatrico", "/pie-pediatrico/", "Pie pediátrico", 405, 434, "Podología", "/especialidades/podologia/"),
    ("traumatismo-unas", "/traumatismo-de-unas/", "Traumatismo de uñas", 434, 465, "Podología", "/especialidades/podologia/"),
    ("callos-durezas", "/callos-y-durezas/", "Callos y durezas", 465, 499, "Podología", "/especialidades/podologia/"),
    ("pies-secos", "/pies-secos-sudoracion-mal-olor/", "Pies secos, sudoración y mal olor", 499, 529, "Podología", "/especialidades/podologia/"),
    ("pie-diabetico", "/pie-diabetico/", "Clínica de pie diabético", 529, 555, "Podología", "/especialidades/podologia/"),
    ("heridas", "/heridas-cronicas/", "Clínica de Heridas", 556, 620, "Enfermería", "/especialidades/"),
    ("fascitis", "/fascitis-plantar/", "Fascitis plantar", 638, 661, "Fisioterapia", "/fisioterapia/"),
    ("biomecanica", "/biomecanica-plantillas/", "Estudio biomecánico de la marcha y plantillas personalizadas", 661, 685, "Fisioterapia", "/fisioterapia/"),
    ("psicologia", "/psicologia-clinica/", "Psicología Clínica", 686, 703, "Especialidades", "/especialidades/"),
    ("medicina-general", "/medicina-general/", "Medicina General", 704, 714, "Especialidades", "/especialidades/"),
    ("klaser", "/k-laser-cube-4/", "K-Laser CUBE 4", 782, 808, "Tecnologías", "/tecnologias/"),
    ("baropodometro", "/baropodometro/", "Baropodómetro: qué mide, para qué sirve y qué tan confiable es", 810, 831, "Tecnologías", "/tecnologias/"),
    ("desbridamiento", "/desbridamiento-ultrasonico/", "Desbridamiento ultrasónico de heridas", 833, 851, "Tecnologías", "/tecnologias/"),
    ("prp", "/centrifuga-prp/", "Centrífuga PRP (Plasma Rico en Plaquetas)", 852, 881, "Tecnologías", "/tecnologias/"),
    ("ozonoterapia", "/ozonoterapia-heridas/", "Ozonoterapia tópica para heridas", 883, 902, "Tecnologías", "/tecnologias/"),
]

NAME_TO_SLUG = {
    "pie diabético": "/pie-diabetico/",
    "uña encarnada": "/una-encarnada/",
    "hongos en las uñas": "/hongos-unas-onicomicosis/",
    "k-laser cube 4": "/k-laser-cube-4/",
    "heridas crónicas": "/heridas-cronicas/",
    "heridas crónicas y úlceras": "/heridas-cronicas/",
    "biomecánica y plantillas": "/biomecanica-plantillas/",
    "fascitis plantar": "/fascitis-plantar/",
    "desbridamiento ultrasónico": "/desbridamiento-ultrasonico/",
    "centrífuga prp": "/centrifuga-prp/",
    "ozonoterapia": "/ozonoterapia-heridas/",
}

SKIP_PATTERNS = [
    re.compile(r"^\d+\.[IVX]+(\.\d+)?\s*—"),  # marcadores "3.I.1 — Título"
    re.compile(r"^url\b", re.I),
    re.compile(r"^url sugerida", re.I),
    re.compile(r"^title seo", re.I),
    re.compile(r"^meta descripci", re.I),
    re.compile(r"^enlaces internos", re.I),
    re.compile(r"^agenda tu", re.I),
    re.compile(r"^whatsapp[: ]", re.I),
    re.compile(r"^citas por whatsapp", re.I),
]


def is_skip(text):
    return any(p.search(text) for p in SKIP_PATTERNS)


def extract_meta(start, end):
    """Busca Title SEO y Meta descripción dentro del rango (pueden venir
    combinados en una sola línea separados por ' · ')."""
    title_seo, meta_desc = None, None
    for style, text in PARAS[start:end]:
        if not text:
            continue
        blob = text
        m = re.search(r"Title SEO:\s*(.+?)(?:\s*\(\d+\s*car\.\)|$| · Meta)", blob)
        if m and not title_seo:
            title_seo = m.group(1).strip()
        m2 = re.search(r"Meta descripci[oó]n:\s*(.+?)(?:\s*\(\d+\s*car\.\)|$)", blob)
        if m2 and not meta_desc:
            meta_desc = m2.group(1).strip()
    return title_seo, meta_desc


def linkify_enlaces(text):
    """'Enlaces internos sugeridos: Pie diabético · Uña encarnada · K-Laser CUBE 4'
    -> párrafo con hipervínculos reales cuando el slug es conocido."""
    label_match = re.match(r"(Enlaces internos(?: sugeridos)?:)\s*(.+)", text, re.I)
    if not label_match:
        return f"<p>{text}</p>"
    label, rest = label_match.groups()
    items = [x.strip() for x in rest.split("·")]
    rendered = []
    for item in items:
        slug = NAME_TO_SLUG.get(item.lower())
        if slug:
            rendered.append(f'<a href="{slug}">{item}</a>')
        else:
            rendered.append(item)
    return f'<p><strong>{label}</strong> ' + " · ".join(rendered) + "</p>"


def render_body(start, end, h1):
    """Renderiza el rango [start,end) a HTML, con reglas especiales para
    FAQ, callouts ('Punto clave:'), y bloque de referencias."""
    blocks = []
    faqs = []
    refs = []
    in_refs = False
    i = start
    title_consumed = False
    list_buffer = []

    def flush_list():
        nonlocal list_buffer
        if list_buffer:
            blocks.append("<ul>" + "".join(f"<li>{x}</li>" for x in list_buffer) + "</ul>")
            list_buffer = []

    while i < end:
        style, text = PARAS[i]
        if not text:
            i += 1
            continue
        # Fin de contenido real: lo que sigue es el bloque JSON-LD de
        # referencia del documento — no se renderiza como texto de página.
        # A veces viene pegado sin salto de línea al párrafo anterior
        # (p.ej. "...en niñosSchema JSON-LD sugerido...").
        m_schema = re.search(r"schema json-ld", text, re.I)
        if m_schema:
            prefix = text[: m_schema.start()].strip()
            if prefix and re.match(r"^enlaces internos", prefix, re.I):
                flush_list()
                blocks.append(linkify_enlaces(prefix))
            elif prefix:
                flush_list()
                blocks.append(f"<p>{prefix}</p>")
            break
        # Párrafos triviales (un solo punto, guión suelto, etc.)
        if re.fullmatch(r"[.\-–—\s]{1,2}", text):
            i += 1
            continue
        if is_skip(text):
            i += 1
            continue
        if re.match(r"^preguntas frecuentes$", text, re.I):
            i += 1
            continue
        # Título ya usado como H1: si el primer Heading2 repite el h1, lo saltamos
        if style == "Heading 2" and not title_consumed and text.strip().split(" (")[0][:12].lower() == h1.split(" (")[0][:12].lower():
            title_consumed = True
            i += 1
            continue
        title_consumed = True

        if re.match(r"^(respaldo científico|referencias)[:]?\s*$", text, re.I):
            flush_list()
            in_refs = True
            i += 1
            continue

        if in_refs:
            refs.append(text)
            i += 1
            continue

        if re.match(r"^enlaces internos", text, re.I):
            flush_list()
            blocks.append(linkify_enlaces(text))
            i += 1
            continue

        if re.match(r"^punto clave:", text, re.I):
            flush_list()
            rest = re.sub(r"^punto clave:\s*", "", text, flags=re.I)
            blocks.append(f'<div class="callout"><strong>Punto clave:</strong> {rest}</div>')
            i += 1
            continue

        if re.match(r"^nota de rigor:", text, re.I):
            flush_list()
            rest = re.sub(r"^nota de rigor:\s*", "", text, flags=re.I)
            blocks.append(f'<div class="callout"><strong>Nota de rigor:</strong> {rest}</div>')
            i += 1
            continue

        if style == "Heading 2":
            flush_list()
            # A veces "Preguntas frecuentes" queda pegado sin espacio al
            # encabezado anterior por un salto de línea perdido en el docx.
            clean = re.sub(r"\s*Preguntas frecuentes$", "", text).strip()
            if clean:
                blocks.append(f"<h2>{clean}</h2>")
            i += 1
            continue

        if style == "List Paragraph":
            list_buffer.append(text)
            i += 1
            continue

        # Preguntas frecuentes: un párrafo normal que termina en "?" —
        # con respuesta en la misma línea o en la línea siguiente.
        if "?" in text:
            flush_list()
            qmatch = re.match(r"^(.*?\?)\s*(.+)$", text)
            if qmatch and qmatch.group(2) and len(qmatch.group(2)) > 3:
                faqs.append((qmatch.group(1).strip(), qmatch.group(2).strip()))
                i += 1
                continue
            question = text
            answer = ""
            if i + 1 < end:
                s3, t3 = PARAS[i + 1]
                if (
                    t3
                    and s3 != "Heading 2"
                    and not is_skip(t3)
                    and not t3.endswith("?")
                    and not re.match(r"^(respaldo|referencias|schema)", t3, re.I)
                ):
                    answer = t3
                    i += 1
            faqs.append((question, answer))
            i += 1
            continue

        flush_list()
        blocks.append(f"<p>{text}</p>")
        i += 1

    flush_list()

    faq_html = ""
    if faqs:
        items = "".join(
            f'<details class="faq-item"><summary>{q}</summary><p>{a}</p></details>'
            for q, a in faqs if a
        )
        if items:
            faq_html = f'<section class="bg-alt"><div class="container" data-animate><h2>Preguntas frecuentes</h2><div class="faq-list">{items}</div></div></section>'

    refs_html = ""
    if refs:
        items = "".join(f"<li>{r}</li>" for r in refs)
        refs_html = f'<section><div class="container" data-animate><h2>Respaldo científico</h2><ul style="font-size:.92rem; color:#4a3f5c;">{items}</ul></div></section>'

    main_html = f'<section><div class="container" data-animate>{"".join(blocks)}</div></section>'
    return main_html + faq_html + refs_html, faqs


def build_page(key, slug, h1, start, end, cat_label, cat_url):
    title_seo, meta_desc = extract_meta(start, end)
    body_main, faqs = render_body(start, end, h1)

    crumbs = [("Inicio", "/"), (cat_label, cat_url), (h1.split(" (")[0], None)]
    breadcrumb = breadcrumb_html(crumbs)

    msg = f"Hola, quiero consultar sobre {h1.split('(')[0].strip()}."
    hero = f"""
    <section style="padding-top:1.5rem;">
      <div class="container" data-animate>
        <h1>{h1}</h1>
        <div class="btn-row">
          <a class="btn btn-primary" href="/contactenos/?servicio={key}">Agendar valoración</a>
          <a class="btn btn-whatsapp" href="{wa_link(msg)}" target="_blank" rel="noopener">Preguntar por WhatsApp</a>
        </div>
      </div>
    </section>
    """

    graph = [{
        "@type": "MedicalWebPage",
        "url": DOMINIO + slug,
        "name": h1,
        "specialty": cat_label,
    }]
    if faqs:
        graph.append({
            "@type": "FAQPage",
            "mainEntity": [
                {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
                for q, a in faqs if a
            ],
        })
    full_crumbs = [(label, url or slug) for label, url in crumbs]
    graph.append(breadcrumb_schema(full_crumbs))

    schema = ld_json(graph)

    body = breadcrumb + hero + body_main + closing_cta(key, h1, msg)
    html = page(
        slug=slug,
        title=(title_seo or h1) + " | Clínica Angular CR",
        description=meta_desc or f"{h1} — Clínica Angular, San José, Costa Rica.",
        body_html=body,
        schema_json=schema,
        active_path="",
    )
    write_page(slug, html)
    return key, slug, h1, len(faqs)


def crumbs_for_schema(crumbs):
    out = []
    for label, url in crumbs:
        out.append((label, url or ""))
    # fix last item: use real absolute slug (needs caller context); simplified: keep as-is
    return [(l, u) for l, u in out if u]


def closing_cta(key, h1, msg):
    return f"""
    <section class="brand-strip text-center" data-animate>
      <div class="container">
        <h2>¿Avanzamos con tu valoración?</h2>
        <div class="btn-row" style="justify-content:center;">
          <a class="btn btn-primary" style="background:#fff; color:var(--color-primary-dark);" href="/contactenos/?servicio={key}">Agendar cita</a>
          <a class="btn btn-whatsapp" href="{wa_link(msg)}" target="_blank" rel="noopener">WhatsApp: +506 8305-6444</a>
        </div>
      </div>
    </section>
    """


if __name__ == "__main__":
    results = []
    for spec in PAGES:
        res = build_page(*spec)
        results.append(res)
        print(f"OK {res[1]:40s} faqs={res[3]}")
    print(f"\nTotal páginas de servicio generadas: {len(results)}")
