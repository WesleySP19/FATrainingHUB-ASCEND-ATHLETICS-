@echo off
title Ascend Athletics - FA Training Hub
color 0B

echo =======================================================
echo          ASCEND ATHLETICS - INICIANDO SISTEMA
echo =======================================================
echo.

:: Força o uso do Node.js v22 e binários locais
set PATH=%USERPROFILE%\node22\node-v22.14.0-win-x64;%~dp0node_modules\.bin;%PATH%

echo [1/4] Preparando Ambiente e limpando processos antigos...
taskkill /F /IM node.exe >nul 2>&1


echo [2/4] Sincronizando Banco de Dados SQLite...
call npx.cmd prisma generate >nul 2>&1
call npx.cmd prisma db push >nul 2>&1

echo.
echo [3/4] Verificando Integridade do Codigo...
echo [4/4] Ligando Servidor Next.js (Porta 3000)...
echo.
echo =======================================================
echo  O SISTEMA ESTA ONLINE. NAO FECHE ESTA JANELA PRETA.
echo =======================================================
echo.

:: Inicia o App Router limpo
call npm.cmd run dev
