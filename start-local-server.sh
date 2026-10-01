#!/usr/bin/env bash
# Sirve la carpeta site/ en http://localhost:3000
# Uso: ./start-local-server.sh
set -e
cd "$(dirname "$0")"

if command -v npx >/dev/null 2>&1; then
  echo "Iniciando con 'serve' (Node) en http://localhost:3000 ..."
  npx --yes serve site -l 3000
elif command -v python3 >/dev/null 2>&1; then
  echo "Node/npx no encontrado. Iniciando con Python en http://localhost:3000 ..."
  cd site && python3 -m http.server 3000
else
  echo "No se encontró ni Node (npx) ni Python 3 instalado. Instalá uno de los dos para servir el sitio localmente."
  exit 1
fi
