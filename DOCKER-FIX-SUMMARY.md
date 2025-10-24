# ✅ DOCKER SETUP FIXED - SINGLE FILE CONFIGURATION

## 🎯 Vấn đề đã khắc phục:

### 1. ✅ Xóa file docker-compose.prod.yml
- **Lý do**: Chỉ sử dụng 1 file `docker-compose.yml` duy nhất
- **Kết quả**: Đơn giản hóa configuration, dễ quản lý

### 2. ✅ Cập nhật PyTorch version
- **Vấn đề**: `torch==2.1.0` không còn available
- **Fix**: Thay bằng `torch>=2.2.0` trong `apps/ai-service/requirements.txt`
- **Lý do**: Python wheel repository chỉ hỗ trợ từ version 2.2.0 trở lên

### 3. ✅ Xóa version warning
- **Vấn đề**: Docker Compose warning về `version: '3.9'` là obsolete
- **Fix**: Xóa dòng `version` từ `docker-compose.yml`
- **Kết quả**: Build sạch, không có warning

---

## 🚀 Cách sử dụng:

### Quick Start
```powershell
# 1. Copy environment file
cp .env.example .env

# 2. Cập nhật API key trong .env
# OPENROUTER_API_KEY=your_api_key_here

# 3. Stop containers cũ (nếu có)
docker compose down -v

# 4. Build và start services
docker compose up -d --build

# 5. Xem logs
docker compose logs -f

# 6. Check health
docker compose ps
```

### Hoặc dùng Bootstrap Script
```powershell
.\scripts\bootstrap-docker.ps1
```

---

## 📦 Services URLs

Sau khi start thành công:

- 📊 **Web Dashboard**: http://localhost:3000
- 🔌 **API Gateway**: http://localhost:4000/healthz
- 🤖 **AI Service**: http://localhost:8000/health
- 📦 **MinIO Console**: http://localhost:9001
- 🔍 **Meilisearch**: http://localhost:7700
- 🐘 **PostgreSQL**: localhost:5432
- 🔴 **Redis**: localhost:6379

---

## 🔧 Files Changed

1. **Deleted**: `docker-compose.prod.yml` ❌
2. **Updated**: `docker-compose.yml` - Xóa `version` field
3. **Updated**: `apps/ai-service/requirements.txt` - PyTorch version `>=2.2.0`

---

## 📝 Single docker-compose.yml Features

File `docker-compose.yml` bây giờ bao gồm:

### Infrastructure Services:
- ✅ PostgreSQL 16 with pgvector
- ✅ Redis 7 with persistence
- ✅ MinIO object storage
- ✅ Meilisearch v1.8

### Application Services:
- ✅ AI Service (Python FastAPI)
- ✅ API Gateway (Express + Prisma)
- ✅ Web Dashboard (Vite + React + Tailwind)
- ✅ Worker (BullMQ background jobs)

### Advanced Features:
- ✅ Health checks for all services
- ✅ Automatic database migration
- ✅ Hot-reload for development
- ✅ Volume persistence
- ✅ Network isolation
- ✅ Environment variables management

---

## 🐛 Troubleshooting

### Build vẫn fail?
```powershell
# Clear everything và build lại
docker compose down -v
docker system prune -af
docker compose build --no-cache
docker compose up -d
```

### Port conflicts?
```powershell
# Check ports đang sử dụng
netstat -ano | findstr "3000 4000 8000 5432 6379"

# Hoặc update ports trong .env
WEB_PORT=3001
API_GATEWAY_PORT=4001
```

### Permission issues?
```powershell
# Run PowerShell as Administrator
# Restart Docker Desktop
```

---

## ✨ Next Steps

1. **Verify services are running:**
   ```powershell
   docker compose ps
   ```

2. **Check logs for errors:**
   ```powershell
   docker compose logs -f
   ```

3. **Access the dashboard:**
   - Open http://localhost:3000

4. **Test API:**
   ```powershell
   curl http://localhost:4000/healthz
   curl http://localhost:8000/health
   ```

---

## 📚 Documentation

- **Full Guide**: `docs/DOCKER.md`
- **Makefile Commands**: Run `make help`
- **Health Check**: `.\scripts\health-check.ps1`

---

**🎉 All fixed! Docker configuration hiện đã đơn giản và sạch sẽ với 1 file duy nhất.**
