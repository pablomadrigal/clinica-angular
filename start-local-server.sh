#!/bin/bash
# Clínica Angular — servidor local para probar el sitio ANTES de desplegarlo.
#
# ¿Por qué necesitas esto? Porque abrir site/index.html directamente con
# doble clic (protocolo file://) hace que el navegador NO pueda cargar
# correctamente las rutas absolutas de CSS/JS/imágenes (/assets/...), y la
# página se ve rota o sin estilos. Un servidor local resuelve eso en segundos.
#
# Uso:
#   chmod +x start-local-server.sh   (solo la primera vez)
#   ./start-local-server.sh
#
# Luego abrí en el navegador: http://localhost:3000  (o el puerto que se indique)

set -e
cd "$(dirname "$0")"

if command -v npx >/dev/null 2>&1; then
    echo "Iniciando servidor con npx serve en el puerto 3000..."
    npx --yes serve site -l 3000
elif command -v python3 >/dev/null 2>&1; then
    echo "Node/npm no encontrado. Iniciando servidor con Python en el puerto 8000..."
    cd site && python3 -m http.server 8000
elif command -v python >/dev/null 2>&1; then
    echo "Node/npm no encontrado. Iniciando servidor con Python en el puerto 8000..."
    cd site && python -m http.server 8000
else
    echo "No se encontró Node ni Python en este sistema."
    echo "Instalá Node.js (https://nodejs.org) o Python (https://python.org) y volvé a intentar."
    exit 1
fi
