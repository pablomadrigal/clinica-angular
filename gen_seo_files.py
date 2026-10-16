# -*- coding: utf-8 -*-
"""Genera robots.txt, sitemap.xml y llms.txt a partir de las páginas
realmente existentes en site/, para que no queden URLs huérfanas ni
URLs del sitemap que no correspondan a ninguna página real."""
import glob
from datetime import date
from gen_common import DOMINIO

slugs = []
for f in sorted(glob.glob("site/**/index.html", recursive=True)):
    slug = f[len("site"):-len("index.html")]
    if slug == "":
        slug = "/"
    slugs.append(slug)

PRIORITY_HIGH = {"/", "/contactenos/", "/pie-diabetico/", "/heridas-cronicas/"}
TODAY = date.today().isoformat()

# --- sitemap.xml -----------------------------------------------------------
entries = []
for slug in slugs:
    prio = "1.0" if slug == "/" else ("0.9" if slug in PRIORITY_HIGH else "0.7")
    entries.append(
        f"  <url>\n    <loc>{DOMINIO}{slug}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <priority>{prio}</priority>\n  </url>"
    )
sitemap = (
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "\n".join(entries)
    + "\n</urlset>\n"
)
with open("site/sitemap.xml", "w", encoding="utf-8") as f:
    f.write(sitemap)

# --- robots.txt --------------------------------------------------------
robots = f"""User-agent: *
Allow: /

Sitemap: {DOMINIO}/sitemap.xml
"""
with open("site/robots.txt", "w", encoding="utf-8") as f:
    f.write(robots)

# --- llms.txt (AEO/GEO: resumen para motores de IA) -------------------
secciones = {
    "Páginas institucionales": ["/", "/nuestra-clinica/", "/contactenos/", "/instalaciones/"],
    "Especialidades": [s for s in slugs if s.startswith("/especialidades/")],
    "Podología (servicios individuales)": [
        "/hongos-unas-onicomicosis/", "/una-encarnada/", "/verruga-plantar-vph/",
        "/deformidades-dedos-pies/", "/pie-geriatrico/", "/pie-pediatrico/",
        "/traumatismo-de-unas/", "/callos-y-durezas/", "/pies-secos-sudoracion-mal-olor/",
        "/pie-diabetico/",
    ],
    "Heridas y fisioterapia": ["/heridas-cronicas/", "/fisioterapia/", "/fascitis-plantar/", "/biomecanica-plantillas/"],
    "Psicología y medicina general": ["/psicologia-clinica/", "/medicina-general/"],
    "Tecnologías": [s for s in slugs if s in (
        "/tecnologias/", "/k-laser-cube-4/", "/baropodometro/",
        "/desbridamiento-ultrasonico/", "/centrifuga-prp/", "/ozonoterapia-heridas/",
    )],
    "Equipo": ["/nuestros-especialistas/", "/sobre-el-dr-madrigal/"],
    "Contenido y legal": ["/blog/", "/tienda/", "/politica-de-privacidad/", "/terminos/"],
}

lines = [
    "# Clínica Angular — angular.cr",
    "",
    "Clínica Angular es un centro especializado en podología clínica avanzada, pie diabético,",
    "tratamiento avanzado de heridas, fisioterapia, psicología clínica y medicina general,",
    "ubicado en Guadalupe, San José, Costa Rica. Más de 11 años de trayectoria clínica continua.",
    "",
    "Contacto: +(506) 2253-8303 · WhatsApp +(506) 8305-6444 · info@angular.cr",
    "",
]
for titulo, items in secciones.items():
    if not items:
        continue
    lines.append(f"## {titulo}")
    for slug in items:
        lines.append(f"- {DOMINIO}{slug}")
    lines.append("")

with open("site/llms.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print(f"sitemap.xml: {len(slugs)} URLs")
print("robots.txt y llms.txt generados.")
