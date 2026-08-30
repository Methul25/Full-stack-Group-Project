# SyncBoard Assignment 2 Reference

This is the complete runnable Session 2 reference: a React client backed by an Express API with JWT authentication, task ownership, validation, and layered server architecture. It exists so each member can copy only the files assigned in their guide.

## Run

```bash
cd reference-project
npm install
copy .env.example .env
npm run dev
```

Set a long random `JWT_SECRET` in `.env`. The client runs on port 5173 and proxies `/api` to the API on port 4000.

Seed logins:

- `maya@syncboard.test` / `password123`
- `noah@syncboard.test` / `password123`

Data remains in memory for Assignment 2 and resets when the API restarts. MongoDB replaces only the repository implementation in Session 3.

## API contract

All JSON success responses use `{ "data": ... }`; collection responses also include `meta`. Errors use `{ "error": { "message", "code", "details?", "requestId" } }`.

| Method | Path | Auth | Success | Purpose |
|---|---|---:|---:|---|
| GET | `/api/health` | No | 200 | Health and uptime |
| POST | `/api/auth/register` | No | 201 | Create a user and private board |
| POST | `/api/auth/login` | No | 200 | Return an expiring JWT and public user |
| GET | `/api/auth/me` | Bearer | 200 | Restore the current user |
| GET | `/api/tasks` | Bearer | 200 | List owned tasks; filter, sort, paginate |
| GET | `/api/tasks/:id` | Bearer | 200 | Read one owned task |
| POST | `/api/tasks` | Bearer | 201 | Create a task |
| PATCH | `/api/tasks/:id` | Bearer | 200 | Update part of a task |
| DELETE | `/api/tasks/:id` | Bearer | 204 | Delete a task |

Expected failures include 400 validation details, 401 missing/invalid/expired authentication, 403 valid users accessing another board, 404 missing resources, and 409 duplicate email.

## Validate

```bash
npm run lint
npm run build
```

Do not copy this entire folder into one assessed commit. Follow the matching guide in [`../member-instructions`](../member-instructions), inspect the code, copy only the assigned paths, and commit under your own identity.
