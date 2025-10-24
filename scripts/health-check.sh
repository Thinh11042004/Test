#!/bin/bash
# Health Check Script for all services

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          NovaPeople HRMS - Health Check Report           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

check_service() {
    local name=$1
    local url=$2
    local timeout=${3:-5}
    
    echo -ne "Checking ${name}... "
    if curl -sf --max-time $timeout "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ Unhealthy${NC}"
        return 1
    fi
}

check_port() {
    local name=$1
    local host=$2
    local port=$3
    
    echo -ne "Checking ${name}... "
    if nc -z -w5 "$host" "$port" 2>/dev/null; then
        echo -e "${GREEN}✅ Accessible${NC}"
        return 0
    else
        echo -e "${RED}❌ Not accessible${NC}"
        return 1
    fi
}

check_docker_service() {
    local name=$1
    local service=$2
    
    echo -ne "Checking ${name}... "
    if docker compose ps -q "$service" | xargs docker inspect -f '{{.State.Health.Status}}' 2>/dev/null | grep -q "healthy"; then
        echo -e "${GREEN}✅ Healthy${NC}"
        return 0
    elif docker compose ps -q "$service" | xargs docker inspect -f '{{.State.Status}}' 2>/dev/null | grep -q "running"; then
        echo -e "${YELLOW}⚠️  Running (no health check)${NC}"
        return 0
    else
        echo -e "${RED}❌ Not running${NC}"
        return 1
    fi
}

total=0
passed=0

# Check Web Services
echo -e "\n${BLUE}🌐 Web Services:${NC}"
check_service "Web Dashboard" "http://localhost:3000" && ((passed++)) || true
((total++))
check_service "API Gateway" "http://localhost:4000/healthz" && ((passed++)) || true
((total++))
check_service "AI Service" "http://localhost:8000/health" && ((passed++)) || true
((total++))

# Check Infrastructure Services
echo -e "\n${BLUE}🔧 Infrastructure Services:${NC}"
check_port "PostgreSQL" "localhost" 5432 && ((passed++)) || true
((total++))
check_port "Redis" "localhost" 6379 && ((passed++)) || true
((total++))
check_service "MinIO" "http://localhost:9000/minio/health/live" 10 && ((passed++)) || true
((total++))
check_service "Meilisearch" "http://localhost:7700/health" && ((passed++)) || true
((total++))

# Check Docker Container Health
echo -e "\n${BLUE}🐳 Docker Container Status:${NC}"
if command -v docker &> /dev/null && docker compose ps &> /dev/null; then
    check_docker_service "postgres container" "postgres" && ((passed++)) || true
    ((total++))
    check_docker_service "redis container" "redis" && ((passed++)) || true
    ((total++))
    check_docker_service "api-gateway container" "api-gateway" && ((passed++)) || true
    ((total++))
    check_docker_service "web container" "web" && ((passed++)) || true
    ((total++))
fi

# Summary
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Health Summary                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

percentage=$((passed * 100 / total))

if [ $percentage -eq 100 ]; then
    color=$GREEN
    status="All systems operational! 🎉"
elif [ $percentage -ge 70 ]; then
    color=$YELLOW
    status="Some services degraded ⚠️"
else
    color=$RED
    status="Multiple services down! ❌"
fi

echo -e "${color}Status: ${status}${NC}"
echo -e "Passed: ${passed}/${total} (${percentage}%)"
echo ""

if [ $percentage -lt 100 ]; then
    echo -e "${YELLOW}💡 Tip: Check logs with 'docker compose logs -f' or 'make logs'${NC}"
    exit 1
else
    exit 0
fi
