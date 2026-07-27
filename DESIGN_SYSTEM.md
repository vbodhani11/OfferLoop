# OfferLoop — Design System

All tokens are implemented as CSS custom properties in `src/app/globals.css` and exposed
to Tailwind v4 via the `@theme inline` block, so components must reference Tailwind
utility classes (e.g. `bg-surface`, `text-accent-accept`) rather than hard-coded colors.

## 1. Color Tokens

| Token | Purpose |
|---|---|
| `--color-background` | Warm neutral page background |
| `--color-surface` | Card / panel background |
| `--color-surface-muted` | Secondary panel background |
| `--color-foreground` | Deep navy/charcoal primary text |
| `--color-muted-foreground` | Accessible secondary text |
| `--color-border` | Subtle card borders |
| `--color-brand` | Indigo/purple — shared OfferLoop branding |
| `--color-brand-foreground` | Text/icon color on brand surfaces |
| `--color-accept` | Emerald green — Accept Mode accent |
| `--color-accept-foreground` | Text on accept surfaces |
| `--color-reject` | Coral/amber — Reject Mode accent |
| `--color-reject-foreground` | Text on reject surfaces |
| `--color-success` / `-warning` / `-danger` | Semantic states (always paired with icon + text) |
| `--color-ring` | Focus ring color |

Light and dark themes are implemented by swapping the `:root` / `.dark` variable
blocks. Theme follows `prefers-color-scheme` by default and can be overridden by the
`ThemeToggle`, persisted via `next-themes`.

Color is **never** the only signal: every state (success, error, reject, shortlist,
offer) pairs a color with an icon, text label, and (when not reduced-motion) motion.

## 2. Typography

- Primary font: `Geist Sans` (next/font, self-hosted, no external requests).
- Monospace (IDs, code-like data): `Geist Mono`.
- Type scale: `text-xs` (12px) → `text-6xl` (60px) via Tailwind defaults, with
  `tracking-tight` on large display headings.
- Body copy uses `text-base`/`text-lg` with `leading-relaxed` for readability.

## 3. Spacing & Layout

- Base spacing scale: Tailwind's default 4px scale.
- Page content is wrapped in `PageContainer` (`max-w-7xl`, responsive horizontal
  padding `px-4 sm:px-6 lg:px-8`).
- Section vertical rhythm: `py-16 md:py-24` for marketing sections.

## 4. Radius & Shadows

- `--radius-sm` 8px, `--radius-md` 12px, `--radius-lg` 16px, `--radius-xl` 24px,
  `--radius-full` 9999px.
- Shadows are soft and layered (`shadow-soft`, `shadow-soft-lg`) — no harsh drop
  shadows. Dark mode uses lower-opacity shadows plus a faint border instead.

## 5. Buttons

- `PrimaryButton` — brand or mode-colored solid fill, white text, hover elevation.
- `SecondaryButton` — bordered / ghost, low emphasis.
- `DangerActionButton` — reserved for destructive actions (delete offer, delete
  account); requires confirmation via `ConfirmationDialog`.
- `IconButton` — 40×40 min touch target, always has an accessible name.
- All buttons: subtle hover elevation (`-translate-y-0.5`), `active:scale-[0.98]`
  press feedback, visible `focus-visible` ring, loading spinner slot, disabled state
  with reduced opacity and `cursor-not-allowed`.

## 6. Cards

- `GlassCard` — translucent surface with blur, soft border, used for hero/celebration
  panels.
- Job/Candidate cards: soft hover lift (`-translate-y-1`), border glow via
  `box-shadow`, no tilt on touch or reduced-motion.

## 7. Icon Sizes

`14px` (inline text), `16px` (buttons/badges), `20px` (default UI), `24px` (section
headers), `32px+` (feature illustrations). Uses `lucide-react`.

## 8. Motion Durations (tokens, see `ANIMATION_SPEC.md` for full detail)

`--motion-fast: 150ms`, `--motion-base: 250ms`, `--motion-slow: 400ms`,
`--motion-celebration: 2400ms`. Easing: `--ease-standard: cubic-bezier(.4,0,.2,1)`,
`--ease-emphasized: cubic-bezier(.2,0,0,1)`.

## 9. Breakpoints

Tailwind defaults: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`. Explicitly
tested widths: 320, 375, 430, 768, 1024, 1280, 1440.

## 10. States

- **Focus:** 2px `--color-ring` outline with 2px offset on every interactive element,
  never removed, only restyled.
- **Loading:** `LoadingSkeleton` (shimmer) or reduced-motion static pulse.
- **Empty:** `EmptyState` — icon, heading, supporting copy, primary action.
- **Error:** `ErrorState` — icon, heading, actionable copy, Retry action.
- **Dark mode:** full parity for every component; verified in `TESTING.md`.
- **Reduced motion:** every animated component checks `usePrefersReducedMotion` and
  swaps to instant/opacity-only transitions.

## 11. UI Primitives Inventory

`AppLogo`, `AppHeader`, `DesktopNavigation`, `MobileNavigation`, `ThemeToggle`,
`SimulationBadge`, `SimulationDisclosure`, `ModeBadge`, `PrimaryButton`,
`SecondaryButton`, `DangerActionButton`, `IconButton`, `PageContainer`,
`SectionHeading`, `GlassCard`, `StatCard`, `LoadingSkeleton`, `EmptyState`,
`ErrorState`, `ConfirmationDialog`, `AccessibleTooltip`, `ToastProvider`, `Footer`.

These live under `src/components/ui` (shadcn-style primitives: button, card, input,
dialog, sheet, tooltip, badge, select, switch, checkbox, dropdown-menu, skeleton,
label, separator, tabs) and `src/components/{branding,layout,feedback,motion}`.
