# MTCRMS Backend

Base backend scaffold built with NestJS, TypeORM, MySQL, and Redis.

## Requirements

- Node.js 22+
- Docker / Docker Compose

## Environment

Copy `.env.example` to `.env` and adjust values if needed.

## Run locally

```bash
npm install
npm run start:dev
```

Health check:

```bash
GET /api/v1/health
```

## Run with Docker

```bash
docker compose up --build
```
