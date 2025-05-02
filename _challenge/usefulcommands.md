# Useful Commands & Environments for Woovi Playground

## What is pnpm?
**pnpm** is a fast, disk space-efficient package manager for JavaScript, similar to npm or yarn. It manages dependencies and scripts for Node.js projects. You use it just like npm, but with improved performance and workspace support.
- Official site: https://pnpm.io/

---

## Environments & Services Needed
To run Woovi Playground locally, you need:
- Node.js (JavaScript runtime)
- pnpm (package manager)
- Docker Desktop (to run MongoDB, Redis, etc. via Docker Compose)

---

## Step-by-Step: How to Start Everything

1. **Install prerequisites:**
   - [Node.js](https://nodejs.org/en/download/)
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - Install pnpm globally:
     ```sh
     npm install -g pnpm
     ```

2. **Clone the repo:**
   ```sh
   git clone https://github.com/entria/woovi-playground.git
   cd woovi-playground
   ```

3. **Install dependencies:**
   ```sh
   pnpm install
   ```

4. **Start backend services (MongoDB, Redis, etc.):**
   ```sh
   pnpm compose:up
   ```
   > This runs Docker Compose to start all required databases/services in the background.

5. **Generate local environment configs:**
   ```sh
   pnpm config:local
   ```

6. **Generate GraphQL artifacts (Relay):**
   ```sh
   pnpm relay
   ```

7. **Start the development servers:**
   ```sh
   pnpm dev
   ```
   > This starts both the backend and frontend. By default:
   > - Frontend: http://localhost:3000
   > - Backend: http://localhost:4000 (or as configured)
---

## Quick Reference
Run all: pnpm dev
Run backend: pnpm dev --filter ./apps/server
GraphQL env: http://localhost:4000/graphql
Frontend env: http://localhost:3000

## MongoDB Diagnostics
docker-compose exec mongodb mongosh
use woovi-playground
show collections
db.Account.find().pretty()
db.Transaction.find().pretty()

