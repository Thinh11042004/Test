# AI-Integrated Human Resource & Recruitment Management System

## Overview
This repository contains a modular HRMS/ATS platform that demonstrates how AI-assisted insights can be woven into day-to-day talent operations. The system is organized as a PNPM-powered monorepo and ships with a React dashboard, an Express-based API gateway, a Python FastAPI microservice for AI workloads, and background processing workers. The entire development environment is containerized—Docker Compose spins up the applications and their dependencies (PostgreSQL, Redis, MinIO, and Meilisearch) with a single command, so no language runtimes need to be installed locally.

## Architecture at a Glance
```
┌──────────────────┐        ┌─────────────────────┐        ┌──────────────────────┐
│ React Dashboard  │ <────> │ Node.js API Gateway │ <────> │  AI & Worker Services │
│ (apps/web)       │        │ (apps/api-gateway)  │        │ (apps/ai-service,     │
│                  │        │                     │        │  apps/worker)         │
└──────────────────┘        └──────────┬──────────┘        └────────┬──────────────┘
                                        │                            │
                                        ▼                            ▼
                                Shared infrastructure      Data stores, queues, and
                                (PostgreSQL, Redis,        external integrations
                                Meilisearch, MinIO)        (pluggable)
```

* **apps/web** – Vite + React 18 single-page dashboard that surfaces headcount analytics, job pipelines, and AI-driven insights for HR and Talent teams.
* **apps/api-gateway** – Express application that exposes REST endpoints, aggregates sample datasets, applies validation/security middleware, and proxies AI-related requests.
* **apps/ai-service** – FastAPI microservice stub where LLM-backed candidate summaries, matching, and interview feedback can be implemented.
* **apps/worker** – BullMQ/TypeScript worker scaffold that can orchestrate asynchronous scoring, enrichment, and ingestion jobs against Redis and PostgreSQL.
* **infra/docker** – Reusable Docker Compose configurations for development, production, or minimal Node+React stacks; includes bootstrap scripts for PostgreSQL and other services.
* **scripts** – Helper shell scripts for spinning up dev environments, database migrations, linting, and backups.

## Monorepo Layout
Below is the high-level project structure (application bundles omit generated artifacts such as `node_modules`):

```
.
├── package.json                # Root package: workspace scripts and dev dependencies
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── turbo.json                  # TurboRepo pipeline placeholder
├── README.md                   # You're here
├── apps/
│   ├── web/                    # React/Vite admin dashboard
│   │   ├── package.json
│   │   └── src/
│   │       ├── App.jsx         # Router + layout composition
│   │       ├── components/     # Layout shell, protected route wrapper
│   │       ├── hooks/          # Custom React hooks (e.g., API data, auth)
│   │       ├── pages/          # Dashboard, Applications, Jobs, Profile screens
│   │       ├── services/       # Axios client configuration
│   │       ├── store/          # Zustand stores for client-side state
│   │       ├── styles/         # Tailored CSS bundles for UI primitives
│   │       └── utils/          # Formatting helpers, constants
│   ├── api-gateway/            # Express API and business logic modules
│   │   ├── package.json
│   │   └── src/
│   │       ├── app.js          # App bootstrap (middleware, health checks)
│   │       ├── server.js       # HTTP server entry point
│   │       ├── config/         # Configuration helpers and constants
│   │       ├── controllers/    # Request handlers per domain (jobs, candidates, HR)
│   │       ├── data/           # Sample datasets powering the demo
│   │       ├── lib/            # Cross-cutting utilities (LLM adapters, scoring)
│   │       ├── middleware/     # Error handling, rate limiting, auth guards
│   │       ├── repositories/   # Data access abstractions (Postgres/Redis ready)
│   │       ├── routes/         # Route definitions mounted by feature area
│   │       ├── services/       # Domain services (analytics, AI orchestration)
│   │       └── utils/          # Shared helpers (formatting, validation)
│   ├── ai-service/             # Python FastAPI microservice
│   │   ├── Dockerfile          # Python 3.12 image with Uvicorn entrypoint
│   │   ├── requirements.txt    # FastAPI + OpenAI client dependencies
│   │   └── src/
│   │       └── main.py         # Health checks + placeholder AI endpoints
│   ├── worker/                 # BullMQ worker scaffold (TypeScript)
│   │   ├── package.json
│   │   └── src/
│   │       └── index.ts        # Queue consumers & job processors
│   └── search-svc/             # Reserved for future semantic search service
├── infra/
│   └── docker/
│       ├── docker-compose.yml              # Base stack (override with profiles)
│       ├── docker-compose.dev.yml          # Full dev stack with hot reload
│       ├── docker-compose.prod.yml         # Production-leaning build targets
│       ├── docker-compose.node-react.yml   # Lightweight web+api environment
│       └── services/
│           └── postgres/
│               └── init/                   # SQL/seed scripts executed at boot
├── scripts/
│   ├── backup-db.sh            # Simple pg_dump wrapper
│   ├── dev.sh                  # Example combined dev runner
│   ├── lint-typecheck.sh       # Workspace linting/type checks
│   └── migrate.sh              # Placeholder migration orchestration
└── docs/
    └── README.md               # Space for solution documentation
```

## Quick Start: Fully Containerized Development
> **Requirements:** Install Docker Desktop (macOS/Windows) or Docker Engine + Docker Compose Plugin (Linux). No Node.js, Python, or PNPM installation is required when following the Docker workflow.

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Integrated-Human-Resource-and-Recruitment-Management-System
   ```
2. **Start the full stack**
   ```bash
   docker compose -f infra/docker/docker-compose.dev.yml up -d
   ```
   The Compose file mounts your working tree for hot reloading and loads default credentials from `infra/docker/.env.docker`. Containers build automatically on the first run.
3. **Access the services**
   - Web dashboard → http://localhost:3000
   - API gateway → http://localhost:4000 (health: `/health`)
   - AI service → http://localhost:8000 (health: `/health`)
   - MinIO console → http://localhost:9001 (user: `devminio`, password: `devminiosecret`)
   - Meilisearch → http://localhost:7700 (master key: `devkey`)
4. **Stop everything**
   ```bash
   docker compose -f infra/docker/docker-compose.dev.yml down
   ```

### Customizing the Docker Environment
The Compose stack sources defaults from `infra/docker/.env.docker`. Update values there (or create `infra/docker/.env.docker.local` and reference it from the Compose file) to point to external services, inject API keys, or tweak dev credentials. Any changes take effect on the next `docker compose up`.

### Running Without Docker (optional)
If you prefer to run processes locally, install the tooling from the table below and create per-app `.env` files as described. Backing services (PostgreSQL, Redis, etc.) must also be provisioned manually.

```bash
# Example manual startup flow
pnpm install

# API Gateway (Express)
pnpm --filter api-gateway dev

# React dashboard
pnpm --filter web dev -- --host

# Worker (BullMQ)
pnpm --filter worker dev

# AI service (FastAPI)
cd apps/ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

## Environment & Tooling Requirements
| Component              | Recommended Version | Notes |
| ---------------------- | ------------------- | ----- |
| Docker & Docker Compose| Latest stable       | Required for the out-of-the-box containerized workflow |
| Node.js                | 20.x LTS            | Only needed when running services outside Docker |
| PNPM                   | 9.x                 | Monorepo package manager (`packageManager` is set to `pnpm@9.0.0`) |
| Python                 | 3.12                | Matches the AI service Dockerfile; only needed for manual execution |
| Redis                  | 7.x                 | Queue backend for BullMQ (provisioned automatically by Docker) |
| PostgreSQL             | 16.x                | Primary relational data store (provisioned automatically by Docker) |

> **Tip:** Install [Volta](https://volta.sh) or [nvm](https://github.com/nvm-sh/nvm) to pin Node.js versions across contributors when running apps natively.

## How the Pieces Fit Together
1. **User Experience** – The React dashboard (Vite) authenticates users and fetches data via the API gateway. It visualizes analytics, job pipelines, applications, and talent insights.
2. **Business Logic & Aggregation** – The API gateway exposes domain-specific routes (employees, jobs, candidates, analytics, AI). Controllers coordinate services that pull from sample datasets (`src/data`) and prepare JSON payloads for the UI. Middleware handles CORS, security headers, request logging, and error responses.
3. **AI & Automation** – The FastAPI service is the designated home for model integration. Routes such as `/ai/candidate-summary`, `/ai/match`, and `/ai/interview-feedback` currently return placeholders and are ready to be wired to LLMs or vector databases.
4. **Background Jobs** – The BullMQ worker (`apps/worker/src/index.ts`) is ready to schedule asynchronous tasks (e.g., syncing applicant tracking data, refreshing analytics). It connects to Redis and PostgreSQL as defined by environment variables.
5. **Infrastructure** – Docker compose files declare the full environment. PostgreSQL can be seeded by placing SQL scripts in `infra/docker/services/postgres/init`. MinIO provides S3-compatible storage for resumes, and Meilisearch can back semantic candidate/job search.

## Testing & Quality
* **API Gateway:** `pnpm --filter api-gateway test` executes Jest/Supertest suites (tests to be authored).
* **Web App:** `pnpm --filter web lint` runs ESLint checks; add testing frameworks (Vitest/React Testing Library) as the UI grows.
* **Worker & AI service:** Add unit/integration suites as job processors and AI pipelines evolve.
* **Workspace tooling:** `scripts/lint-typecheck.sh` demonstrates how to run linting and type checking across packages.

## Deployment Considerations
* Use `docker-compose.prod.yml` to build production images with multi-stage Dockerfiles.
* Integrate CI/CD (GitHub Actions, GitLab CI) to run lint/test scripts and publish images.
* Secure environment variables via secrets managers; replace sample credentials before shipping.
* Add API authentication (JWT/RBAC) and TLS termination in front of the API gateway for production usage.

## Additional Resources
* `docs/README.md` – Expand with architectural decision records, API contracts, and onboarding notes.
* `scripts/` – Extend helper scripts for migrations (Prisma, Flyway) and observability tasks.
* `apps/search-svc/` – Placeholder for a dedicated semantic search or vector similarity service that can plug into the API gateway.

Happy building! Contributions and enhancements are welcome—feel free to open issues or submit PRs as the platform evolves.