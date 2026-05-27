# Sutra

Full-stack polling app with realtime updates (**Socket.io**), JWT + OAuth auth, and analytics UI (**React Flow**, **Recharts**). Styled as a dark "mission control" dashboard.

## Realtime

- Live poll updates pushed to everyone in a poll room.
- JWT sessions with HTTP-only cookies; optional Google OAuth.

## Data integrity

- **Vote + tallies**: On a **replica set** (e.g. MongoDB Atlas), vote insert and poll tally update run in a **single transaction**. On a standalone `mongod`, the code detects unsupported transactions and falls back to insert + one atomic `$inc` update, rolling back the vote document if the update fails.
- **Per-document tallies**: All question/option increments plus `totalParticipants` still use **one** `findOneAndUpdate` with `arrayFilters` so partial per-field corruption cannot happen mid-request.
- **Validation**: Express-validator on API payloads; responses are checked against real question/option ids (no duplicate questions, no mismatched options).
- **Duplicate votes**: Unique partial indexes on `(pollId, voterId)` and `(pollId, voterIp)` for anonymous flows.

## Security & ops

- Helmet, CORS, and rate limiting on `/api/*`.
- **Auth**: Stricter rate limits on login/signup and on password-reset endpoints; signup/login/reset inputs validated with express-validator; minimum password length **8**.
- **JWT cookies**: `SameSite` / `Secure` follow environment (lax + non-secure on local HTTP; `none` + `Secure` in production for cross-site). Override with `JWT_COOKIE_SAMESITE` and `JWT_COOKIE_SECURE` if needed.
- **Password reset**: Same response whether or not the email exists (no account enumeration); Brevo sender address comes from env, not the repo.
- **CORS + Socket.io origins** come from `ALLOWED_ORIGINS` (comma-separated) or, if unset, `CLIENT_URL` plus `http://localhost:5173`. Set `ALLOWED_ORIGINS` in production for every frontend URL you use.

## Tech stack

- **Frontend**: React (Vite), Tailwind, Framer Motion, React Flow, Recharts, Socket.io client; **ESLint 9** (flat config) + **Prettier**; **Core logic (API/Auth) migrated to TypeScript** for maximum production stability.
- **Backend**: Node.js, Express, Socket.io, MongoDB, Mongoose, Passport.

## Scripts

```bash
# Frontend (repo root)
npm run dev
npm run build

# API (server/)
cd server && npm run dev

# Code quality (run from repo root; `lint` needs `server/node_modules` — use `npm ci` in `server/` first)
npm run format          # Prettier write (root + server paths)
npm run format:check    # CI / pre-commit
npm run typecheck       # `tsc --noEmit` (strict; currently `src` TS + JSX via Vite)
npm run lint:web        # ESLint: `src/`, `e2e/`, root configs only
npm run lint:server     # ESLint: `server/` only
npm run lint            # `lint:web` + `lint:server`
npm run lint:fix        # ESLint --fix both

# Unit + integration (server Vitest + client Vitest)
npm test

# Full suite including browser smoke E2E (Playwright)
npm run test:all

# Only server (includes MongoMemoryReplSet — first run downloads MongoDB binaries)
npm run test:server

# Only client (Vitest + Testing Library)
npm run test:client

# Only E2E (build + Vite preview + Playwright)
npm run test:e2e

# First time on a machine: install Playwright Chromium (~300MB)
npm run playwright:install
```

CI runs **server** (tests + Prettier + ESLint), **client** (format + `tsc` + ESLint web + Vitest), and **e2e** jobs in parallel (see `.github/workflows/ci.yml`).

## Quality & tooling

ChaiPoll includes production-ready tools for code quality, testing, and documentation.

### Code quality

- **ESLint** + **Prettier** for automated linting and formatting.

```bash
npm run lint:fix      # Fix linting issues
npm run format        # Format code
npm run lint          # Check for issues
```

### Testing

- **Comprehensive E2E tests** for full user-flow coverage.

```bash
npm run test:e2e      # Run all E2E tests
```

- Includes test coverage for poll creation, voting, analytics, and results publishing.

### Error handling

- **Error boundaries** for graceful error recovery UI.
- **Toast notifications** for user-friendly feedback.
- **Request logging** with structured Winston logs.

### API documentation

- **Swagger UI** at `/api-docs`
  - Access: `http://localhost:5000/api-docs` (when server is running)
  - Try endpoints directly from the browser
  - Includes request/response examples

### TypeScript ready

- **Type definitions** for frontend and backend.
- **Migration path** for incremental TypeScript adoption.

```bash
npm run typecheck     # Check TypeScript errors
```

## Deploy checklist (Render API + Vercel/static frontend)

### Backend (Render)

- Root directory: `server` (or start command `cd server && npm start`).
- `NODE_ENV=production`
- `PORT` (Render sets this automatically; code uses `process.env.PORT`)
- `MONGODB_URI`, `JWT_SECRET` (long random value)
- `CLIENT_URL` = **exact** frontend origin used by browser (e.g. `https://chai-poll.vercel.app`)
- `ALLOWED_ORIGINS` = optional extra origins (comma-separated). Server merges `CLIENT_URL` and local dev URLs automatically, but you can still add preview domains.
- Google: `GOOGLE_CALLBACK_URL` = `https://<your-service>.onrender.com/api/auth/google/callback` and must match Google Cloud console.
- Email: `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` (verified sender in Brevo).

### Frontend (Vercel)

- `VITE_API_URL` = `https://<your-service>.onrender.com/api`
- `VITE_SOCKET_URL` = `https://<your-service>.onrender.com` (no trailing slash)

### Cookies

Cross-site JWT cookies use `SameSite=None` + `Secure` in production. Frontend and API must both be **HTTPS**.

## Environment variables

```env
# Server — see server/.env.example
PORT=5000
MONGODB_URI=...
JWT_SECRET=...
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app

# Client
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Roadmap ideas

- Deeper Playwright flows (logged-in poll creation) against a disposable stack or preview URL.
- MSW-backed component tests for dashboard data states.

---

Built for builders who like polls and sharp UIs.
