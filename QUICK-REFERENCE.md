# HRMS Quick Reference Card

## 🚀 Start Application

```powershell
.\scripts\start-hrms.ps1
```

## 🌐 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| API Gateway | http://localhost:4000 | - |
| API Health | http://localhost:4000/health | - |
| AI Service Docs | http://localhost:8000/docs | - |
| MinIO Console | http://localhost:9001 | devminio / devminiosecret |
| Meilisearch | http://localhost:7700 | Key: devkey |

## 📊 Check Status

```powershell
# All containers
docker ps

# Logs for all services
docker compose logs -f

# Logs for specific service
docker compose logs -f api-gateway
docker compose logs -f web
```

## 🛑 Stop/Restart

```powershell
# Stop all
docker compose down

# Restart specific service
docker compose restart api-gateway
docker compose restart web

# Restart with rebuild
docker compose up -d --build api-gateway
```

## 🔧 Common Fixes

### CSS Not Updating
```powershell
docker restart hrms-web
```

### API Gateway Issues
```powershell
docker compose logs api-gateway --tail 50
docker compose restart api-gateway
```

### Complete Reset
```powershell
docker compose down -v
docker system prune -a -f
docker compose up -d
```

## ✅ Health Checks

```powershell
# Check all healthy
docker ps | Select-String "healthy"

# Test API
curl http://localhost:4000/health

# Test AI Service
curl http://localhost:8000/health
```

## 📁 Key Files

- `SETUP-GUIDE.md` - Full setup guide
- `FINAL-RESOLUTION-SUMMARY.md` - Complete fix summary
- `docker-compose.yml` - Service configuration
- `scripts/start-hrms.ps1` - Startup automation

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port in use | `netstat -ano \| findstr :3000` |
| Container won't start | Check logs: `docker logs <container>` |
| Database connection | Verify postgres is healthy |
| Hot reload not working | Restart container |

## 📞 Quick Commands

```powershell
# View running containers
docker ps

# Stop all
docker compose down

# View logs
docker compose logs -f

# Rebuild and start
docker compose up -d --build

# Clean everything
docker system prune -a -f
```

---

**Last Updated**: October 24, 2025
