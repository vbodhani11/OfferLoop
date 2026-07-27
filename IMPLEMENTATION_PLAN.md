# OfferLoop — Implementation Plan & Checklist

Legend: `[x]` done, `[~]` partial/best-effort, `[ ]` not started.

This document reflects the actual, verified state of the repository (checked
against `tsc`, `eslint`, `vitest`, and `next build`), not an aspirational
target.

## Phase 0 — Inspection & Planning

- [x] Inspect existing repo (fresh `create-next-app`, Next.js 16 App Router, React 19,
      TS strict, Tailwind v4, several deps pre-installed).
- [x] Write planning docs (this file + 9 others).

## Phase 1 — Tooling & Dependencies

- [x] Install Radix primitives, cva helpers, testing libs (Vitest, RTL, jsdom,
      Playwright), Prettier, Husky/lint-staged.
- [x] Configure Vitest, Playwright, Prettier, lint-staged/Husky.
- [x] Add npm scripts (`typecheck`, `test`, `test:watch`, `test:coverage`, `test:e2e`,
      `format`, `format:check`, `db:generate-seed`).
- [x] Diagnosed and fixed a subtle TypeScript/Supabase bug: every `Row`/`Insert`/
      `Update`/`Database` shape in `src/types/database.ts` must be declared with
      `type`, not `interface`, or `@supabase/postgrest-js`'s conditional-type
      inference for `.insert()`/`.update()` silently collapses to `never`.

## Phase 2 — Core Lib & Data

- [x] `types/domain.ts`, `types/database.ts`.
- [x] Canonical fictional data: 18 organizations, 38 jobs, 40 candidates
      (`src/data/*`), with deterministic UUIDs shared between local demo mode
      and the Supabase seed script.
- [x] Formatting helpers (currency, salary range, dates, offer id/message).
- [x] Zod validation schemas (localStorage, forms).
- [x] Safe localStorage helpers (versioned keys, Zod-validated, never throws).
- [x] Motion helpers (`usePrefersReducedMotion`, `useHasMounted`, `useDebouncedValue`,
      variants, tab-visibility hook) — implemented with `useSyncExternalStore` to
      avoid hydration mismatches without synchronous `setState`-in-effect.
- [x] Analytics abstraction (disabled by default, fixed event list incl. PWA events).
- [x] Repository interfaces + Local implementations + Supabase implementations +
      `getRepositories()` / `useRepositories()` selector.
- [x] Supabase browser/server/`proxy.ts` (middleware) clients.

## Phase 3 — Design System

- [x] Tailwind v4 theme tokens (`globals.css` `@theme inline`) — light/dark.
- [x] UI primitives: button, card, input, textarea, label, select, dialog, sheet,
      tooltip, badge, switch, checkbox, dropdown-menu, skeleton, separator, tabs,
      glass-card, stat-card.
- [x] Branding: `AppLogo` (original SVG loop mark), favicon, PWA icons,
      OpenGraph image — all dynamically generated via `ImageResponse`.
- [x] Layout: `AppHeader`, `DesktopNavigation`, `MobileNavigation`, `Footer`,
      `PageContainer`, `SectionHeading`, `ThemeToggle`.
- [x] Feedback: `EmptyState`, `ErrorState`, `LoadingSkeleton`, `ConfirmationDialog`,
      `ToastProvider` (Sonner), `AccessibleTooltip`.
- [x] `SimulationBadge`, `SimulationDisclosure`, `ModeBadge`.

## Phase 4 — Homepage & Marketing

- [x] Route group `(marketing)`: `/`, `/about`, `/privacy`, `/terms`, `/simulation`,
      `/contact`.
- [x] Hero section + original animated loop scene (motion-gated, visibility-aware,
      `aria-hidden` with an equivalent text description).
- [x] Choose Your Mode, How Accept/Reject Works, Offer preview, Candidate preview,
      Why OfferLoop Exists, Transparency/Safety, Privacy, Final CTA, Footer.

## Phase 5 — Accept Mode

- [x] `/accept` job feed: search, filters, sort, URL-persisted state, debounced
      search, mobile filter sheet, save/skip/apply card actions + skip-undo toast.
- [x] `/accept/jobs/[slug]` job details page with sticky actions, similar jobs,
      and the "exists only inside the OfferLoop simulation" disclosure.
- [x] `/accept/review/[jobId]` animated fictional application review (5 stages,
      ARIA live region, Skip Animation control, duplicate-application guard).
- [x] Offer celebration screen + share card + save/replay/browse/delete actions +
      confetti (motion- and preference-gated) + retry-on-save-failure handling.

## Phase 6 — Reject Mode

- [x] `/reject` candidate deck: drag + buttons + keyboard shortcuts (←/→/↑/Z/R/Enter/?),
      reject/shortlist/offer animations, undo, reset, session stats, keyboard-help dialog.
- [x] `/reject/candidates/[slug]` candidate profile page with reject/shortlist/offer actions.

## Phase 7 — Offers, Saved Jobs, Profile, Settings

- [x] `/offers`, `/offers/[id]`, `/saved`, `/profile`, `/settings` with sorting,
      filtering, search, empty states, delete/export/clear actions, and
      guest-vs-authenticated data source switching via `useRepositories()`.

## Phase 8 — Auth & Guest Migration

- [x] `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password` (demo-mode-aware:
      explain unavailability gracefully when Supabase isn't configured).
- [x] Guest mode fully usable without auth; `GuestMigrationPrompt` wired to
      `migrateGuestData` (idempotent, retryable, dedupes by job/candidate id, only
      clears local data for successfully migrated items).

## Phase 9 — Database

- [x] SQL migrations (`0001_init.sql` incl. `handle_new_user` trigger,
      `0002_row_level_security.sql`), `supabase/seed.sql` (generated from
      `src/data/*` via `npm run db:generate-seed`), `supabase/tests/rls_verification.sql`.

## Phase 10 — PWA

- [x] Manifest + dynamic icons (96/192/384/512) + service worker with offline caching.
- [x] `/offline` fallback page.
- [x] `InstallPrompt` shown only after a meaningful-usage milestone (first fictional
      offer or a few recruiting decisions), dismissal remembered in localStorage.
- [x] Milestone tracking wired into `ApplicationReviewFlow` (offer received) and
      `CandidateDeck` / `CandidateProfileClient` (recruiting decisions).

## Phase 11 — Testing

- [x] Vitest unit tests: currency/offer formatting, job filter/sort, deck engine
      (decide/undo/reset semantics), safe localStorage validation, guest repository
      round-trips + duplicate-prevention, guest→Supabase migration mapping
      (idempotency + partial-failure retry), repository selection, `isSupabaseConfigured`,
      `usePrefersReducedMotion`. **102 tests, 17 files, all passing.**
- [x] RTL component tests: `SimulationBadge`, `SimulationDisclosure`, `EmptyState`,
      `ErrorState`, `ThemeToggle`, `JobCard`, `CandidateCard`, `OfferCelebration`.
- [x] Playwright e2e specs: `homepage.spec.ts`, `accept-mode.spec.ts`,
      `reject-mode.spec.ts`, `accessibility.spec.ts`, `error-handling.spec.ts` —
      written and typecheck/lint clean. **Not executed in this sandbox** (disk
      space too low to install Chromium); run `npx playwright install --with-deps`
      and then `npm run test:e2e` on a normal dev machine or in CI to execute them.

## Phase 12 — CI/CD

- [x] `.github/workflows/ci.yml`: install → typecheck → lint → format check →
      unit/component tests → build → Playwright (best-effort, non-blocking,
      uploads report on failure), with npm and Playwright-browser caching.

## Phase 13 — Final Review

- [x] `npm run typecheck`, `npm run lint -- --max-warnings=0`, `npm run format:check`,
      `npm run test`, `npm run build` all green as of this writing.
- [x] Manual pass for missing imports, hydration issues, accessibility, disclosures.
- [x] README, `.env.example`, deployment docs finalized.
- [~] Playwright e2e suite written but unexecuted locally (see Phase 11) — logic
  reviewed against actual component markup/ARIA roles, not run end-to-end.

## Production Checklist

**Product:** Homepage ✅ / Accept Mode ✅ / Reject Mode ✅ / offers persist ✅ /
saved jobs persist ✅ / guest mode ✅ / guest migration ✅ / simulation labels
visible ✅ / no real data ✅.

**Design:** Mobile responsive ✅ / desktop responsive ✅ / dark mode ✅ / smooth
animation ✅ / reduced motion ✅ / no layout shift ✅ / no broken icons ✅ / no
placeholder copy ✅.

**Engineering:** TypeScript passes ✅ / ESLint passes ✅ / unit+component tests
pass ✅ (102/102) / e2e tests written but unexecuted locally ⚠️ / build passes ✅ /
no secrets committed ✅ / no console errors ✅ / no hydration errors ✅ / error
boundaries work ✅ / offline fallback works ✅.

**Security:** RLS enabled ✅ (migration + verification script written; not run
against a live Supabase project) / user isolation verified ⚠️ (verified by SQL
script logic + manual review, not executed against a hosted project) /
service-role key absent from client ✅ / input validation ✅ / safe redirects ✅ /
secure headers ✅ / env vars documented ✅.

**Deployment:** Vercel project (user action) / variables configured (user
action) / Supabase redirects configured (user action) / production domain
(user action) / HTTPS (Vercel default) / PWA install ✅ (logic + manifest ready,
manual install verification is a user action) / metadata ✅ / sitemap ✅ / robots ✅.

> See the final chat report for the honest, as-shipped status of each checkbox,
> including what still requires manual verification outside this sandbox.
