# FoodSport Frontend

Next.js App Router surface for FoodSport's user-facing and admin portals. The app localizes every public route, talks to Supabase for auth/storage, and reads/writes application data through Prisma.

## Highlights

- **Two surfaces, one repo** – locale-aware public/user flows live in `src/app/[locale]/**`, while `/admin` hosts a standalone admin experience with its own contexts and auth token handling.
- **Supabase-first auth** – server handlers create Supabase server clients (`src/lib/supabase/server-only.js`) and enforce access via Prisma-backed guards (`requireAdmin`, `requireUser`).
- **Prisma domain layer** – schema + helpers (`src/lib/prisma/**`) centralize data access, transactions, and badge workflows so API routes stay thin.
- **Gamification toolkit** – badge rules, evaluators, and QA scripts live under `src/lib/badges` + `scripts/evaluate-*.js`, keeping reward logic consistent across APIs, jobs, and manual runs.

## Tech Stack

- **Runtime**: Next.js 15 (App Router) + React 19 + Turbopack dev server
- **State & data**: Prisma 6, Supabase Auth/Storage, Next Intl, Axios
- **Styling**: Tailwind CSS + DaisyUI + scoped admin CSS
- **Tooling**: TSX test runner, node:test + assert, Supabase CLI (optional)

## Project Structure

```
src/
  app/
    [locale]/          # Public + authenticated user flows, localized via next-intl
    admin/             # Non-localized admin routes (login + logged-in shell)
    api/               # Route handlers (REST-ish) sharing Prisma + Supabase helpers
    shared/            # Reusable components, CSS, and React contexts
  i18n/                # Locale config, helpers, and translation messages
  lib/
    prisma/            # Prisma client + guard utilities
    supabase/          # Browser/server client factories
    badges/            # Rule evaluators, validators, helpers
  utils/               # Axios instance, validation, sanitize, misc helpers
docs/                  # User/admin stories, API notes, i18n guides
prisma/                # Prisma schema + generated migrations
scripts/               # DB setup/seed + badge/redemption QA runners
```

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` → `.env.local` (and `.env` for Supabase CLI if needed).
   - Fill Supabase keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`), Prisma `DATABASE_URL`, and JWT/AES secrets used by auth guards.
3. **Run database migrations** (requires `DATABASE_URL`)

   ```bash
   npm run db:migrate
   npm run db:generate
   ```

4. **Start dev server** (Turbopack + React 19)

   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000`. Middleware auto-redirects to `/en` or `/zh-HK` depending on Accept-Language/cookies.

### Optional local Supabase

- `supabase/config.toml` contains the CLI config (API 54321, DB 54322). Run `supabase start` to spin up a full stack for offline testing. To open **local supabase UI** visit `http://127.0.0.1:54323/`

### Local nginx reverse proxy

1. Install nginx (Ubuntu: `sudo apt install nginx`, Red Hat: `sudo dnf install nginx`).
2. Drop the config below into `/etc/nginx/conf.d/foodsport.conf`, then symlink it into `sites-enabled`.
3. Reload nginx (`sudo nginx -s reload`) after validating with `sudo nginx -t`.

```nginx
server {
  # Global Settings
  listen 80 default_server;
  server_name _;
  client_max_body_size 50M;

  # Endpoint to check VM's health
  location /__health {
    return 200 'ok';
    add_header Content-Type text/plain;
  }

  # Supabase Bucket
  location /storage/ {
    proxy_pass http://127.0.0.1:54321;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Supabase Auth
  location /auth/ {
    proxy_pass http://127.0.0.1:54321;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Supabase Studio UI
  location /supabase/ {
    proxy_pass http://127.0.0.1:54323/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off; # Required for Supabase Studio assets + routing
  }

  # Default app
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffer_size 64k;
    proxy_buffers 16 32k;
    proxy_busy_buffers_size 64k;
  }
}
```

## Environment Reference

- `NEXT_PUBLIC_BASEURL` – Axios base URL (dev defaults to `/api`). Required for `src/utils/axios/api.js` refresh logic.
- `INTERNAL_API_SECRET` – header token that lets automation hit admin APIs without cookie auth.
- `JWT_SECRET` / `AES_SECRET` – used by cookie tokens and encrypted payloads.
- `PRISMA_TRANSACTION_*` – optional overrides for long-running badge evaluators.

Check `.env.example` for the full list and keep values in sync with Supabase project settings.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev with Turbopack |
| `npm run dev-build` | Dry-run production build without migrations |
| `npm run build` | `db:generate` + `db:migrate` + `next build` |
| `npm start` | Run compiled Next.js server |
| `npm test` | Node's `node:test` via `tsx --test tests/**/*.test.js` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` (creates/updates migrations) |
| `npm run db:push` | Sync schema without migration files |
| `npm run db:reset` | Reset database + reapply migrations |
| `npm run studio` | Prisma Studio UI |
| `npm run sb:start` | Start local supabase |
| `npm run sb:stop` | Stop local supabase |

## Database & Seeding Workflows

- **Initial schema**: `npx tsx scripts/setup-database.js` streams `src/lib/supabase/schema.sql` through a PG connection (needs `SUPABASE_DB_URL`).
- **Seed sample data**: `npx tsx scripts/seed-database.js` inserts demo users, activities, charities, and badges. The script refuses to run in prod unless confirmed interactively.
- **Badge QA**:

  ```bash
  npx tsx scripts/evaluate-badges.js --userId <uuid> [--activityId <uuid>]
  npx tsx scripts/evaluate-redemptions.js --userId <uuid>
  ```

  These scripts reuse the same evaluators the API calls, so they are safe for manual verification against staging snapshots.

## Testing Strategy

- Fast unit/integration tests live under `tests/*.test.js` (e.g., `tests/apiBadgeFlow.test.js`, `tests/badgeRules.test.js`).
- Tests run via Node's native runner; add new suites next to the features you build and avoid coupling to Supabase by mocking Prisma calls where possible.

## Key Concepts

- **Middleware-driven locale routing** (`src/middleware.js`)
  - Adds locale prefixes automatically, corrects aliases (`/z` → `/zh-HK`).
  - Redirects unauthenticated `/[locale]/my/**` visitors to `/[locale]/auth/login`.
  - Redirects authenticated `/activities` hits to `/[locale]/my/activities` to keep UX consistent.
- **Shared contexts** (`src/app/shared/contexts/*`)
  - `ActivitiesProvider` fetches `/api/activities` once and feeds landing pages.
  - Admin layout composes providers for users, activities, products, categories, social images, verified attendees, and dashboard stats.
- **Axios refresh flow** (`src/utils/axios/api.js`)
  - Automatically refreshes Supabase sessions for user and admin tokens; on failure it clears local storage and redirects to the relevant login route.
- **Badge rules**
  - Rule definitions and enums: `src/app/constants/constants.js` + Prisma `BadgeRuleType` enum.
  - Validation + coercion: `src/lib/badges/ruleValidation.js` ensures admin payloads only create supported rule types.
  - Evaluation: `src/lib/badges/ruleEvaluator.js` groups rules, re-checks participation/calorie stats, and writes to `userBadge` via Prisma transactions.
