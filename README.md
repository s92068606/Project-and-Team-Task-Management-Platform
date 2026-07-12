# Project and Team Task Management Platform

A full-stack project and task management platform for administrators, project managers, and team members.

The repository is structured as a monorepo with a Next.js frontend and a Node.js + Express backend, both backed by PostgreSQL through Prisma.

## Stack

- Frontend: Next.js
- Backend: Node.js + Express
- Database: PostgreSQL with Prisma
- Auth: JWT + role-based access control
- CI: GitHub Actions

## Features

- JWT login with session persistence in the browser
- Role-based access for administrators, project managers, and team members
- CRUD screens for users, projects, and tasks
- REST API surface with validation and reusable auth helpers
- Responsive dashboard UI with authenticated navigation
- Prisma schema and seed data for demo accounts

## Permission Model

- Administrators manage users, roles, projects, and overall access.
- Project managers use Overview, Projects, and Tasks.
- Team members use Overview and My Tasks.
- Team members view assigned work and update task progress in a dedicated screen.

## Demo Accounts

Seeded accounts are documented in the API seed file.

- admin@cyphlab.test
- manager@cyphlab.test
- member@cyphlab.test

Default password: `Password123!`

## Setup

1. Copy `.env.example` to `.env` and adjust values.
2. Install dependencies in the root workspace.
3. Generate Prisma client and run migrations for the API.
4. Start the API and web app in separate terminals.

If `npm install` is interrupted by network or filesystem issues on Windows, rerun it after clearing any locked `node_modules` files.

## Running Commands

Run these from the repository root.

### Install

```powershell
npm install
```

### Database setup

```powershell
npm run prisma:generate --workspace @cyphlab/api
npm run prisma:migrate --workspace @cyphlab/api
npm run prisma:seed --workspace @cyphlab/api
```

### Development

```powershell
npm run dev --workspace @cyphlab/api
npm run dev --workspace @cyphlab/web
```

If you want to run them from separate terminals with explicit paths, use:

```powershell
Set-Location "D:\project\Project-and-Team-Task-Management-Platform"
npm run dev --workspace @cyphlab/api
```

Open a second terminal and run:

```powershell
Set-Location "D:\project\Project-and-Team-Task-Management-Platform"
npm run dev --workspace @cyphlab/web
```

Backend path: `D:\project\Project-and-Team-Task-Management-Platform\apps\api`

Frontend path: `D:\project\Project-and-Team-Task-Management-Platform\apps\web`

### Validation

```powershell
npm run lint --workspace @cyphlab/api
npm run lint --workspace @cyphlab/web
npm run build --workspace @cyphlab/api
npm run build --workspace @cyphlab/web
npm run test --workspace @cyphlab/api
```

### Production start

```powershell
npm run build --workspace @cyphlab/api
npm run start --workspace @cyphlab/api
npm run build --workspace @cyphlab/web
npm run start --workspace @cyphlab/web
```

## Usage Guidelines

- Log in with one of the seeded demo accounts in the database.
- Admins can manage users, projects, and tasks.
- Project managers can manage projects and project-related tasks.
- Team members can use the My Tasks screen to update task progress.
- Keep `NEXT_PUBLIC_API_BASE_URL` pointed at the running Node API host.

## Scripts

- `npm run lint`
- `npm run build`
- `npm run test`

The API health check is available at `http://localhost:4000/health`.

## Deployment Notes

- The Next.js app is prepared for Vercel in [apps/web/vercel.json](apps/web/vercel.json).
- Point the web app at your Node API host with `NEXT_PUBLIC_API_BASE_URL`.
- Keep the API running on a Node host such as Render, Railway, Fly.io, or a VM with PostgreSQL access.

## Documentation

- [Architecture diagram](docs/architecture.md)
- [ERD](docs/erd.md)
- [Use case diagram](docs/use-case.md)
- [API documentation](docs/api.md)
- [Deployment notes](docs/deployment.md)
- [Feature completion report](docs/feature-completion-report.md)
- [CI/CD workflow](docs/ci-cd.md)
- [AI usage summary](docs/ai-usage.md)
