@echo off
echo ===================================================
echo     FA TRAINING HUB - PRE-GAME SETUP
echo ===================================================
echo.
echo Verificando instalacao de modulos...
call npm install --silent

echo.
echo Iniciando servidor de alta performance (Vite)...
call npm run dev -- --open

pause
