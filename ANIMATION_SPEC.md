# OfferLoop — Animation Specification

Global rule: every animation must have a reduced-motion alternative driven by
`usePrefersReducedMotion()` (wraps `matchMedia('(prefers-reduced-motion: reduce)')` plus
the user's in-app "Reduced motion" profile preference), must use `transform`/`opacity`
only where possible, must not block interaction, and must be skippable.

## 1. Page Transitions
- **Purpose:** communicate navigation between major routes.
- **Trigger:** App Router segment change (`AnimatePresence` in a template/layout).
- **Duration:** 250ms out / 300ms in. **Easing:** `--ease-standard`.
- **Motion:** fade 0→1, translateY 12px → 0.
- **Reduced motion:** opacity-only fade, no translateY, 120ms.
- **Mobile:** identical, GPU-cheap (transform/opacity only).
- **A11y:** navigation itself is never delayed by the animation; focus moves to the
  new page's `<h1>` via a route-change effect.

## 2. Buttons
- Hover: `translateY(-1px)` + shadow increase, 150ms `--ease-standard`.
- Press: `scale(0.98)`, 100ms.
- Focus: instantly visible ring, not animated.
- Loading: spinner fades in over 150ms, label opacity 0.7.
- Reduced motion: hover/press become instant background/border changes only.

## 3. Cards (job / candidate / offer)
- Entry: staggered fade+translateY(8px), 40ms stagger, capped at 8 items animated,
  duration 250ms.
- Hover (pointer only, `@media (hover: hover)`): `translateY(-4px)`, border glow via
  box-shadow, skill tags scale 1.03 with 60ms stagger.
- No tilt on touch (`pointer: coarse`) or reduced motion.
- Reserves layout box (fixed min-height) to avoid layout shift.

## 4. Loading Skeletons
- Shimmer: linear-gradient sweep, 1.6s loop, `--ease-standard`.
- Reduced motion: static pulse (opacity 0.6 ↔ 0.8, 2s) — no traveling gradient.

## 5. Toasts (Sonner)
- Slide up + fade in, 200ms; auto-dismiss 4–6s with pause-on-hover; always paired
  with descriptive text (never icon-only); `aria-live="polite"` region.

## 6. Animated Counters
- Session stat counters animate via `framer-motion`'s `useSpring`/`animate` on a
  numeric value over ~500ms, but the DOM text node updates in discrete accessible
  steps and a visually-hidden `aria-live="polite"` node announces only the final
  value (not every intermediate frame) to avoid screen-reader spam.

## 7. Homepage Hero Loop Animation
- **Purpose:** show the "loop" concept — job in, offer out, candidate in, decision out.
- **Trigger:** on mount, looping while tab is visible and motion is allowed.
- **Elements:** job card travels along an SVG path into a "review" node → glow burst →
  offer card appears; mirrored candidate card travels the other path → decision node →
  returns to start.
- **Duration:** ~6s full loop, staged with `framer-motion` `useAnimate` timeline.
- **Implementation notes:** `document.visibilityState` listener pauses the timeline;
  `IntersectionObserver` pauses when scrolled out of view.
- **Reduced motion:** renders a single static illustrative frame (no looping); a
  visually-hidden paragraph describes the concept for all users regardless of motion
  setting.
- **Marked:** `aria-hidden="true"` on the decorative scene; adjacent visible text
  conveys the same information.

## 8. Choose Your Mode Cards
- Hover (desktop): plays a 1.2s preview loop of that mode's micro-animation
  (document glow for Accept, card-stack shuffle for Reject).
- Touch devices: plays the preview once automatically on scroll-into-view
  (`IntersectionObserver`, `threshold: 0.6`), then stays static.
- Reduced motion: shows the end-state frame only.

## 9. Application Review (Accept Mode)
- 5 sequential stages, ~700ms each (600–1000ms range), total <6s.
- Each stage: icon draws in (`pathLength` 0→1 for reduced motion off) or simple fade
  (reduced motion on), label crossfades, progress ring advances by 20%.
- `aria-live="polite"` region announces each stage label once (not per-frame).
- "SIMULATION IN PROGRESS" badge is present and persistent for the whole sequence.
- Skip Animation button jumps straight to the offer celebration.
- Reduced motion: stage changes happen with a 150ms opacity fade, no moving parts,
  no confetti, identical total timing/labels so screen-reader users get equal info.

## 10. Offer Celebration
- Sequence (~3s target, skippable): backdrop dim (200ms) → expanding ring (400ms) →
  confetti burst (`canvas-confetti`, lazy-loaded, motion-gated, capped particle
  count) → logo scale-in → headline fade → card 3D-unfold (`rotateX` 90→0) → action
  buttons stagger in.
- Confetti: disabled entirely under reduced motion or when the user's "confetti"
  preference is off; capped at ≤120 particles, single burst, no continuous loop.
- Card tilt on pointer move: max ±6deg, disabled on touch and reduced motion.
- "Celebrate Again" replays the sequence from a stopped state; never autoplays sound.
- Skip Celebration immediately reveals the final offer state, focus moves to the
  offer heading.

## 11. Reject Mode Deck
- Drag: `framer-motion` `useMotionValue`/`drag`, rotates card up to ±12deg based on
  x-offset, opacity fades near the swipe threshold, colored label ("Reject" /
  "Shortlist") appears with a short bounce as threshold is crossed.
- Button-triggered actions play the same exit transform as drag release, so button
  and drag/touch/keyboard produce identical outcomes and animation (equivalent
  interaction paths, per accessibility requirements).
- Reject exit: translateX -120%, rotate -18deg, 250ms, plus a small "stamp" SVG
  overlay that fades in/out over 300ms.
- Shortlist exit: translateX 120%, rotate 12deg, star icon path-draws in, 250ms.
- Offer exit: translateY -30px then card scales down into an envelope icon, 400ms.
- Reduced motion: cards fade out in place (no translate/rotate) over 150ms; next
  card fades in.
- Undo: card animates back from its exit vector to the top of the deck, 300ms,
  reduced motion = fade only.

## 12. Performance Guardrails
- Decorative animations pause via the Page Visibility API when the tab is hidden.
- Framer Motion components use `will-change: transform` sparingly and only while
  animating.
- Confetti and any below-the-fold motion-heavy sections are lazy-loaded with
  `next/dynamic`.
- No animation exceeds 3 flashes per second (seizure-safety limit).
