# HRMS Docker Startup Script
# This script starts all HRMS services in the correct order

Write-Host "🚀 Starting HRMS Application..." -ForegroundColor Cyan
Write-Host ""

# Function to check if a container is healthy
function Test-ContainerHealth {
    param([string]$ContainerName)
    $health = docker inspect --format='{{.State.Health.Status}}' $ContainerName 2>$null
    return $health -eq "healthy"
}

# Function to wait for container to be healthy
function Wait-ForHealthy {
    param(
        [string]$ContainerName,
        [int]$TimeoutSeconds = 60
    )
    
    Write-Host "⏳ Waiting for $ContainerName to be healthy..." -ForegroundColor Yellow
    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        if (Test-ContainerHealth $ContainerName) {
            Write-Host "✅ $ContainerName is healthy!" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 2
        $elapsed += 2
        Write-Host "." -NoNewline
    }
    Write-Host ""
    Write-Host "⚠️  $ContainerName did not become healthy in time" -ForegroundColor Red
    return $false
}

try {
    # Step 1: Start infrastructure services
    Write-Host "📦 Step 1/3: Starting infrastructure services..." -ForegroundColor Cyan
    docker compose up -d postgres redis minio meilisearch ai-service
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start infrastructure services"
    }
    
    Write-Host ""
    
    # Step 2: Wait for infrastructure to be healthy
    Write-Host "📦 Step 2/3: Waiting for infrastructure to be ready..." -ForegroundColor Cyan
    $services = @("hrms-postgres", "hrms-redis", "hrms-minio", "hrms-meilisearch", "hrms-ai-service")
    
    foreach ($service in $services) {
        if (-not (Wait-ForHealthy $service 90)) {
            Write-Host "⚠️  Warning: $service is not healthy, but continuing..." -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    
    # Step 3: Start application services
    Write-Host "📦 Step 3/3: Starting application services..." -ForegroundColor Cyan
    
    # Start API Gateway
    Write-Host "Starting API Gateway..." -ForegroundColor Yellow
    docker compose up -d api-gateway
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start API Gateway"
    }
    
    # Wait a bit for API Gateway to start
    Start-Sleep -Seconds 15
    
    # Start Web
    Write-Host "Starting Web Frontend..." -ForegroundColor Yellow
    docker compose up -d web
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start Web frontend"
    }
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "✅ HRMS Application Started Successfully!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Access URLs:" -ForegroundColor Cyan
    Write-Host "   • Frontend:     http://localhost:3000" -ForegroundColor White
    Write-Host "   • API Gateway:  http://localhost:4000" -ForegroundColor White
    Write-Host "   • AI Service:   http://localhost:8000/docs" -ForegroundColor White
    Write-Host "   • MinIO:        http://localhost:9001" -ForegroundColor White
    Write-Host "   • Meilisearch:  http://localhost:7700" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Check status: docker ps" -ForegroundColor Cyan
    Write-Host "📋 View logs:    docker compose logs -f" -ForegroundColor Cyan
    Write-Host "🛑 Stop all:     docker compose down" -ForegroundColor Cyan
    Write-Host ""
    
    # Show container status
    Write-Host "Current Status:" -ForegroundColor Cyan
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String "hrms"
    
} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check Docker is running: docker ps" -ForegroundColor White
    Write-Host "   2. View logs: docker compose logs" -ForegroundColor White
    Write-Host "   3. Clean restart: docker compose down && docker compose up -d" -ForegroundColor White
    exit 1
}
