# OfferLoop — Architecture

## 1. Stack

- **Framework:** Next.js (App Router, React Server Components) + React 19 + TypeScript
  (strict).
- **Styling:** Tailwind CSS v4 (CSS-first config via `@theme`), hand-built shadcn/ui-style
  primitives (Radix UI primitives + `class-variance-authority`).
- **Motion:** Framer Motion.
- **Icons:** lucide-react.
- **Forms/validation:** React Hook Form + Zod.
- **Backend:** Supabase (Postgres + Auth) via `@supabase/ssr`, optional — the app runs
  fully without it (Local Demo Mode).
- **Testing:** Vitest + React Testing Library (unit/component), Playwright (e2e).
- **Tooling:** ESLint, Prettier, Husky + lint-staged, GitHub Actions.

## 2. Rendering Strategy

- Marketing pages (`(marketing)`) are server components by default for fast, SEO-
  friendly loads; interactive pieces (hero animation, mode-preview cards, theme
  toggle) are isolated client components.
- Accept/Reject app surfaces are client-heavy (drag, animation, local/session state)
  but data (`data/*.ts` fictional seed content) is imported directly — no network
  waterfall required in demo mode.
- Auth-aware pages (`/offers`, `/saved`, `/profile`, `/settings`) read the Supabase
  session server-side when configured, and fall back to guest/local state otherwise.

## 3. Repository Pattern

All persistence goes through repository interfaces in `src/lib/repositories/types.ts`:
`JobsRepository`, `CandidatesRepository`, `ApplicationsRepository`, `OffersRepository`,
`SavedJobsRepository`, `ProfileRepository`, `ActionsRepository`.

Two implementations exist per repository:

- `Local*Repository` — reads fictional seed data from `src/data/*`, and read/writes
  guest state to `localStorage` (validated with Zod), used automatically when
  Supabase env vars are absent, or explicitly for guests.
- `Supabase*Repository` — reads/writes Postgres via `@supabase/ssr` clients, used when
  a user is authenticated and Supabase is configured.

`src/lib/repositories/index.ts` exposes `getRepositories()` which inspects
`isSupabaseConfigured()` and the current auth state to return the correct
implementation set. UI code never imports a concrete repository directly.

This keeps database access out of components and keeps business rules (duplicate
prevention, undo, migration) unit-testable in isolation from React and Supabase.

## 4. Guest State & Migration

Guest data lives in namespaced, versioned localStorage keys (see `DATABASE.md` §Local
Storage). On sign-in/sign-up, `src/features/guest-migration` validates local guest
records with Zod, then calls the Supabase repositories to idempotently insert only
valid, non-duplicate records (matched by natural keys like `job_id` for saved jobs/
offers), before clearing local keys — only after the Supabase writes succeed. The
migration function is pure/testable and safe to re-run (idempotent upserts / duplicate
checks by unique constraint).

## 5. File Structure

See root `README.md` for the full annotated tree; the app follows the structure
requested in the build brief: `src/app` (routes), `src/components` (design-system
primitives + branding + layout + feedback + motion), `src/features/*` (domain logic
per feature area: accept, reject, offers, saved-jobs, auth, profile, settings, guest-
migration), `src/lib/*` (supabase clients, repositories, storage, analytics,
validation, motion helpers, formatting, accessibility helpers, constants),
`src/data/*` (canonical fictional seed data, shared by demo mode, Supabase seed SQL
generation, and tests), `src/types/*`, `src/test/*`, `supabase/*` (migrations, seed,
RLS verification), `public/*` (icons, manifest, sounds).

## 6. State Management

- **URL state:** search/filter/sort query params for job & candidate browsing
  (`nuqs`-style manual `useSearchParams`/`router.replace`, no extra dependency).
- **Server/repository state:** offers, saved jobs, applications, profile.
- **React local state:** individual component interaction (open/closed, form values).
- **Context:** only for truly global, cross-page concerns — `GuestSessionProvider`
  (anonymous session id + guest profile), `MotionPreferenceProvider` (reduced motion +
  celebration intensity), `ToastProvider` (Sonner), `DeckSessionProvider` (Reject Mode
  in-memory deck + undo stack for the current tab).
- No Redux; no global store beyond the above narrow contexts.

## 7. Route Map

Route groups: `(marketing)` — `/`, `/about`, `/privacy`, `/terms`, `/simulation`,
`/contact`; `(auth)` — `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`;
`(app)` — `/accept`, `/accept/jobs/[slug]`, `/accept/review/[jobId]`, `/reject`,
`/reject/candidates/[slug]`, `/offers`, `/offers/[id]`, `/saved`, `/profile`,
`/settings`. Root-level: `/offline`, global `not-found.tsx`, `global-error.tsx`, and
per-segment `loading.tsx`/`error.tsx` where interaction is async (accept, reject,
offers, saved).

## 8. Environment-Aware Behavior

`src/lib/supabase/config.ts` exports `isSupabaseConfigured()` (checks
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`). When false: a small
"Demo Mode" badge renders in development only, all data comes from local seed +
localStorage, and auth routes explain that sign-in requires Supabase configuration
without throwing or logging noisy errors.
