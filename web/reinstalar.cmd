@echo off
REM ============================================================
REM  Reinstala TODAS as dependencias do zero e sobe o app.
REM  Use quando der erro de "Cannot find module" ou quando uma
REM  instalacao anterior foi interrompida no meio.
REM  Apaga node_modules e package-lock.json (o npm recria os dois).
REM ============================================================
cd /d "%~dp0"
title Meio a Meio - reinstalando dependencias

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo  [ERRO] Node.js nao encontrado. Instale com:  winget install OpenJS.NodeJS.LTS
  echo.
  pause
  exit /b 1
)

echo.
echo  Apagando a instalacao antiga...
if exist node_modules rmdir /s /q node_modules
if exist node_modules (
  echo.
  echo  [ERRO] Nao consegui apagar a pasta node_modules.
  echo  Feche o VS Code e qualquer janela do app web e rode este arquivo de novo.
  echo.
  pause
  exit /b 1
)
if exist package-lock.json del /q package-lock.json

echo.
echo  Instalando tudo de novo. Leva de 1 a 3 minutos.
echo  NAO FECHE ESTA JANELA ate aparecer a mensagem de fim.
echo.
powershell -NoProfile -Command "& node -v 2>&1 | ForEach-Object { \"node $_\" } | Tee-Object -FilePath 'install.log'; & npm.cmd -v 2>&1 | ForEach-Object { \"npm $_\" } | Tee-Object -FilePath 'install.log' -Append; & npm.cmd install --no-fund --no-audit 2>&1 | ForEach-Object { \"$_\" } | Tee-Object -FilePath 'install.log' -Append"

echo.
echo  Conferindo a instalacao...
powershell -NoProfile -Command "& node scripts\verificar-instalacao.cjs 2>&1 | ForEach-Object { \"$_\" } | Tee-Object -FilePath 'install.log' -Append; exit $LASTEXITCODE"
if errorlevel 1 (
  echo.
  echo  [ERRO] A instalacao ficou incompleta de novo. Avise o Claude: ele le o arquivo install.log.
  echo.
  pause
  exit /b 1
)

echo.
echo  Dependencias instaladas e conferidas. Subindo o app...
echo.
call "%~dp0rodar-web.cmd"
