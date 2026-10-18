@echo off
REM ============================================================
REM  Roda os testes automatizados do back-end (inclui SegurancaTest).
REM  Dois cliques. Resultado na tela e em test.log.
REM ============================================================
cd /d "%~dp0"
REM Se a pasta .mvn sumir (ex.: pasta apagada e restaurada), recria a configuracao do Maven Wrapper.
if not exist ".mvn\wrapper\maven-wrapper.properties" (
  mkdir ".mvn\wrapper" 2>nul
  > ".mvn\wrapper\maven-wrapper.properties" (
    echo wrapperVersion=3.3.4
    echo distributionType=only-script
    echo distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.11/apache-maven-3.9.11-bin.zip
  )
)
title Meio a Meio - testes do back-end

set "JAVA_HOME="
for /d %%D in ("%ProgramFiles%\Eclipse Adoptium\jdk-21*") do set "JAVA_HOME=%%~fD"
if not defined JAVA_HOME (
  echo  [ERRO] Java 21 nao encontrado. Instale com:  winget install --id EclipseAdoptium.Temurin.21.JDK --exact
  pause
  exit /b 1
)
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo.
echo  Rodando os testes... (a primeira vez baixa as dependencias e demora)
echo.
powershell -NoProfile -Command "$env:JAVA_HOME='%JAVA_HOME%'; & '.\mvnw.cmd' -B test 2>&1 | ForEach-Object { \"$_\" } | Tee-Object -FilePath 'test.log'"
echo.
echo  Terminou. Procure "BUILD SUCCESS" ou "BUILD FAILURE" acima. O Claude le o test.log.
pause
