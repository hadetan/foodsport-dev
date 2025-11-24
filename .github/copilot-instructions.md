# Copilot Instructions for FoodSport

## Core Architecture
- Next.js App Router with locale-aware public/user routes in `src/app/[locale]/**` and a separate admin surface under `src/app/admin` (non-localized). `src/app/shared/**` hosts reusable UI, contexts, and CSS shared between areas.
- Internationalization relies on `next-intl`; `src/app/[locale]/layout.js` wires providers and locale metadata while `src/middleware.js` enforces locale prefixes, cookie persistence, and redirects between `/activities` and `/[locale]/my` based on auth.
- Supabase handles auth/storage; server components and API routes must import `createServerClient` from `src/lib/supabase/server-only.js`, while browser code gets a singleton via `src/lib/supabase/client.js`.
- Database access flows through Prisma (`src/lib/prisma/db.js`) with helper utilities in `src/lib/prisma/db-utils.js` plus policy wrappers like `requireAdmin`/`requireUser` that check JWT cookies and Supabase state before querying `prisma`.

## Data & Backend Patterns
- `prisma/schema.prisma` defines the core domain: `User`, `AdminUser`, `Activity`, `Ticket`, `Badge`, `BadgeRule`, `UserBadge`, `TempUser`, etc., plus enums for locales, rule types, and districts. Align API payloads with these names (e.g., camelCase on the app, snake_case via `@map` in DB).
- API routes live under `src/app/api/<segment>`; most start by creating a Supabase server client, calling `requireAdmin`/`requireUser`, validating bodies via `src/utils/validation.js`, and sanitizing whitelists via `src/utils/sanitize.js`. Use `NextResponse.json` for consistent outputs and `formatDbError` when surfacing Prisma issues.
- Administrative APIs often accept `x-internal-api` headers guarded by `INTERNAL_API_SECRET`; honor that pathway when composing internal jobs (see `requireAdmin` in `src/lib/prisma/require-admin.js`).
- Badge gamification logic is centralized in `src/lib/badges/ruleEvaluator.js` with rule metadata in `src/app/constants/constants.js` and validators in `src/lib/badges/ruleValidation.js`. Route handlers should delegate to these helpers rather than re-implement rule math.
- Shared Prisma helpers (`getMany`, `executeTransaction`, `getUserJoinedActivitiesWithDetails`, etc.) encapsulate pagination and composite keys—prefer them over raw `prisma.<model>` calls to keep error handling consistent.

## Frontend Patterns
- UI data is injected via context providers in `src/app/shared/contexts/*`. For example `ActivitiesProvider` fetches `/api/activities`, localizes via `src/i18n/localize.js`, and feeds landing components; admin dashboards rely on `UsersProvider`, `AdminActivitiesProvider`, and others declared in `src/app/admin/(logged_in)/layout.js`.
- Global loading feedback wires `react-top-loading-bar` through `LoadingBarProvider` (`src/app/shared/contexts/LoadingBarContext.js`), the root client loader (`src/app/client-loading-bar.js`), and Axios instrumentation (`src/utils/loadingBarEvents.js`). If you add HTTP clients, either reuse `src/utils/axios/api.js` or register the same interceptors.
- `src/utils/axios/api.js` relies on `NEXT_PUBLIC_BASEURL`, injects JSON headers, and refreshes both user and admin sessions automatically. Reuse this instance so token refresh + redirect semantics stay in one place.
- Tailwind (see `src/app/globals.css` and `tailwind.config.js`) is the styling baseline; admin pages add scoped CSS under `src/app/admin/(logged_in)/adminLayout.css` when Tailwind utilities are insufficient.
- Admin UI trusts the `admin_auth_token` in `localStorage` and will redirect to `/admin/login` if missing; match that expectation when shipping new admin routes or actions.

## Routing, i18n, and Middleware
- Locale detection and rewrites happen in `src/middleware.js`, including Accept-Language negotiation, alias correction (`/z` → `/zh-HK`), and guardrails that push unauthenticated users hitting `/[locale]/my` back to `/[locale]/auth/login`.
- Localized copy lives in `src/i18n/messages/**`; helpers like `pickLocalized` and `localizeActivities` convert DB bilingual fields (`title`, `titleZh`, etc.) into the active locale. Follow `docs/i18n/extensibility-notes.md` when adding locales or new bilingual columns.
- The admin area intentionally bypasses locale prefixes via middleware (see `localeAdminMatch` branch); do not nest `/admin` routes under `[locale]` or middleware will strip them.

## Developer Workflows & Tooling
- Install deps with `npm install` and run `npm run dev` (Next.js with Turbopack). The build pipeline (`npm run build`) automatically runs `prisma generate` and `prisma migrate dev` before `next build`; ensure your database is reachable or wrap those scripts when targeting CI.
- Standard Prisma commands are exposed as `npm run db:generate`, `db:migrate`, `db:push`, `db:reset`, and `studio`. Keep migrations in `prisma/migrations/**` up to date whenever `schema.prisma` changes.
- Database bootstrap lives in `scripts/setup-database.js` and `scripts/seed-database.js`. Both rely on `SUPABASE_DB_URL` for direct `pg` access, warn loudly in production, and stream SQL from `src/lib/supabase/schema.sql`/`seed.sql`—run them via `npx tsx` if you need repeatable environments.
- Badge QA helpers live in `scripts/evaluate-badges.js` and `scripts/evaluate-redemptions.js`; run with `npx tsx scripts/evaluate-badges.js --userId <uuid> [--activityId <uuid>]` after seeding sample data (see `tests.md` for payload templates).
- Tests reside under `tests/*.test.js` and execute with Node’s built-in runner via `npm test` (which runs `tsx --test`). Keep new logic covered by fast, dependency-free tests like `tests/apiBadgeFlow.test.js`.

## Documentation & Acceptance Criteria
- The `docs/` tree captures living requirements: `docs/stories.md` (user), `docs/admin-stories.md`, `docs/admin-api-stories.md`, and `docs/api_doc.md`. Before building a feature, confirm the story status and update checkboxes when shipping.
- Badge rule explanations, QA guides, and payload examples live in `docs/badge-multi-rule.md`, `docs/admin-badges-api.md`, and `tests.md`; reference these when adjusting gamification logic instead of guessing rule semantics.
- For localization or exclusion guidelines, consult `docs/i18n/*.md`; for database expectations, use `docs/database-setup.md` and `docs/prisma.md`. Keep these sources synchronized whenever schema, workflows, or acceptance criteria change.
