# Dockerfile apps/server
FROM node:20-alpine AS builder
WORKDIR /app

# Copia arquivos essenciais do monorepo
COPY pnpm-lock.yaml package.json turbo.json pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages ./packages

# Copia o .env.example para o diretório raiz
COPY apps/server/.env.example ./.env.example

# Cria um arquivo .env para o dotenv-safe
RUN echo "PORT=4000" > .env && \
    echo "MONGO_URI=\${MONGO_URL:-mongodb://localhost/woovi-playground}" >> .env && \
    echo "REDIS_HOST=\${REDIS_URL:-redis://localhost}" >> .env && \
    echo "REDIS_URL=\${REDIS_URL:-redis://redis:6379}" >> .env

# Instala pnpm e dependências de build
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copia o código fonte e builda
COPY apps/server ./apps/server
RUN pnpm --filter @woovi-playground/server... build

# Estágio de produção
FROM node:20-alpine
WORKDIR /app

# Copia arquivos essenciais do monorepo
COPY pnpm-lock.yaml package.json turbo.json pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages ./packages

# Copia o .env.example para o diretório raiz
COPY apps/server/.env.example ./.env.example

# Cria um arquivo .env para o dotenv-safe
RUN echo "PORT=4000" > .env && \
    echo "MONGO_URI=\${MONGO_URL:-mongodb://localhost/woovi-playground}" >> .env && \
    echo "REDIS_HOST=\${REDIS_URL:-redis://localhost}" >> .env && \
    echo "REDIS_URL=\${REDIS_URL:-redis://redis:6379}" >> .env

# Instala apenas dependências de produção
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Copia os arquivos compilados do estágio de build
COPY --from=builder /app/apps/server/dist ./apps/server/dist

# Configura variáveis de ambiente para Railway
ENV NODE_ENV=production
ENV PORT=4000

# Cria script de inicialização
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "PORT=4000" > .env' >> /app/start.sh && \
    echo 'echo "MONGO_URI=$MONGO_URL" >> .env' >> /app/start.sh && \
    echo 'echo "REDIS_HOST=$REDIS_URL" >> .env' >> /app/start.sh && \
    echo 'echo "REDIS_URL=$REDIS_URL" >> .env' >> /app/start.sh && \
    echo 'node apps/server/dist/index.js' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 4000
CMD ["/app/start.sh"]

# Testes Dockerfile no container local
# docker run -p 4000:4000 \  -e NODE_ENV=production \
#   -e PORT=4000 \
#   -e MONGO_URL="mongodb://mongo:KlmSYztCoHUsLxYdFwvdnBYfEWZyLYoc@interchange.proxy.rlwy.net:44661" \
#   -e REDIS_URL="redis://default:wThptmZKOPIPLvQPSEnnfICSPYCSLFYJ@shuttle.proxy.rlwy.net:13733" \
#   woovi-server