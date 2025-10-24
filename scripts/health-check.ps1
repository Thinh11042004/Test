# PowerShell Health Check Script for Windows

$ErrorActionPreference = "Continue"

function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-Host "================================================================" -ForegroundColor Blue
Write-Host "      NovaPeople HRMS - Health Check Report" -ForegroundColor Blue
Write-Host "================================================================" -ForegroundColor Blue
Write-Host ""

$total = 0
$passed = 0

function Check-Service {
    param(
        [string]$Name,
        [string]$Url,
        [int]$Timeout = 5
    )
    
    Write-Host -NoNewline "Checking $Name... "
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $Timeout -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-ColorOutput Green "✅ Healthy"
            return $true
        }
    } catch {
        Write-ColorOutput Red "❌ Unhealthy"
        return $false
    }
    return $false
}

function Check-Port {
    param(
        [string]$Name,
        [string]$Host,
        [int]$Port
    )
    
    Write-Host -NoNewline "Checking $Name... "
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $connect = $tcpClient.BeginConnect($Host, $Port, $null, $null)
        $wait = $connect.AsyncWaitHandle.WaitOne(5000, $false)
        
        if ($wait) {
            try {
                $tcpClient.EndConnect($connect)
                Write-ColorOutput Green "✅ Accessible"
                return $true
            } catch {
                Write-ColorOutput Red "❌ Not accessible"
                return $false
            }
        } else {
            Write-ColorOutput Red "❌ Timeout"
            return $false
        }
    } catch {
        Write-ColorOutput Red "❌ Error"
        return $false
    } finally {
        if ($tcpClient) {
            $tcpClient.Close()
        }
    }
    return $false
}

function Check-DockerService {
    param(
        [string]$Name,
        [string]$Service
    )
    
    Write-Host -NoNewline "Checking $Name... "
    try {
        $status = docker compose ps -q $Service | ForEach-Object { docker inspect -f '{{.State.Status}}' $_ } 2>$null
        if ($status -eq "running") {
            Write-ColorOutput Green "✅ Running"
            return $true
        } else {
            Write-ColorOutput Red "❌ Not running"
            return $false
        }
    } catch {
        Write-ColorOutput Red "❌ Error checking status"
        return $false
    }
}

# Check Web Services
Write-Host "`n🌐 Web Services:" -ForegroundColor Blue
if (Check-Service "Web Dashboard" "http://localhost:3000") { $passed++ }
$total++

if (Check-Service "API Gateway" "http://localhost:4000/healthz") { $passed++ }
$total++

if (Check-Service "AI Service" "http://localhost:8000/health") { $passed++ }
$total++

# Check Infrastructure Services
Write-Host "`n🔧 Infrastructure Services:" -ForegroundColor Blue
if (Check-Port "PostgreSQL" "localhost" 5432) { $passed++ }
$total++

if (Check-Port "Redis" "localhost" 6379) { $passed++ }
$total++

if (Check-Service "MinIO" "http://localhost:9000/minio/health/live" 10) { $passed++ }
$total++

if (Check-Service "Meilisearch" "http://localhost:7700/health") { $passed++ }
$total++

# Check Docker Container Health
Write-Host "`n🐳 Docker Container Status:" -ForegroundColor Blue
try {
    docker compose ps 2>$null | Out-Null
    
    if (Check-DockerService "postgres container" "postgres") { $passed++ }
    $total++
    
    if (Check-DockerService "redis container" "redis") { $passed++ }
    $total++
    
    if (Check-DockerService "api-gateway container" "api-gateway") { $passed++ }
    $total++
    
    if (Check-DockerService "web container" "web") { $passed++ }
    $total++
} catch {
    Write-ColorOutput Yellow "⚠️  Docker Compose not available"
}

# Summary
Write-Host "`n================================================================" -ForegroundColor Blue
Write-Host "                    Health Summary" -ForegroundColor Blue
Write-Host "================================================================" -ForegroundColor Blue
Write-Host ""

$percentage = [math]::Round(($passed / $total) * 100)

if ($percentage -eq 100) {
    $color = "Green"
    $status = "All systems operational! 🎉"
} elseif ($percentage -ge 70) {
    $color = "Yellow"
    $status = "Some services degraded ⚠️"
} else {
    $color = "Red"
    $status = "Multiple services down! ❌"
}

Write-ColorOutput $color "Status: $status"
Write-Host "Passed: $passed/$total ($percentage%)"
Write-Host ""

if ($percentage -lt 100) {
    Write-ColorOutput Yellow "💡 Tip: Check logs with 'docker compose logs -f' or 'make logs'"
    exit 1
} else {
    exit 0
}
