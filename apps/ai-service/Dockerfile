# Multi-stage build for AI Service
FROM python:3.12-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements
COPY apps/ai-service/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Development stage
FROM base AS development

WORKDIR /app

# Copy source code
COPY apps/ai-service/src ./src
COPY apps/ai-service/notebooks ./notebooks
COPY apps/ai-service/tests ./tests

# Create necessary directories
RUN mkdir -p /app/data/embeddings /app/data/models /app/logs

# Expose port
EXPOSE 8000

# Start dev server with auto-reload
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--log-level", "info"]

# Production stage
FROM python:3.12-slim AS production

# Install only runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependencies from base
COPY --from=base /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=base /usr/local/bin /usr/local/bin

# Copy application
COPY apps/ai-service/src ./src

# Create necessary directories
RUN mkdir -p /app/data/embeddings /app/data/models /app/logs

# Set production environment
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

# Use gunicorn for production
CMD ["gunicorn", "src.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--log-level", "info"]
