# Deployment

## Vercel Frontend

The Next.js frontend is intended to be deployed on Vercel.

Deployment inputs:

- Project root: `apps/web`
- Build command: `npm run build --workspace @cyphlab/web`
- Environment variable: `NEXT_PUBLIC_API_BASE_URL`

The placeholder [apps/web/vercel.json](../apps/web/vercel.json) shows how to route `/api` traffic to a separate Node host once the real backend URL is known.

## Node API Host

Deploy the Express API to any Node-capable host with PostgreSQL support.

Recommended environment variables:

- `API_PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`

## Production Checklist

1. Provision a PostgreSQL database.
2. Run Prisma migrations and seed data.
3. Set the frontend API base URL.
4. Verify login, project CRUD, and task CRUD in the deployed environment.
