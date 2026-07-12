# API Documentation

## Endpoint Summary

| Method | Path | Purpose | Access |
| --- | --- | --- | --- |
| GET | /health | Service health check | Public |
| POST | /auth/login | Exchange credentials for JWT | Public |
| GET | /auth/me | Return current session user | Authenticated |
| GET | /dashboard/summary | Project, task, and user counts | Authenticated |
| GET | /projects | List projects with relations | Authenticated |
| POST | /projects | Create a project | Admin, Project Manager |
| PATCH | /projects/:id | Update a project | Admin, Project Manager |
| DELETE | /projects/:id | Delete a project | Admin, Project Manager |
| GET | /tasks | List tasks with relations | Authenticated |
| POST | /tasks | Create a task | Admin, Project Manager |
| PATCH | /tasks/:id | Update a task or task status | Authenticated, with ownership checks |
| DELETE | /tasks/:id | Delete a task | Admin, Project Manager |
| GET | /users | List users | Admin |
| POST | /users | Create a user | Admin |
| PATCH | /users/:id | Update a user | Admin |
| DELETE | /users/:id | Remove a user | Admin |

## Permission Model

- Administrators can manage users, roles, projects, and tasks across the system.
- Project managers can manage projects they own and tasks inside their managed projects.
- Team members can view only their assigned tasks and update task progress.

The frontend reflects this model with a dedicated `My Tasks` view for team members instead of the manager-oriented task CRUD screen.

## Authentication

### POST /auth/login

Request body:

```json
{
  "email": "admin@cyphlab.test",
  "password": "Password123!"
}
```

Response includes a JWT token and the user profile that the frontend stores in session state.

### GET /auth/me

Requires a `Bearer` token. Returns the authenticated user profile so the frontend can restore a session after refresh.

## Dashboard

### GET /dashboard/summary

Returns counts for users, projects, and tasks so the overview screen can render live metrics.

## Projects

### GET /projects

Returns projects with manager, members, and task relations.

### POST /projects

Creates a project using the current user as manager when `managerId` is not provided.

### PATCH /projects/:id

Updates project fields such as `name`, `description`, `status`, and `managerId`.

### DELETE /projects/:id

Removes a project and its dependent records.

## Tasks

### GET /tasks

Returns tasks with project and assignee data.

### POST /tasks

Creates a task linked to an existing project.

### PATCH /tasks/:id

Allows managers to edit full task details and team members to update their assigned task status.

### DELETE /tasks/:id

Removes a task from the system.

## Users

### GET /users

Returns a user list for administrator management.

### POST /users

Creates a new user with a hashed password and role.

### PATCH /users/:id

Updates user profile fields and role.

### DELETE /users/:id

Deletes a user record.
