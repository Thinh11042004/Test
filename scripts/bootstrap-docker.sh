#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Docker installation
if ! command -v docker >/dev/null 2>&1; then
  echo -e "${RED}❌ Docker is required. Please install Docker Desktop or Docker Engine before continuing.${NC}" >&2
  exit 1
fi

# Detect Docker Compose command
if docker compose version >/dev/null 2>&1; then
  COMPOSE_BIN=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_BIN=(docker-compose)
else
  echo -e "${RED}❌ Docker Compose plugin (docker compose) or the docker-compose binary is required.${NC}" >&2
  exit 1
fi

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
ENV_FILE="$PROJECT_ROOT/.env"

# Check if .env file exists, if not copy from .env.example
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}⚠️  .env file not found. Copying from .env.example...${NC}"
  cp "$PROJECT_ROOT/.env.example" "$ENV_FILE"
  echo -e "${GREEN}✅ .env file created. Please update it with your configuration.${NC}"
fi

echo -e "${BLUE}📦 Bootstrapping NovaPeople HRMS stack...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Pull latest images
echo -e "\n${YELLOW}🔄 Pulling latest images...${NC}"
"${COMPOSE_BIN[@]}" -f "$COMPOSE_FILE" pull

# Build application images
echo -e "\n${YELLOW}🔨 Building application images...${NC}"
"${COMPOSE_BIN[@]}" -f "$COMPOSE_FILE" build

# Start services
echo -e "\n${YELLOW}🚀 Starting services...${NC}"
"${COMPOSE_BIN[@]}" -f "$COMPOSE_FILE" up -d

# Wait for services to be healthy
echo -e "\n${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Check service health
echo -e "\n${BLUE}🏥 Checking service health...${NC}"
"${COMPOSE_BIN[@]}" -f "$COMPOSE_FILE" ps

cat <<MSG

${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
${GREEN}✅ Services are starting in the background!${NC}
${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

${BLUE}🌐 Web Services:${NC}
  📊 Dashboard:          http://localhost:3000
  🔌 API Gateway:        http://localhost:4000
  🤖 AI Service:         http://localhost:8000

${BLUE}🔧 Infrastructure Services:${NC}
  🐘 PostgreSQL:         localhost:5432
  🔴 Redis:              localhost:6379
  📦 MinIO:              http://localhost:9000 (Console: http://localhost:9001)
  🔍 Meilisearch:        http://localhost:7700

${YELLOW}📝 Useful Commands:${NC}
  View logs:             ${COMPOSE_BIN[*]} -f $COMPOSE_FILE logs -f
  View logs (service):   ${COMPOSE_BIN[*]} -f $COMPOSE_FILE logs -f <service-name>
  Stop services:         ${COMPOSE_BIN[*]} -f $COMPOSE_FILE down
  Restart services:      ${COMPOSE_BIN[*]} -f $COMPOSE_FILE restart
  Check status:          ${COMPOSE_BIN[*]} -f $COMPOSE_FILE ps

${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

MSG