FROM node:20-alpine AS base
WORKDIR /repo/apps/web

# Copy package files
COPY apps/web/package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY apps/web/src ./src
COPY apps/web/public ./public
COPY apps/web/index.html ./
COPY apps/web/vite.config.js ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev", "--", "--host"]