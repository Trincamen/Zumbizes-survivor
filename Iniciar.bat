@echo off
cd /d "%~dp0"
if exist cloudflared.exe (
  echo Modo TUNEL: copie o link https://...trycloudflare.com da janela que vai abrir e passe para os outros PCs.
  start "TUNEL - copie o link trycloudflare" cloudflared.exe tunnel --url http://localhost:8080
)
powershell -NoProfile -ExecutionPolicy Bypass -File servidor.ps1
pause
