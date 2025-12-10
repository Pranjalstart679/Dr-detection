# DR Detection ML Service Start Script
# This script sets up and starts the ML service

Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "🚀 DR Detection - ML Service Startup" -ForegroundColor Green
Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-Not (Test-Path "venv")) {
    Write-Host "📦 Virtual environment not found. Creating..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
        Write-Host "Make sure Python 3.9+ is installed: python --version" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "🔄 Activating virtual environment..." -ForegroundColor Cyan
& "venv\Scripts\Activate.ps1"

# Check if dependencies are installed
$needsInstall = $false
if (-Not (Test-Path "venv\Lib\site-packages\fastapi")) {
    $needsInstall = $true
}

if ($needsInstall) {
    Write-Host "📥 Installing dependencies (this may take 5-10 minutes)..." -ForegroundColor Yellow
    pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Check if model file exists
if (-Not (Test-Path "best_inceptionv3_finetuned_S_93.h5")) {
    Write-Host "❌ Model file not found: best_inceptionv3_finetuned_S_93.h5" -ForegroundColor Red
    Write-Host "Please copy your trained model to this directory:" -ForegroundColor Yellow
    Write-Host "   $PWD" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Model file found" -ForegroundColor Green

# Start the service
Write-Host ""
Write-Host "🚀 Starting ML Service..." -ForegroundColor Green
Write-Host "   URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

python app.py
