# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /repo

# 1. Copia todos os arquivos necessários do monorepo antes do install
COPY pnpm-lock.yaml package.json turbo.json pnpm-workspace.yaml ./
COPY apps/web ./apps/web
COPY packages ./packages

# 2. Instala pnpm e dependências
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 3. Copia todo o projeto para o builder
COPY . .

# 4. Builda só o web app
RUN pnpm --filter @woovi-playground/web... build

# --- Runtime stage ---
FROM node:20-alpine AS runner
WORKDIR /app

# 5. Copia build standalone do Next.js
COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static .next/static
COPY --from=builder /repo/apps/web/public ./public

# 6. Copia node_modules do root e do app (resolve react/jsx-runtime)
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/web/node_modules ./apps/web/node_modules

# 7. Adiciona variáveis de ambiente se quiser
# COPY apps/web/.env .env

EXPOSE 3000
CMD ["node", "apps/web/server.js"]