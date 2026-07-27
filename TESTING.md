# OfferLoop — Testing Strategy

## 1. Tooling

- **Vitest** + **@testing-library/react** for unit and component tests
  (`npm run test`, `npm run test:watch`).
- **Playwright** for end-to-end tests (`npm run test:e2e`), run against `next build &&
next start` for realistic behavior.
- Tests live under `src/**/__tests__` (unit/component, colocated with the code they
  test) and `e2e/` (Playwright specs), with shared fixtures in `src/test/fixtures` and
  helpers in `src/test/utilities`.

## 2. Unit Test Coverage

`src/lib/formatting`, `src/lib/repositories/local/*`, `src/features/*/services`,
`src/lib/motion`, `src/lib/storage`:

- Currency & salary-range formatting.
- Fictional offer-message + start-date generation.
- Job search / filter / sort logic.
- Candidate deck ordering & undo/redo stack behavior.
- Reject / shortlist / simulated-offer action reducers.
- Deck reset semantics (candidate returns, session-only removal).
- Duplicate application/offer prevention (unique-key checks).
- Guest offer & saved-job persistence (localStorage read/write round-trip).
- LocalStorage Zod validation (rejects malformed/corrupt data safely).
- Guest → Supabase migration mapping (idempotency, dedupe by natural key).
- `usePrefersReducedMotion` / celebration-intensity animation-preference logic.
- Repository-selection logic (`getRepositories()` picks local vs Supabase correctly).
- Simulation-badge/disclosure copy logic.

## 3. Component Tests

`AppHeader`, `SimulationBadge`, `SimulationDisclosure`, `JobCard`, `JobFilters`,
`CandidateCard`, `CandidateActionButtons`, `ApplicationReview`, `OfferCelebration`,
`OfferCard`, `EmptyState`, `ErrorState`, `ThemeToggle`, `ReducedMotionToggle` — each
verifies rendered content, accessible names/roles, and key interaction outcomes
(e.g. clicking Reject calls the reject handler; toggling theme updates `aria-pressed`).

## 4. End-to-End (Playwright)

Specs under `e2e/`: `homepage.spec.ts`, `accept-mode.spec.ts`, `reject-mode.spec.ts`,
`accessibility.spec.ts`, `error-handling.spec.ts` — covering the flows enumerated in
the build brief (homepage disclosures/nav, full accept-mode apply→offer→persist loop,
reject-mode swipe/undo/reset/keyboard loop, keyboard-only + focus-trap + reduced-
motion checks, not-found/retry/offline/demo-mode fallbacks).

Tests avoid brittle fixed `waitForTimeout` calls in favor of semantic
locators/`expect(...).toBeVisible()` polling, and only use `data-testid` where no
accessible role/label/text is available (e.g. distinguishing duplicate visual card
instances in the deck).

## 5. Running Tests

```bash
npm run test          # vitest run (unit + component)
npm run test:watch    # vitest watch mode
npm run test:e2e      # playwright (requires: npx playwright install --with-deps)
```

## 6. CI

GitHub Actions (`.github/workflows/ci.yml`) runs typecheck → lint → unit tests →
build → (best-effort) Playwright on every PR and push to `main`, with dependency and
Playwright-browser caching. The workflow fails the check run on any non-zero exit.
