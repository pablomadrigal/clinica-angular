@echo off
REM Sirve la carpeta site/ en http://localhost:3000
where npx >nul 2>nul
if %ERRORLEVEL% == 0 (
  echo Iniciando con "serve" ^(Node^) en http://localhost:3000 ...
  npx --yes serve site -l 3000
  goto :eof
)
where python >nul 2>nul
if %ERRORLEVEL% == 0 (
  echo Node/npx no encontrado. Iniciando con Python en http://localhost:3000 ...
  cd site
  python -m http.server 3000
  goto :eof
)
echo No se encontro ni Node (npx) ni Python instalado. Instala uno de los dos.
pause
