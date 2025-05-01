# Conteinerização Next.js + Docker (Standalone)

> **Contém Spoiler!** Passo a passo para resolver o problema de conteinerização Next.js + Docker + SSR + GraphQL sem dor de cabeça.

---

## 1. Contexto
- **Stack:** Next.js (TypeScript, Relay, Material UI), backend GraphQL, Docker Compose.
- **Objetivo:** Rodar frontend e backend em containers, com SSR e comunicação via proxy.

---

## 2. Principais Desafios
- **Build standalone do Next.js** não inclui tudo que o servidor espera.
- **Problemas de resolução de módulos e arquivos estáticos (CSS, imagens).**
- **Comunicação entre containers:** URLs quebradas, variáveis de ambiente mal configuradas, fetchs falhando.

---

## 3. Solução Completa (Passo a Passo)

### 3.1 Dockerfile (Next.js Standalone)
Certifique-se de copiar TODOS os artefatos necessários:
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /repo
# ...instalação de dependências e build...

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
# ...envs e dependências...

# Copie o standalone, estáticos e públicos
COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static ./.next/static
COPY --from=builder /repo/apps/web/public ./public
# Copie o server.js para o path esperado
COPY --from=builder /repo/apps/web/.next/standalone/server.js /app/apps/web/server.js
```

### 3.2 next.config.js (Proxy para Backend)
Use rewrites para facilitar fetch SSR/client:
```js
async rewrites() {
  return [
    { source: '/graphql', destination: 'http://server:4000/graphql' },
    { source: '/graphql/:path*', destination: 'http://server:4000/graphql/:path*' },
  ];
}
```

### 3.3 network.ts (Relay/Fetch)
Sempre use endpoint relativo:
```ts
const GRAPHQL_ENPOINT = "/graphql";
```

### 3.4 .env (Atenção para WebSocket)
```env
# SSR e client HTTP passam pelo proxy
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://server:4000/graphql
# WebSocket precisa apontar para localhost no host
NEXT_PUBLIC_SUBSCRIPTIONS_ENDPOINT=ws://localhost:4000/graphql/ws
```

### 3.5 docker-compose.yml
Garanta que o backend está exposto:
```yaml
services:
  server:
    ports:
      - "4000:4000"
```

---

## 4. Dicas e Armadilhas
- **Proxy Next.js não cobre WebSocket:** Use localhost para subscriptions.
- **Sempre reinicie containers após mudar .env.**
- **Se o CSS não carregar:**
  - Confirme se `.next/static` e `public` estão no path certo.
  - Veja [Next.js Issue #50931](https://github.com/vercel/next.js/issues/50931).
- **SSR e client-side fetch:** Usando `/graphql` resolve tanto no build quanto no browser.

---

## 5. Checklist Final
- [x] Dockerfile copia todos os artefatos (standalone, static, public, server.js)
- [x] next.config.js com rewrites para /graphql
- [x] network.ts usa endpoint relativo
- [x] .env ajustado para WS
- [x] docker-compose expõe porta do backend

---

## 6. Referências
- [Next.js Standalone Mode](https://nextjs.org/docs/pages/advanced-features/output-file-tracing#standalone-mode)
- [Next.js Issue #50931 (CSS)](https://github.com/vercel/next.js/issues/50931)
- [Relay + Docker Example](https://relay.dev/docs/)

---

> **Contribua!** Se melhorar algo, atualize este guia para ajudar os próximos devs 🚀