@echo off
REM ============================================================
REM  Sobe o app web (React + Tailwind) do Meio a Meio do Carlinho.
REM  Dois cliques neste arquivo, com o back-end ja rodando.
REM  - Se faltar dependencia, roda npm install e salva tudo em install.log
REM  - Depois abre o servidor de desenvolvimento e salva tudo em web.log
REM ============================================================
cd /d "%~dp0"
title Meio a Meio - app web

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo  [ERRO] Node.js nao encontrado. Instale com:  winget install OpenJS.NodeJS.LTS
  echo.
  pause
  exit /b 1
)

REM O npm so cria node_modules\.bin no FIM da instalacao.
REM Se esse atalho nao existe, a instalacao anterior parou no meio: roda de novo.
if not exist "node_modules\.bin\vite.cmd" (
  echo.
  echo  Instalando dependencias. Leva de 1 a 3 minutos. Nao feche esta janela.
  echo.
  powershell -NoProfile -Command "& node -v 2>&1 | ForEach-Object { \"node $_\" } | Tee-Object -FilePath 'install.log'; & npm.cmd -v 2>&1 | ForEach-Object { \"npm $_\" } | Tee-Object -FilePath 'install.log' -Append; & npm.cmd install --no-fund --no-audit 2>&1 | ForEach-Object { \"$_\" } | Tee-Object -FilePath 'install.log' -Append"
)

if not exist "node_modules\.bin\vite.cmd" (
  echo.
  echo  [ERRO] A instalacao nao terminou. Avise o Claude: ele le o arquivo install.log.
  echo.
  pause
  exit /b 1
)

powershell -NoProfile -Command "& node scripts\verificar-instalacao.cjs 2>&1 | ForEach-Object { \"$_\" } | Tee-Object -FilePath 'install-check.log'; exit $LASTEXITCODE"
if errorlevel 1 (
  echo.
  echo  [ERRO] A instalacao esta incompleta. De dois cliques em reinstalar.cmd.
  echo.
  pause
  exit /b 1
)

echo.
echo  Subindo o app. Quando aparecer "Local: http://localhost:....", abra esse endereco.
echo  Se a versao antiga, da pasta frontend, estiver aberta, feche a janela dela antes.
echo  Para parar: feche esta janela ou aperte Ctrl+C.
echo.

powershell -NoProfile -Command "& npm.cmd run dev 2>&1 | ForEach-Object { \"$_\" } | Tee-Object -FilePath 'web.log'"

echo.
echo  O app parou. Se foi erro, avise o Claude: ele le o arquivo web.log.
pause
