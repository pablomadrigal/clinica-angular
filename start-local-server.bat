@echo off
REM Clinica Angular - servidor local para probar el sitio ANTES de desplegarlo.
REM
REM Por que necesitas esto? Porque abrir site\index.html haciendo doble clic
REM (protocolo file://) hace que el navegador NO pueda cargar correctamente
REM las rutas absolutas de CSS/JS/imagenes (/assets/...), y la pagina se ve
REM rota o sin estilos. Un servidor local resuelve eso en segundos.
REM
REM Uso: doble clic en este archivo, o ejecutar start-local-server.bat
REM Luego abri en el navegador: http://localhost:3000 (o el puerto indicado)

cd /d "%~dp0"

where npx >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo Iniciando servidor con npx serve en el puerto 3000...
    npx --yes serve site -l 3000
    goto :eof
)

where python >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo Node/npm no encontrado. Iniciando servidor con Python en el puerto 8000...
    cd site
    python -m http.server 8000
    goto :eof
)

echo No se encontro Node ni Python en este sistema.
echo Instala Node.js (https://nodejs.org) o Python (https://python.org) y volve a intentar.
pause
