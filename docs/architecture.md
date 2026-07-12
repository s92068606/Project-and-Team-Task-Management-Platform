# System Architecture

```mermaid
flowchart LR
  Browser[Next.js Frontend] --> Api[Express API]
  Api --> Prisma[Prisma Client]
  Prisma --> Db[(PostgreSQL)]
  Api --> Jwt[JWT Authentication]
  Api --> RBAC[Role-based Authorization]
```

The frontend renders the user-facing dashboard and login entry points. The API exposes REST endpoints for authentication, dashboards, projects, and tasks. Prisma connects the API to PostgreSQL.
