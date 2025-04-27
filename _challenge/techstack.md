# Tech Stack - Woovi CRUD Bank GraphQL Relay Challenge

## Backend (Server)

- **Node.js** — Ambiente de execução JavaScript no servidor.
- **TypeScript** — Tipagem estática para maior robustez e manutenção do código.
- **Koa.js** — Framework web minimalista para construção de APIs rápidas e flexíveis.
- **GraphQL** — API moderna com suporte a Relay-style pagination e Subscriptions.

## Frontend (Web)

- **Next.js** — Framework React para aplicações server-side rendered e estáticas.
- **React** — Biblioteca para construção de interfaces dinâmicas e reativas.
- **TypeScript** — Tipagem estática também no front-end, promovendo segurança de código.
- **Relay** — Cliente GraphQL para React, com foco em performance e gerenciamento de dados eficiente.

## Infraestrutura e Integrações

- **MongoDB** — Banco de dados NoSQL para persistência de Accounts e Transactions (via Docker Compose).
- **Redis** — Broker de mensagens usado para implementar Subscriptions em tempo real.
- **PubSub (Redis)** — Mecanismo de publicação e assinatura de eventos para suportar comunicação WebSocket entre server e client.

---

# Observação

Projeto foi desenvolvido como parte do desafio **Woovi CRUD Bank GraphQL Relay**, replicando práticas de produção como modularização de código, separação de responsabilidades e comunicação em tempo real entre backend e frontend.