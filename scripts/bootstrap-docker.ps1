# PowerShell Bootstrap Script for Windows
# Run this script to set up and start the NovaPeople HRMS stack

$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-Host "================================================================" -ForegroundColor Blue
Write-Host "      NovaPeople HRMS - Docker Bootstrap Script" -ForegroundColor Blue
Write-Host "================================================================" -ForegroundColor Blue
Write-Host ""

# Check Docker installation
Write-Host "🔍 Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-ColorOutput Green "✅ Docker found: $dockerVersion"
} catch {
    Write-ColorOutput Red "❌ Docker is not installed or not in PATH"
    Write-ColorOutput Red "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
}

# Check Docker Compose
Write-Host "`n🔍 Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker compose version
    Write-ColorOutput Green "✅ Docker Compose found: $composeVersion"
    $useCompose = "docker compose"
} catch {
    try {
        $composeVersion = docker-compose --version
        Write-ColorOutput Green "✅ docker-compose found: $composeVersion"
        $useCompose = "docker-compose"
    } catch {
        Write-ColorOutput Red "❌ Docker Compose is not installed"
        exit 1
    }
}

# Check if Docker is running
Write-Host "`n🔍 Checking if Docker daemon is running..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-ColorOutput Green "✅ Docker daemon is running"
} catch {
    Write-ColorOutput Red "❌ Docker daemon is not running"
    Write-ColorOutput Red "Please start Docker Desktop"
    exit 1
}

# Set project root
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ComposeFile = Join-Path $ProjectRoot "docker-compose.yml"
$EnvFile = Join-Path $ProjectRoot ".env"
$EnvExampleFile = Join-Path $ProjectRoot ".env.example"

# Check and create .env file
Write-Host "`n📝 Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path $EnvFile)) {
    if (Test-Path $EnvExampleFile) {
        Write-ColorOutput Yellow "⚠️  .env file not found. Copying from .env.example..."
        Copy-Item $EnvExampleFile $EnvFile
        Write-ColorOutput Green "✅ .env file created"
        Write-ColorOutput Yellow "⚠️  Please update .env file with your configuration before continuing"
        Write-Host "`nPress any key to open .env file in notepad..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        notepad $EnvFile
        Write-Host "`nPress any key to continue after updating .env file..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-ColorOutput Red "❌ .env.example file not found"
        exit 1
    }
} else {
    Write-ColorOutput Green "✅ .env file exists"
}

# Change to project root
Set-Location $ProjectRoot

Write-Host "`n================================================================" -ForegroundColor Blue
Write-Host "      Starting NovaPeople HRMS Services" -ForegroundColor Blue
Write-Host "================================================================" -ForegroundColor Blue

# Pull latest images
Write-Host "`n🔄 Pulling latest images..." -ForegroundColor Yellow
if ($useCompose -eq "docker compose") {
    docker compose -f $ComposeFile pull
} else {
    docker-compose -f $ComposeFile pull
}

# Build application images
Write-Host "`n🔨 Building application images..." -ForegroundColor Yellow
if ($useCompose -eq "docker compose") {
    docker compose -f $ComposeFile build
} else {
    docker-compose -f $ComposeFile build
}

# Start services
Write-Host "`n🚀 Starting services..." -ForegroundColor Yellow
if ($useCompose -eq "docker compose") {
    docker compose -f $ComposeFile up -d
} else {
    docker-compose -f $ComposeFile up -d
}

# Wait for services
Write-Host "`n⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host "`n🏥 Checking service health..." -ForegroundColor Yellow
if ($useCompose -eq "docker compose") {
    docker compose -f $ComposeFile ps
} else {
    docker-compose -f $ComposeFile ps
}

# Success message
Write-Host "`n================================================================" -ForegroundColor Green
Write-Host "      ✅ Services Started Successfully!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green

Write-Host "`n🌐 Web Services:" -ForegroundColor Blue
Write-Host "  📊 Dashboard:          http://localhost:3000" -ForegroundColor Cyan
Write-Host "  🔌 API Gateway:        http://localhost:4000" -ForegroundColor Cyan
Write-Host "  🤖 AI Service:         http://localhost:8000" -ForegroundColor Cyan

Write-Host "`n🔧 Infrastructure Services:" -ForegroundColor Blue
Write-Host "  🐘 PostgreSQL:         localhost:5432" -ForegroundColor Cyan
Write-Host "  🔴 Redis:              localhost:6379" -ForegroundColor Cyan
Write-Host "  📦 MinIO:              http://localhost:9000" -ForegroundColor Cyan
Write-Host "     Console:            http://localhost:9001" -ForegroundColor Cyan
Write-Host "  🔍 Meilisearch:        http://localhost:7700" -ForegroundColor Cyan

Write-Host "`n📝 Useful Commands:" -ForegroundColor Yellow
Write-Host "  View logs:             $useCompose -f docker-compose.yml logs -f" -ForegroundColor Gray
Write-Host "  View logs (service):   $useCompose -f docker-compose.yml logs -f <service>" -ForegroundColor Gray
Write-Host "  Stop services:         $useCompose -f docker-compose.yml down" -ForegroundColor Gray
Write-Host "  Restart services:      $useCompose -f docker-compose.yml restart" -ForegroundColor Gray
Write-Host "  Check status:          $useCompose -f docker-compose.yml ps" -ForegroundColor Gray

Write-Host "`n================================================================" -ForegroundColor Green
Write-Host ""

# Ask if user wants to view logs
$viewLogs = Read-Host "Would you like to view live logs? (y/n)"
if ($viewLogs -eq "y" -or $viewLogs -eq "Y") {
    Write-Host "`nShowing live logs (Press Ctrl+C to exit)..." -ForegroundColor Yellow
    if ($useCompose -eq "docker compose") {
        docker compose -f $ComposeFile logs -f
    } else {
        docker-compose -f $ComposeFile logs -f
    }
}
