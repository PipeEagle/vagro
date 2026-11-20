# AgroGestion - Script de arranque (PowerShell)
# Ejecuta este archivo para iniciar el servidor backend.

$ErrorActionPreference = "Stop"
$backendDir = "$PSScriptRoot\backend"

Write-Host "=== AgroGestion - Iniciando servidor ===" -ForegroundColor Cyan

# 1. Verificar que exista el entorno virtual
$venv = "$backendDir\.venv"
if (-not (Test-Path -LiteralPath "$venv\Scripts\Activate.ps1")) {
    Write-Host "Creando entorno virtual..." -ForegroundColor Yellow
    python -m venv $venv
}

# 2. Instalar dependencias
Write-Host "Instalando dependencias..." -ForegroundColor Yellow
& "$venv\Scripts\python.exe" -m pip install -r "$backendDir\requirements.txt"

# 3. Activar entorno virtual y ejecutar Flask
Write-Host "Activando entorno virtual e iniciando Flask..." -ForegroundColor Green
Write-Host "El servidor estara disponible en: http://127.0.0.1:5000" -ForegroundColor Green
Write-Host "Presiona Ctrl+C para detener." -ForegroundColor Gray
Write-Host ""

& "$venv\Scripts\python.exe" "$backendDir\run.py"
