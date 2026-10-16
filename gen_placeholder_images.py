# -*- coding: utf-8 -*-
"""Genera placeholders SVG de marca (no stock, no IA) para las imágenes
referenciadas en el sitio, mientras Clínica Angular sustituye cada una
por fotografía real propia (requisito explícito del proyecto: nada de
fotos genéricas de stock ni generadas por IA en el sitio final)."""
import os

PRIMARY = "#5b3a8f"
PRIMARY_DARK = "#3c2763"
GOLD = "#c9a24b"
LIGHT = "#f4eff9"

IMAGES = [
    ("hero-equipo.svg", 1600, 900, "Equipo clínico — foto real pendiente"),
    ("fachada.svg", 1200, 900, "Fachada de la clínica — foto real pendiente"),
    ("equipo-grupo.svg", 900, 700, "Equipo multidisciplinario — foto real pendiente"),
    ("instalaciones-plano.svg", 900, 700, "Plano de instalaciones — foto real pendiente"),
    ("pie-diabetico-card.svg", 640, 420, "Pie diabético"),
    ("heridas-card.svg", 640, 420, "Tratamiento de heridas"),
    ("klaser-card.svg", 640, 420, "K-Laser CUBE 4"),
    ("onicomicosis-card.svg", 640, 420, "Hongos en las uñas"),
    ("og-default.svg", 1200, 630, "Clínica Angular"),
]


def svg(w, h, label):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{PRIMARY}"/>
      <stop offset="1" stop-color="{PRIMARY_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#g)"/>
  <circle cx="{w*0.82:.0f}" cy="{h*0.18:.0f}" r="{min(w,h)*0.22:.0f}" fill="{GOLD}" opacity="0.18"/>
  <circle cx="{w*0.12:.0f}" cy="{h*0.85:.0f}" r="{min(w,h)*0.28:.0f}" fill="{LIGHT}" opacity="0.10"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, serif" font-size="{max(16, min(w,h)*0.055):.0f}" fill="#ffffff" opacity="0.92">{label}</text>
  <text x="50%" y="{h*0.5 + max(16,min(w,h)*0.09):.0f}" text-anchor="middle" font-family="Arial, sans-serif" font-size="{max(11, min(w,h)*0.028):.0f}" fill="{GOLD}">Clínica Angular</text>
</svg>"""


if __name__ == "__main__":
    os.makedirs("site/assets/img", exist_ok=True)
    for name, w, h, label in IMAGES:
        with open(f"site/assets/img/{name}", "w", encoding="utf-8") as f:
            f.write(svg(w, h, label))
        print("OK", name)
