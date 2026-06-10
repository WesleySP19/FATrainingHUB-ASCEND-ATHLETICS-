@echo off
title FA Training Hub - Motor Full-Stack
color 0A

echo =======================================================
echo          FA TRAINING HUB - INICIANDO SISTEMA
echo =======================================================
echo.

:: Força o uso do Node.js v22 (Garante compatibilidade do Prisma ORM no Windows)
set PATH=%USERPROFILE%\node22\node-v22.14.0-win-x64;%PATH%

echo [1/3] Sincronizando Banco de Dados SQLite...
call npx.cmd prisma db push >nul 2>&1

echo.
echo [2/3] Checando Motor de Gamificacao e Contas...
echo [3/3] Ligando Servidor Next.js (porta 3000)...
echo.
echo =======================================================
echo  O SISTEMA ESTA ONLINE. NAO FECHE ESTA JANELA PRETA.
echo =======================================================
echo.

:: Inicia o App Router
call npm.cmd run dev
