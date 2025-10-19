FROM node:20-alpine AS base
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9 --activate

FROM base AS deps
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/worker/package.json apps/worker/package.json
RUN pnpm install --filter ./apps/worker...

FROM base AS dev
COPY --from=deps /repo/node_modules /repo/node_modules
COPY --from=deps /repo/apps/worker/node_modules /repo/apps/worker/node_modules
COPY apps/worker/tsconfig.json apps/worker/tsconfig.json
COPY apps/worker/src apps/worker/src
WORKDIR /repo/apps/worker
CMD ["pnpm","dev"]
