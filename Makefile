.PHONY: help build up down restart logs ps clean health db-backup db-restore

# Default target
help:
	@echo "════════════════════════════════════════════════════════════"
	@echo "  NovaPeople HRMS - Docker Management Commands"
	@echo "════════════════════════════════════════════════════════════"
	@echo ""
	@echo "📦 Setup & Start:"
	@echo "  make up              - Start all services (build if needed)"
	@echo "  make build           - Build all Docker images"
	@echo "  make bootstrap       - Run bootstrap script"
	@echo ""
	@echo "🛑 Stop & Clean:"
	@echo "  make down            - Stop all services"
	@echo "  make down-v          - Stop and remove volumes"
	@echo "  make restart         - Restart all services"
	@echo "  make clean           - Remove all containers, images, and volumes"
	@echo ""
	@echo "📊 Monitoring:"
	@echo "  make logs            - View all logs"
	@echo "  make logs-web        - View web service logs"
	@echo "  make logs-api        - View API gateway logs"
	@echo "  make logs-ai         - View AI service logs"
	@echo "  make ps              - Show service status"
	@echo "  make health          - Check all service health"
	@echo ""
	@echo "🗄️  Database:"
	@echo "  make db-shell        - Open PostgreSQL shell"
	@echo "  make db-backup       - Backup database"
	@echo "  make db-restore      - Restore database"
	@echo "  make db-migrate      - Run Prisma migrations"
	@echo "  make db-seed         - Seed database"
	@echo ""
	@echo "🔧 Development:"
	@echo "  make shell-api       - Open shell in API gateway"
	@echo "  make shell-ai        - Open shell in AI service"
	@echo "  make rebuild-api     - Rebuild API gateway"
	@echo "  make rebuild-web     - Rebuild web service"
	@echo ""
	@echo "🏭 Production:"
	@echo "  make prod-up         - Start production stack"
	@echo "  make prod-down       - Stop production stack"
	@echo ""

# Setup & Start
up:
	docker compose up -d

build:
	docker compose build

bootstrap:
	@if [ "$$OS" = "Windows_NT" ]; then \
		powershell -ExecutionPolicy Bypass -File scripts/bootstrap-docker.ps1; \
	else \
		bash scripts/bootstrap-docker.sh; \
	fi

# Stop & Clean
down:
	docker compose down

down-v:
	docker compose down -v

restart:
	docker compose restart

clean:
	docker compose down -v --rmi all --remove-orphans
	docker system prune -af

# Monitoring
logs:
	docker compose logs -f

logs-web:
	docker compose logs -f web

logs-api:
	docker compose logs -f api-gateway

logs-ai:
	docker compose logs -f ai-service

logs-worker:
	docker compose logs -f worker

ps:
	docker compose ps

health:
	@echo "🏥 Checking service health..."
	@echo ""
	@echo "Web (Dashboard):"
	@curl -sf http://localhost:3000 > /dev/null && echo "  ✅ Healthy" || echo "  ❌ Unhealthy"
	@echo ""
	@echo "API Gateway:"
	@curl -sf http://localhost:4000/healthz > /dev/null && echo "  ✅ Healthy" || echo "  ❌ Unhealthy"
	@echo ""
	@echo "AI Service:"
	@curl -sf http://localhost:8000/health > /dev/null && echo "  ✅ Healthy" || echo "  ❌ Unhealthy"
	@echo ""
	@echo "PostgreSQL:"
	@docker compose exec -T postgres pg_isready -U hrms > /dev/null && echo "  ✅ Healthy" || echo "  ❌ Unhealthy"
	@echo ""
	@echo "Redis:"
	@docker compose exec -T redis redis-cli ping > /dev/null && echo "  ✅ Healthy" || echo "  ❌ Unhealthy"
	@echo ""
	@echo "MinIO:"
	@curl -sf http://localhost:9000/minio/health/live > /dev/null && echo "  ✅ Healthy" || echo "  ❌ Unhealthy"
	@echo ""
	@echo "Meilisearch:"
	@curl -sf http://localhost:7700/health > /dev/null && echo "  ✅ Healthy" || echo "  ❌ Unhealthy"

# Database
db-shell:
	docker compose exec postgres psql -U hrms -d hrms

db-backup:
	@mkdir -p backups
	@echo "📦 Creating database backup..."
	docker compose exec -T postgres pg_dump -U hrms hrms > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "✅ Backup created in backups/ directory"

db-restore:
	@read -p "Enter backup file path: " backup_file; \
	docker compose exec -T postgres psql -U hrms hrms < $$backup_file
	@echo "✅ Database restored"

db-migrate:
	docker compose exec api-gateway npx prisma migrate deploy

db-seed:
	docker compose exec api-gateway npx prisma db seed

db-reset:
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker compose exec api-gateway npx prisma migrate reset --force; \
		echo "✅ Database reset complete"; \
	else \
		echo "❌ Cancelled"; \
	fi

# Development
shell-api:
	docker compose exec api-gateway sh

shell-ai:
	docker compose exec ai-service bash

shell-web:
	docker compose exec web sh

rebuild-api:
	docker compose up -d --build --no-deps api-gateway

rebuild-web:
	docker compose up -d --build --no-deps web

rebuild-ai:
	docker compose up -d --build --no-deps ai-service

# Production
prod-up:
	docker compose -f docker-compose.prod.yml up -d --build

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f

prod-ps:
	docker compose -f docker-compose.prod.yml ps

# Install (create .env if not exists)
install:
	@if [ ! -f .env ]; then \
		echo "📝 Creating .env file from .env.example..."; \
		cp .env.example .env; \
		echo "✅ .env file created. Please update it with your configuration."; \
	else \
		echo "✅ .env file already exists"; \
	fi
