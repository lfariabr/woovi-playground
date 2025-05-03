# Tech Stack - Woovi CRUD Bank GraphQL Relay Challenge

## Backend (Server)

- **Node.js** — JavaScript runtime environment for building server-side applications.
- **TypeScript** — Static typing for improved code safety and maintainability.
- **Koa.js** — Minimalist web framework for building fast and flexible APIs.
- **GraphQL** — Modern API for building data-driven applications.

## Frontend (Web)

- **Next.js** — Framework React for server-side rendered and static applications.
- **React** — Library for building dynamic and reactive interfaces.
- **TypeScript** — Static typing for improved code safety and maintainability.
- **Relay** — GraphQL client for React, with focus on performance and efficient data management.

## Infrastructure & Integrations

- **MongoDB** — NoSQL database for persisting Accounts and Transactions (via Docker Compose).
- **Redis** — Broker of messages used to implement real-time Subscriptions.
- **PubSub (Redis)** — Event publication and subscription mechanism to support WebSocket communication between server and client.

---

# Observations 

Project was developed as part of the **Woovi CRUD Bank GraphQL Relay** challenge, replicating production practices such as code modularization, separation of concerns, and real-time communication between backend and frontend.