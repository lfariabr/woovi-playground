# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /repo

# Copy package files and install dependencies
COPY package.json turbo.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code and build
COPY . .
RUN pnpm --filter @woovi-playground/web... build

# --- Runtime stage ---
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install production dependencies in runtime image
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Copy standalone output to /app
COPY --from=builder /repo/apps/web/.next/standalone/ /app/

# Copy the full .next directory (for BUILD_ID and other runtime artifacts)
COPY --from=builder /repo/apps/web/.next /app/apps/web/.next

# Ensure public directory exists
RUN mkdir -p /app/apps/web/public

# Copy static + public files to proper absolute paths
COPY --from=builder /repo/apps/web/.next/static /app/.next/static
COPY --from=builder /repo/apps/web/public /app/apps/web/public

# Copy server.js to the correct location expected by the CMD
COPY --from=builder /repo/apps/web/.next/standalone/server.js /app/apps/web/server.js

# Expose port and start server
EXPOSE 3000
CMD ["node", "apps/web/server.js"]