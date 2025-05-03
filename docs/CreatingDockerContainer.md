# Creating Docker Container for Next.js + Docker (Standalone)

> **Contains Spoiler!** Step-by-step guide to resolve the problem of containerizing Next.js + Docker + SSR + GraphQL without headache.

---

## 1. Context
- **Stack:** Next.js (TypeScript, Relay, Material UI), backend GraphQL, Docker Compose.
- **Objective:** Run frontend and backend in containers, with SSR and communication via proxy.

---

## 2. Main Challenges
- **Build standalone of Next.js** does not include everything the server expects.
- **Problems with module resolution and static files (CSS, images).**
- **Communication between containers:** Broken URLs, misconfigured environment variables, failed fetches.

---

## 3. Complete Solution (Step by Step)

### 3.1 Dockerfile (Next.js Standalone)
Make sure to copy ALL artifacts necessary:
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /repo
# ...installation of dependencies and build...

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
# ...envs e dependências...

# Copie o standalone, estáticos e públicos
COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static ./.next/static
COPY --from=builder /repo/apps/web/public ./public
# Copy the server.js to the expected path
COPY --from=builder /repo/apps/web/.next/standalone/server.js /app/apps/web/server.js
```

### 3.2 next.config.js (Proxy for Backend)
Use rewrites to facilitate fetch SSR/client:
```js
async rewrites() {
  return [
    { source: '/graphql', destination: 'http://server:4000/graphql' },
    { source: '/graphql/:path*', destination: 'http://server:4000/graphql/:path*' },
  ];
}
```

### 3.3 network.ts (Relay/Fetch)
Always use relative endpoint:
```ts
const GRAPHQL_ENPOINT = "/graphql";
```

### 3.4 .env (Attention for WebSocket)
```env
# SSR and client HTTP pass through the proxy
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://server:4000/graphql
# WebSocket needs to point to localhost on the host
NEXT_PUBLIC_SUBSCRIPTIONS_ENDPOINT=ws://localhost:4000/graphql/ws
```

### 3.5 docker-compose.yml
Ensure the backend is exposed:
```yaml
services:
  server:
    ports:
      - "4000:4000"
```

---

## 4. Tips and Pitfalls
- **Proxy Next.js does not cover WebSocket:** Use localhost for subscriptions.
- **Always restart containers after changing .env.**
- **If CSS does not load:**
  - Confirm if `.next/static` and `public` are in the correct path.
  - See [Next.js Issue #50931](https://github.com/vercel/next.js/issues/50931).
- **SSR and client-side fetch:** Using `/graphql` resolves both at build and browser.

---

## 5. Final Checklist
- [x] Dockerfile copies all artifacts (standalone, static, public, server.js)
- [x] next.config.js with rewrites for /graphql
- [x] network.ts uses relative endpoint
- [x] .env adjusted for WS
- [x] docker-compose exposes backend port

---

## 6. References
- [Next.js Standalone Mode](https://nextjs.org/docs/pages/advanced-features/output-file-tracing#standalone-mode)
- [Next.js Issue #50931 (CSS)](https://github.com/vercel/next.js/issues/50931)
- [Relay + Docker Example](https://relay.dev/docs/)

---

> **Contribute!** If you improve something, update this guide to help the next devs 🚀