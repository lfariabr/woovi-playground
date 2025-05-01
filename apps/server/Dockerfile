# Dockerfile apps/server
FROM node:20-alpine
WORKDIR /app

# Copia arquivos essenciais do monorepo
COPY pnpm-lock.yaml package.json turbo.json pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages

# Copia o .env e .env.example do server para a raiz do container
COPY apps/server/.env ./
COPY apps/server/.env.example ./

# Instala pnpm e todas as dependências do monorepo
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Builda só o server (não roda build global)
RUN pnpm --filter @woovi-playground/server... build

EXPOSE 4000
CMD ["node", "apps/server/dist/index.js"]