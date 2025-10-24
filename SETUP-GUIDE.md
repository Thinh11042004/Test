# HRMS Docker Setup Guide

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- At least 20GB of free disk space
- PowerShell (Windows) or Bash (Linux/Mac)

### 1. Start Infrastructure Services

```powershell
# Start all infrastructure services (Postgres, Redis, MinIO, Meilisearch, AI Service)
docker compose up -d postgres redis minio meilisearch ai-service
```

Wait for all services to be healthy (check with `docker ps`).

### 2. Start Application Services

```powershell
# Start API Gateway
docker compose up -d api-gateway

# Wait 30 seconds for API Gateway to be healthy, then start Web
Start-Sleep -Seconds 30
docker compose up -d web
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:4000
- **AI Service**: http://localhost:8000/docs
- **MinIO Console**: http://localhost:9001 (user: devminio, password: devminiosecret)
- **Meilisearch**: http://localhost:7700

## Services Overview

| Service | Port | Description | Health Check |
|---------|------|-------------|--------------|
| postgres | 5432 | PostgreSQL with pgvector | ✅ Healthy |
| redis | 6379 | Redis cache | ✅ Healthy |
| minio | 9000-9001 | Object storage | ✅ Healthy |
| meilisearch | 7700 | Search engine | ✅ Healthy |
| ai-service | 8000 | Python AI service | ✅ Healthy |
| api-gateway | 4000 | Node.js API | ⏳ Starting |
| web | 3000 | React/Vite frontend | ⏳ Starting |

## Troubleshooting

### API Gateway Restart Loop

If the API Gateway keeps restarting, check the logs:

```powershell
docker logs hrms-api-gateway --tail 50
```

**Common Issues:**
1. **Prisma seed error**: This has been fixed in the latest Dockerfile
2. **Employee controller error**: This has been fixed - endpoints now return mock data
3. **Database connection**: Ensure postgres is healthy before starting api-gateway

### Web Frontend CSS Errors

The Tailwind CSS v4 `border-border` error has been fixed. If you see it:

```powershell
# Restart the web container
docker compose restart web
```

### Clean Restart

If you need to start fresh:

```powershell
# Stop all containers
docker compose down

# Remove volumes (⚠️ This will delete all data!)
docker compose down -v

# Rebuild images
docker compose build --no-cache

# Start services
docker compose up -d
```

## Development Workflow

### Making Code Changes

All services use volume mounts for hot-reload:

- **API Gateway**: Changes in `apps/api-gateway/src/` trigger nodemon restart
- **Web**: Changes in `apps/web/src/` trigger Vite HMR
- **AI Service**: Changes in `apps/ai-service/src/` trigger uvicorn reload

### Database Migrations

```powershell
# Run Prisma migrations
docker exec hrms-api-gateway npx prisma migrate dev

# Generate Prisma Client
docker exec hrms-api-gateway npx prisma generate

# Seed database (manual/one-time only)
docker exec hrms-api-gateway node prisma/seed.js
```

### View Logs

```powershell
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f api-gateway
docker compose logs -f web
```

### Stop Services

```powershell
# Stop all services
docker compose down

# Stop specific services
docker compose stop api-gateway web

# Stop and remove everything including volumes
docker compose down -v
```

## Known Issues & Fixes

### ✅ Fixed Issues

1. **Tailwind CSS v4 Configuration**
   - **Issue**: `border-border` unknown utility class
   - **Fix**: Updated `apps/web/src/styles/globals.css` to use `border-gray-200`
   
2. **Employee Controller Missing Methods**
   - **Issue**: `Cannot read properties of undefined (reading 'bind')`
   - **Fix**: Implemented stub methods in `apps/api-gateway/src/controllers/employeeController.js`

3. **Prisma Seed Loop**
   - **Issue**: Container keeps running `prisma db seed` on startup
   - **Fix**: Updated Dockerfile CMD to only run `npx prisma generate && pnpm dev`

### 📝 Pending Implementation

1. **Employee Service**: Currently returns mock data, needs full implementation
2. **Application Routes**: Some endpoints return "implementation pending"
3. **Authentication**: Middleware exists but needs integration

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
POSTGRES_USER=hrms
POSTGRES_PASSWORD=hrms
POSTGRES_DB=hrms
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=

# MinIO
MINIO_ROOT_USER=devminio
MINIO_ROOT_PASSWORD=devminiosecret
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001

# Meilisearch
MEILI_ENV=development
MEILI_MASTER_KEY=devkey
MEILI_PORT=7700

# AI Service
OPENROUTER_API_KEY=your-api-key-here
OPENROUTER_MODEL=openrouter/anthropic/claude-3.5-sonnet

# Application
API_GATEWAY_PORT=4000
WEB_PORT=3000
JWT_SECRET=dev-jwt-secret-change-in-production
API_AUTH_TOKEN=local-dev-token
VITE_API_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                    │
│                   http://localhost:3000                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 API Gateway (Express)                    │
│                   http://localhost:4000                  │
└─────┬──────────┬──────────┬──────────┬──────────────────┘
      │          │          │          │
      ▼          ▼          ▼          ▼
  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐
  │Postgres│ │ Redis  │ │ MinIO  │ │AI Service  │
  │  :5432 │ │ :6379  │ │ :9000  │ │   :8000    │
  └────────┘ └────────┘ └────────┘ └────────────┘
```

## Performance Tips

1. **Increase Docker Resources**: Allocate at least 4GB RAM and 2 CPU cores in Docker Desktop
2. **Use WSL2**: On Windows, WSL2 backend provides better performance
3. **Volume Caching**: Volumes are configured for optimal hot-reload performance
4. **Build Cache**: Keep the Docker build cache for faster rebuilds

## Support

For issues or questions:
1. Check the logs: `docker compose logs -f`
2. Verify all services are healthy: `docker ps`
3. Review this guide's troubleshooting section
4. Check individual service documentation in `docs/`

---

**Last Updated**: October 24, 2025
**Version**: 2.0.0
