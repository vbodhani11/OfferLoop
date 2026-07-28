# OfferLoop

**A fictional career simulator for real job-search stress.**
_Get the offer. Make the decision. Repeat the loop._

OfferLoop is a clearly labeled entertainment simulation — not a real job board. It has
two modes:

- **Accept Mode** — browse fictional jobs, "apply," watch an animated fictional
  review, and always receive an instant simulated offer.
- **Reject Mode** — play a fictional recruiter, swiping through fictional candidate
  profiles to reject, shortlist, or send simulated offers.

No real jobs, employers, candidates, recruiters, salaries, or offers are involved.
Every disclosure required by the product brief is visible throughout the app — see
`/simulation`.

## Screenshots

> Add screenshots after your first local run: `docs/screenshots/homepage.png`,
> `docs/screenshots/accept-mode.png`, `docs/screenshots/reject-mode.png`,
> `docs/screenshots/offer-celebration.png`.

## Feature Summary

- Original OfferLoop brand: loop-mark logo, warm-neutral + navy palette with emerald
  (Accept) / coral (Reject) / indigo (brand) accents, light & dark themes.
- Animated homepage hero, mode-selection preview, and premium application-review /
  offer-celebration sequences (Framer Motion, reduced-motion aware).
- Accept Mode: 38 fictional jobs across 18 fictional companies, search/filter/sort
  with URL-persisted state, save/skip/apply interactions, job details, animated
  review, offer celebration + share card.
- Reject Mode: 40 fictional candidates, drag/swipe + button + full keyboard deck
  controls, reject/shortlist/simulated-offer animations, undo, deck reset.
- Guest mode works fully offline via validated localStorage; signing in offers an
  idempotent migration of guest offers/saved jobs into Supabase.
- Supabase Postgres schema + Row Level Security policies isolate every user's data;
  fictional content (jobs/candidates/organizations) is public-read, write-restricted.
- Installable PWA with offline fallback and a non-intrusive install prompt.
- Vitest + React Testing Library unit/component tests, Playwright e2e specs, GitHub
  Actions CI.

### Accept Mode

Fictional job seeker experience: `/accept` → job details → Apply → animated review
(`SIMULATION IN PROGRESS`) → celebration screen with a fictional offer that is always
accepted. Offers save to `/offers`.

### Reject Mode

Fictional recruiter experience: `/reject` deck of candidate cards → reject (←),
shortlist (→), simulated offer (↑), undo (Z), reset (R). Every profile is fictional
and disclosed as such.

### Simulation Boundaries

See `/simulation` for the full disclosure. In short: nothing in OfferLoop is a real
job, employer, candidate, or offer; no legal or financial value attaches to any
generated content; OfferLoop is not affiliated with LinkedIn or any real platform and
is not a mental-health treatment.

## Technology Stack

Next.js (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Radix UI
primitives (shadcn/ui-style components) · Framer Motion · lucide-react · Supabase
(Postgres + Auth) via `@supabase/ssr` · Zod · React Hook Form · Sonner · canvas-
confetti · Vitest · React Testing Library · Playwright · ESLint · Prettier · Husky +
lint-staged · GitHub Actions · Vercel.

## Architecture

See `ARCHITECTURE.md` for the full write-up. In short: a repository pattern
(`src/lib/repositories`) abstracts persistence behind `Local*` (seed data +
localStorage) and `Supabase*` implementations, selected automatically based on
whether Supabase env vars are present and whether a user is authenticated. UI
components never talk to Supabase or localStorage directly.

## Folder Structure

```text
src/
  app/            (marketing)  (auth)  (app)  api/  globals.css  layout.tsx …
  components/     branding/ layout/ navigation/ ui/ feedback/ motion/ pwa/
  features/       accept/ reject/ offers/ saved-jobs/ auth/ profile/ settings/
                  guest-migration/
  lib/            supabase/ repositories/ storage/ analytics/ validation/ motion/
                  formatting/ accessibility/ constants/ errors.ts
  data/           organizations.ts jobs.ts candidates.ts
  types/          database.ts domain.ts
  test/           fixtures/ utilities/
supabase/         migrations/ seed.sql tests/
public/           icons/ illustrations/ sounds/
e2e/              playwright specs
```

## Local Installation

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo Mode (No Supabase Needed)

If `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set, OfferLoop
automatically runs in **Local Demo Mode**: fictional jobs/candidates come from
`src/data/*`, and guest offers/saved jobs/actions persist in `localStorage`. A small
"Demo Mode" badge appears in development only. Nothing crashes and no technical
errors are shown to end users.

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

## Supabase Setup

Full manual steps: `DEPLOYMENT.md`. Summary:

```bash
# 1. Create a Supabase project, then run the migrations in the SQL editor (or CLI):
#    supabase/migrations/0001_init.sql
#    supabase/migrations/0002_row_level_security.sql
# 2. Load fictional seed data:
#    supabase/seed.sql
# 3. Copy the Project URL + anon key into .env.local (see above).
```

## Migration & Seed Commands

```bash
# Apply migrations with the Supabase CLI (optional, or paste into the SQL editor):
supabase db push
# Regenerate supabase/seed.sql from the canonical TS data:
npm run db:generate-seed
```

## Development Commands

```bash
npm run dev            # start dev server
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run test           # vitest run (102 unit + component tests)
npm run test:watch     # vitest --watch
npm run test:coverage  # vitest run --coverage
npm run test:e2e       # playwright test (run `npx playwright install --with-deps` first)
npm run build          # production build
npm run start          # run production build
npm run format         # prettier --write
npm run format:check   # prettier --check (used in CI)
```

## Git Hooks (Optional)

A `.husky/pre-commit` hook (running `lint-staged`) is included. To activate it in
your local clone, run `npx husky init` once (this updates your local git config's
`core.hooksPath`, which we intentionally do not do automatically on your behalf).

## PWA Setup

OfferLoop ships a web app manifest, icon set, and a minimal service worker
(`public/sw.js`) registered in `src/components/pwa/ServiceWorkerRegister.tsx`,
providing an offline fallback route (`/offline`) and cached static assets. Install is
suggested only after a user completes a fictional application or several Reject Mode
decisions, and the dismissal is remembered.

## Vercel Deployment

```bash
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard. See `DEPLOYMENT.md` for the full
20-step checklist (Supabase redirect URLs, env vars, verification steps).

## Netlify (Optional)

Works via the official Next.js Runtime plugin when the repo is connected in the
Netlify UI; same environment variables as Vercel. Best-effort only — Vercel is the
primary, fully verified target.

## GitHub Actions

`.github/workflows/ci.yml` runs install → typecheck → lint → format check → unit/
component tests → build → Playwright end-to-end tests (all 36 specs, required —
uploads the HTML report as an artifact on failure) on every PR/push to `main`,
with npm and Playwright-browser dependency caching.

## Troubleshooting

- **Blank/soft-crash auth pages:** Supabase env vars are missing — this is expected
  in Demo Mode; auth pages explain that sign-in requires configuration.
- **Stale guest data after sign-in:** re-open the migration prompt from `/settings`;
  migration is retryable and idempotent.
- **Animations feel disabled:** check OS "reduce motion" setting and the in-app
  Settings → Reduced Motion toggle.

## Security & Privacy Notes

See `SECURITY.md` and `/privacy`, `/simulation`. RLS is enabled on every user table;
the service-role key never ships to the client; analytics are opt-in and anonymized.

## Known Limitations

- The Supabase SQL migrations, RLS policies, and `supabase/tests/rls_verification.sql`
  were validated against a local ephemeral Postgres instance during development, but
  have not been run against a real hosted Supabase project — do that once as part of
  your first deployment (see `DEPLOYMENT.md`).
- PWA icons are generated as simple original SVG/PNG assets, not custom illustration
  work.
- Email delivery (verification/reset) depends on your Supabase project's email
  provider configuration.

## Future Improvements

- Add more fictional job/candidate categories and localized copy variants.
- Add an admin-only script to rotate/expand seed content without redeploying.
- Add optional privacy-friendly analytics provider wiring (Plausible/Umami) behind
  the existing abstraction.

## License

MIT — see `LICENSE` (add your preferred license text before public release).
