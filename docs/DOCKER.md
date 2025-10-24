# Docker Deployment Guide

## 🚀 Quick Start với Docker

### Prerequisites

- Docker Desktop (Windows/Mac) hoặc Docker Engine (Linux) >= 20.10
- Docker Compose >= 2.0
- 8GB RAM tối thiểu (16GB khuyến nghị)
- 20GB dung lượng ổ cứng

### 1. Clone và cấu hình

```bash
# Clone repository
git clone <repository-url>
cd AI-Integrated-Human-Resource-and-Recruitment-Management-System

# Copy .env.example và cập nhật các giá trị
cp .env.example .env
```

### 2. Cập nhật file .env

Mở file `.env` và cập nhật các giá trị sau:

```bash
# API Keys (BẮT BUỘC)
OPENROUTER_API_KEY=your_api_key_here

# Database passwords (NÊN thay đổi trong production)
POSTGRES_PASSWORD=your_secure_password
REDIS_PASSWORD=your_redis_password
MINIO_ROOT_PASSWORD=your_minio_password
MEILI_MASTER_KEY=your_meilisearch_key
JWT_SECRET=your_jwt_secret_key

# CORS (cập nhật với domain của bạn)
CORS_ORIGIN=https://yourdomain.com
```

### 3. Khởi động Development Environment

#### Option A: Sử dụng Bootstrap Script (Khuyến nghị)

```bash
# Linux/Mac
chmod +x scripts/bootstrap-docker.sh
./scripts/bootstrap-docker.sh

# Windows (PowerShell)
.\scripts\bootstrap-docker.ps1
```

#### Option B: Manual Docker Compose

```bash
# Build và start services
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f api-gateway
```

### 4. Verify Services

Sau khi khởi động, kiểm tra các services:

- **Web Dashboard**: http://localhost:3000
- **API Gateway**: http://localhost:4000/healthz
- **AI Service**: http://localhost:8000/health
- **MinIO Console**: http://localhost:9001
- **Meilisearch**: http://localhost:7700

```bash
# Kiểm tra status tất cả services
docker-compose ps

# Kiểm tra health của services
docker-compose ps --format json | jq -r '.[] | "\(.Name): \(.Health)"'
```

## 🏭 Production Deployment

### 1. Chuẩn bị Production Environment

```bash
# Tạo .env.production từ .env.example
cp .env.example .env.production

# Cập nhật với giá trị production
nano .env.production
```

**Important Production Settings:**

```bash
NODE_ENV=production
MEILI_ENV=production

# SECURITY: Thay đổi tất cả passwords và secrets
POSTGRES_PASSWORD=<strong-random-password>
REDIS_PASSWORD=<strong-random-password>
JWT_SECRET=<strong-random-secret>
API_AUTH_TOKEN=<strong-random-token>

# Bind to localhost only
POSTGRES_PORT=127.0.0.1:5432
REDIS_PORT=127.0.0.1:6379
MINIO_PORT=127.0.0.1:9000
MEILI_PORT=127.0.0.1:7700

# SSL Configuration
MINIO_USE_SSL=true
CORS_ORIGIN=https://yourdomain.com
```

### 2. Deploy Production Stack

```bash
# Build và start production services
docker-compose -f docker-compose.prod.yml up -d --build

# Hoặc với environment file
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### 3. Setup Reverse Proxy (Nginx/Caddy)

Example Nginx configuration:

```nginx
# /etc/nginx/sites-available/hrms
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;

    # Web Application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Gateway
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

## 🛠️ Common Docker Commands

### Service Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart api-gateway

# Rebuild specific service
docker-compose up -d --build api-gateway

# Scale worker service
docker-compose up -d --scale worker=3
```

### Logs & Debugging

```bash
# View all logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api-gateway

# View last 100 lines
docker-compose logs --tail=100 api-gateway

# Export logs to file
docker-compose logs --no-color > logs.txt
```

### Database Operations

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U hrms -d hrms

# Backup database
docker-compose exec postgres pg_dump -U hrms hrms > backup.sql

# Restore database
docker-compose exec -T postgres psql -U hrms hrms < backup.sql

# Run Prisma migrations
docker-compose exec api-gateway npx prisma migrate deploy

# Reset database (CAUTION!)
docker-compose exec api-gateway npx prisma migrate reset
```

### Monitoring & Maintenance

```bash
# Check resource usage
docker stats

# Check disk usage
docker system df

# Clean up unused images/containers
docker system prune -a

# View container details
docker-compose exec api-gateway env

# Shell access
docker-compose exec api-gateway sh
docker-compose exec ai-service bash
```

## 🔧 Troubleshooting

### Services không start

```bash
# Check logs
docker-compose logs --tail=50

# Check service health
docker-compose ps

# Restart service
docker-compose restart <service-name>

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### Port conflicts

```bash
# Check ports in use
netstat -tulpn | grep LISTEN

# Update ports in .env
WEB_PORT=3001
API_GATEWAY_PORT=4001
```

### Permission issues (Linux)

```bash
# Fix volume permissions
sudo chown -R $USER:$USER ./data
chmod -R 755 ./data
```

### Database connection issues

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U hrms

# Reset database
docker-compose down postgres
docker volume rm <project>_pgdata
docker-compose up -d postgres
```

### Memory issues

```bash
# Check memory usage
docker stats --no-stream

# Increase Docker memory limit
# Docker Desktop -> Settings -> Resources -> Memory
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints

- API Gateway: `http://localhost:4000/healthz`
- AI Service: `http://localhost:8000/health`
- PostgreSQL: `docker-compose exec postgres pg_isready`
- Redis: `docker-compose exec redis redis-cli ping`
- MinIO: `http://localhost:9000/minio/health/live`
- Meilisearch: `http://localhost:7700/health`

### Automated Health Checks

```bash
#!/bin/bash
# scripts/health-check.sh

services=("postgres" "redis" "minio" "meilisearch" "ai-service" "api-gateway" "web")

for service in "${services[@]}"; do
    status=$(docker-compose ps -q $service | xargs docker inspect -f '{{.State.Health.Status}}')
    echo "$service: $status"
done
```

## 🔐 Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Use strong passwords** - Generate random 32+ character passwords
3. **Enable SSL in production** - Use Let's Encrypt or commercial certificates
4. **Bind services to localhost** - Only expose web interface publicly
5. **Regular updates** - Keep Docker images and dependencies updated
6. **Backup regularly** - Automate database and file backups
7. **Monitor logs** - Set up log aggregation and alerting
8. **Limit resource usage** - Configure memory and CPU limits
9. **Network isolation** - Use Docker networks properly
10. **Scan for vulnerabilities** - Use `docker scan` regularly

## 📦 Backup & Restore

### Automated Backup Script

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup PostgreSQL
docker-compose exec -T postgres pg_dump -U hrms hrms > "$BACKUP_DIR/database.sql"

# Backup MinIO data
docker-compose exec -T minio mc mirror /data "$BACKUP_DIR/minio"

# Backup application data
cp -r ./data "$BACKUP_DIR/"

echo "Backup completed: $BACKUP_DIR"
```

### Restore from Backup

```bash
#!/bin/bash
# scripts/restore.sh

BACKUP_DIR=$1

# Restore database
docker-compose exec -T postgres psql -U hrms hrms < "$BACKUP_DIR/database.sql"

# Restore MinIO
docker-compose exec -T minio mc mirror "$BACKUP_DIR/minio" /data

# Restore application data
cp -r "$BACKUP_DIR/data" ./

echo "Restore completed from: $BACKUP_DIR"
```

## 🔄 Updates & Migrations

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Run database migrations
docker-compose exec api-gateway npx prisma migrate deploy

# Restart all services
docker-compose restart
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Redis Docker](https://hub.docker.com/_/redis)
- [Nginx Configuration](https://nginx.org/en/docs/)

## 🆘 Support

Nếu gặp vấn đề, vui lòng:

1. Kiểm tra logs: `docker-compose logs -f`
2. Kiểm tra service status: `docker-compose ps`
3. Tìm trong Issues hoặc tạo Issue mới
4. Liên hệ team phát triển
