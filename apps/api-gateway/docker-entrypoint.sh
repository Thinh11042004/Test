#!/bin/sh
set -e

# Generate Prisma Client if needed
if [ ! -d "/app/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client" ]; then
  echo "Generating Prisma Client..."
  npx prisma generate
fi

# Start the dev server
echo "Starting development server..."
exec pnpm dev
