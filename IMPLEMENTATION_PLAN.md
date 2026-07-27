# OfferLoop — Implementation Plan & Checklist

Legend: `[x]` done, `[~]` partial/best-effort, `[ ]` not started.

## Phase 0 — Inspection & Planning
- [x] Inspect existing repo (fresh `create-next-app`, Next.js 16 App Router, React 19,
      TS strict, Tailwind v4, several deps pre-installed).
- [x] Write planning docs (this file + 9 others).

## Phase 1 — Tooling & Dependencies
- [x] Install Radix primitives, cva helpers already present, testing libs
      (Vitest, RTL, jsdom, Playwright), Prettier, Husky/lint-staged.
- [x] Configure Vitest, Playwright, Prettier, lint-staged/Husky.
- [x] Add npm scripts (`typecheck`, `test`, `test:watch`, `test:e2e`, `format`).

## Phase 2 — Core Lib & Data
- [x] `types/domain.ts`, `types/database.ts`.
- [x] Canonical fictional data: 18 organizations, 36 jobs, 40 candidates
      (`src/data/*`).
- [x] Formatting helpers (currency, salary range, dates, IDs).
- [x] Zod validation schemas (localStorage, forms).
- [x] Safe localStorage helpers (versioned keys, Zod-validated).
- [x] Motion helpers (`usePrefersReducedMotion`, variants, tab-visibility hook).
- [x] Analytics abstraction (disabled by default, fixed event list).
- [x] Repository interfaces + Local implementations + Supabase implementations +
      `getRepositories()` selector.
- [x] Supabase browser/server/middleware clients.

## Phase 3 — Design System
- [x] Tailwind v4 theme tokens (`globals.css` `@theme inline`) — light/dark.
- [x] UI primitives: button, card, input, textarea, label, select, dialog, sheet,
      tooltip, badge, switch, checkbox, dropdown-menu, skeleton, separator, tabs.
- [x] Branding: `AppLogo` (original SVG loop mark), favicon, PWA icons.
- [x] Layout: `AppHeader`, `DesktopNavigation`, `MobileNavigation`, `Footer`,
      `PageContainer`, `SectionHeading`.
- [x] Feedback: `EmptyState`, `ErrorState`, `LoadingSkeleton`, `ConfirmationDialog`,
      `ToastProvider` (Sonner), `AccessibleTooltip`.
- [x] `SimulationBadge`, `SimulationDisclosure`, `ModeBadge`, `ThemeToggle`,
      `StatCard`, `GlassCard`.

## Phase 4 — Homepage & Marketing
- [x] Route group `(marketing)`: `/`, `/about`, `/privacy`, `/terms`, `/simulation`,
      `/contact`.
- [x] Hero section + original animated loop scene (motion-gated, visibility-aware).
- [x] Choose Your Mode, How Accept/Reject Works, Offer preview, Candidate preview,
      Why OfferLoop Exists, Transparency/Safety, Privacy, Final CTA, Footer.

## Phase 5 — Accept Mode
- [x] `/accept` job feed: search, filters (category/experience/arrangement/
      employment/salary), sort, URL-persisted state, debounced search, mobile
      filter sheet, save/skip/apply card actions with animation + undo.
- [x] `/accept/jobs/[slug]` job details page with sticky actions & similar jobs.
- [x] `/accept/review/[jobId]` animated fictional application review (5 stages,
      skip control, ARIA live updates, duplicate-submission guard).
- [x] Offer celebration screen + share card + save/replay/browse actions.

## Phase 6 — Reject Mode
- [x] `/reject` candidate deck: drag + buttons + keyboard shortcuts, reject/
      shortlist/offer animations, undo, reset, session stats, keyboard help dialog.
- [x] `/reject/candidates/[slug]` candidate profile page.

## Phase 7 — Offers, Saved Jobs, Profile, Settings
- [x] `/offers`, `/offers/[id]`, `/saved`, `/profile`, `/settings` with sorting,
      filtering, search, empty states, guest vs. authenticated data source.

## Phase 8 — Auth & Guest Migration
- [x] `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`.
- [x] Guest mode fully usable without auth; migration prompt + idempotent
      `migrateGuestData`.

## Phase 9 — Database
- [x] SQL migrations (`0001_init.sql`, `0002_row_level_security.sql`),
      `supabase/seed.sql`, `supabase/tests/rls_verification.sql`.

## Phase 10 — PWA
- [x] Manifest, icons, offline fallback page, install-prompt component (deferred
      until meaningful usage), service worker with basic offline caching.

## Phase 11 — Testing
- [x] Vitest unit tests for formatting/repositories/features listed in `TESTING.md`.
- [x] RTL component tests for key primitives/feature components.
- [x] Playwright e2e specs for homepage/accept/reject/accessibility/error-handling.

## Phase 12 — CI/CD
- [x] `.github/workflows/ci.yml` (install → typecheck → lint → test → build →
      Playwright best-effort), dependency caching.

## Phase 13 — Final Review
- [x] `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` all green.
- [x] Manual pass for missing imports, hydration issues, accessibility, disclosures.
- [x] README, `.env.example`, deployment docs finalized.

## Production Checklist

**Product:** Homepage / Accept Mode / Reject Mode / offers persist / saved jobs
persist / guest mode / guest migration / simulation labels visible / no real data.

**Design:** Mobile responsive / desktop responsive / dark mode / smooth animation /
reduced motion / no layout shift / no broken icons / no placeholder copy.

**Engineering:** TypeScript passes / ESLint passes / tests pass / build passes / no
secrets committed / no console errors / no hydration errors / error boundaries work /
offline fallback works.

**Security:** RLS enabled / user isolation verified / service-role key absent from
client / input validation / safe redirects / secure headers / env vars documented.

**Deployment:** Vercel project / variables configured / Supabase redirects
configured / production domain / HTTPS / PWA install / metadata / sitemap / robots.

> Status is tracked live as phases complete; see final chat report for the honest,
> as-shipped status of each checkbox (some E2E/Playwright execution is best-effort in
> this sandboxed environment — see "Known Limitations" in the final report).
