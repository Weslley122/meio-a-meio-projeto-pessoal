@echo off
REM ============================================================
REM  Sobe o back-end do Meio a Meio do Carlinho (Spring Boot).
REM  Basta dar dois cliques neste arquivo.
REM  - Encontra sozinho o Java 21 (Eclipse Temurin) instalado
REM  - Roda o Maven Wrapper (baixa o Maven na primeira vez)
REM  - Mostra tudo na tela e salva uma copia em run.log
REM ============================================================
cd /d "%~dp0"
title Meio a Meio - back-end

set "JAVA_HOME="
for /d %%D in ("%ProgramFiles%\Eclipse Adoptium\jdk-21*") do set "JAVA_HOME=%%~fD"

if not defined JAVA_HOME (
  echo.
  echo  [ERRO] Java 21 nao encontrado em "%ProgramFiles%\Eclipse Adoptium".
  echo  Instale com:  winget install --id EclipseAdoptium.Temurin.21.JDK --exact
  echo.
  pause
  exit /b 1
)

set "PATH=%JAVA_HOME%\bin;%PATH%"
echo.
echo  Java encontrado em: %JAVA_HOME%
echo  Subindo o back-end... (a primeira vez demora alguns minutos)
echo  Quando aparecer "Started MeioAMeioBackendApplication", esta no ar em http://localhost:8080
echo  Para parar o servidor: feche esta janela ou aperte Ctrl+C.
echo.

powershell -NoProfile -Command "$env:JAVA_HOME='%JAVA_HOME%'; & '.\mvnw.cmd' spring-boot:run 2>&1 | ForEach-Object { \"$_\" } | Tee-Object -FilePath 'run.log'"

echo.
echo  O servidor parou. Se foi erro, avise o Claude: ele le o arquivo run.log.
pause
