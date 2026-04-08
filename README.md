# MTCRMS Backend

Base backend scaffold built with NestJS, TypeORM, MySQL, and Redis.

## Requirements

- Node.js 22+
- Docker / Docker Compose

## Environment

Copy `.env.example` to `.env` and adjust values if needed.

Auth-related environment variables:

- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `AUTH_MAX_FAILED_ATTEMPTS`, `AUTH_LOCKOUT_MINUTES`
- `AUTH_PASSWORD_*` for password policy
- `AUTH_BOOTSTRAP_ADMIN_*` to create the first local admin automatically

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

Default published ports from `.env`:

- API: `3000`
- MySQL: `3307`
- Redis: `6380`

## Auth endpoints

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/change-password`
