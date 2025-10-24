# Multi-stage build for API Gateway
FROM node:20-alpine AS base

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api-gateway/package.json ./apps/api-gateway/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development

WORKDIR /app

# Copy all source code
COPY apps/api-gateway ./apps/api-gateway

# Set working directory to api-gateway
WORKDIR /app/apps/api-gateway

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 4000

# Start development server
# Note: We generate Prisma client again in case of schema changes in mounted volume
CMD ["sh", "-c", "npx prisma generate && pnpm dev"]

# Build stage
FROM base AS builder

WORKDIR /app

# Copy source code
COPY apps/api-gateway ./apps/api-gateway

WORKDIR /app/apps/api-gateway

# Generate Prisma Client
RUN npx prisma generate

# Production stage
FROM node:20-alpine AS production

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/api-gateway/package.json ./apps/api-gateway/

# Copy dependencies and built files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway ./apps/api-gateway

WORKDIR /app/apps/api-gateway

# Set production environment
ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "src/server.js"]