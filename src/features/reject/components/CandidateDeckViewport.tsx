"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import type { DeckDecision, FictionalCandidate } from "@/types/domain";
import { resolveDragDecision } from "@/features/reject/services/deckEngine";
import { CandidateCard } from "./CandidateCard";
import {
  ConfirmedStamp,
  LiveDragStamp,
  OfferSeal,
  RejectParticles,
  ShortlistTrace,
} from "./DecisionEffects";
import { cn } from "@/lib/utils";

const EXIT_TARGETS: Record<DeckDecision, { x: number; y: number; rotate: number }> = {
  reject: { x: -560, y: 28, rotate: -12 },
  shortlist: { x: 560, y: 28, rotate: 12 },
  offer: { x: 0, y: -420, rotate: 0 },
};

const SPRING_BACK_TRANSITION = { type: "spring", stiffness: 380, damping: 32 } as const;
const EXIT_TRANSITION = { type: "spring", stiffness: 280, damping: 26 } as const;

/** How long the exit needs before the candidate is safely off-screen and the queue can advance. */
export const DECISION_SETTLE_MS = 620;
export const REDUCED_MOTION_SETTLE_MS = 160;

/**
 * Peeks of the next cards in the stack. Absolutely positioned so they never
 * participate in height calculation — the active card alone sizes the viewport.
 */
function BackgroundCard({
  stackIndex,
}: {
  candidate: FictionalCandidate;
  stackIndex: 0 | 1;
}) {
  const offset = stackIndex === 0 ? 10 : 20;
  const scale = stackIndex === 0 ? 0.97 : 0.94;
  const opacity = stackIndex === 0 ? 0.88 : 0.68;
  return (
    <div
      className="border-border bg-surface absolute inset-0 rounded-[var(--radius-lg)] border shadow-[var(--shadow-soft)]"
      style={{
        transform: `translateY(${offset}px) scale(${scale})`,
        opacity,
        zIndex: 2 - stackIndex,
      }}
      aria-hidden="true"
    />
  );
}

interface ActiveCandidateCardProps {
  candidate: FictionalCandidate;
  reducedMotion: boolean;
  disabled: boolean;
  pendingDecision: DeckDecision | null;
  onDragCommit: (decision: DeckDecision) => void;
}

function ActiveCandidateCard({
  candidate,
  reducedMotion,
  disabled,
  pendingDecision,
  onDragCommit,
}: ActiveCandidateCardProps) {
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const dragRotate = useTransform(dragX, [-200, 200], [-12, 12]);

  const rejectPreviewOpacity = useTransform(dragX, [-140, -20], [1, 0]);
  const shortlistPreviewOpacity = useTransform(dragX, [20, 140], [0, 1]);
  const glowOpacity = useTransform(dragX, [-140, -20], [0.55, 0]);
  const acceptGlowOpacity = useTransform(dragX, [20, 140], [0, 0.45]);

  useEffect(() => {
    if (!pendingDecision) return;
    if (reducedMotion) {
      animate(dragX, 0, { duration: 0.01 });
      animate(dragY, 0, { duration: 0.01 });
      return;
    }
    const target = EXIT_TARGETS[pendingDecision];
    animate(dragX, target.x, EXIT_TRANSITION);
    animate(dragY, target.y, EXIT_TRANSITION);
    // Only fire when a decision is first committed for this card instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDecision]);

  // Horizontal drag only so vertical page scrolling stays free on mobile.
  // Offer remains available via the button and ↑ keyboard shortcut.
  const canDrag = !reducedMotion && !disabled && !pendingDecision;

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (disabled || pendingDecision) return;
    const decision = resolveDragDecision({ x: info.offset.x, y: 0 });
    if (decision) {
      onDragCommit(decision);
      // Rejection opens a reason dialog instead of exiting immediately — spring
      // the card back to center so it remains visible behind the dialog.
      if (decision === "reject") {
        animate(dragX, 0, SPRING_BACK_TRANSITION);
        animate(dragY, 0, SPRING_BACK_TRANSITION);
      }
      return;
    }
    animate(dragX, 0, SPRING_BACK_TRANSITION);
    animate(dragY, 0, SPRING_BACK_TRANSITION);
  }

  const showLivePreview = !pendingDecision && !reducedMotion;
  const exitRotate = pendingDecision ? EXIT_TARGETS[pendingDecision].rotate : undefined;

  return (
    <motion.div
      role="group"
      aria-label={`${candidate.displayName}, fictional candidate card`}
      className={cn(
        "relative z-10 touch-pan-y",
        canDrag && "cursor-grab active:cursor-grabbing",
      )}
      drag={canDrag ? "x" : false}
      dragElastic={0.55}
      dragMomentum={false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      style={
        reducedMotion
          ? undefined
          : {
              x: dragX,
              y: dragY,
              rotate: exitRotate ?? dragRotate,
            }
      }
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
      animate={
        reducedMotion
          ? { opacity: pendingDecision ? 0 : 1 }
          : {
              opacity: pendingDecision && pendingDecision === "offer" ? 0 : 1,
              scale: pendingDecision === "offer" ? 0.92 : 1,
            }
      }
      transition={{
        duration: reducedMotion ? 0.14 : 0.28,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <CandidateCard candidate={candidate} />

      {showLivePreview ? (
        <>
          <motion.div
            style={{ opacity: glowOpacity }}
            className="from-reject/35 pointer-events-none absolute inset-y-0 left-0 w-2/5 rounded-l-[var(--radius-lg)] bg-gradient-to-r to-transparent"
            aria-hidden="true"
          />
          <motion.div
            style={{ opacity: acceptGlowOpacity }}
            className="from-accept/30 pointer-events-none absolute inset-y-0 right-0 w-2/5 rounded-r-[var(--radius-lg)] bg-gradient-to-l to-transparent"
            aria-hidden="true"
          />
          <LiveDragStamp decision="reject" opacity={rejectPreviewOpacity} />
          <LiveDragStamp decision="shortlist" opacity={shortlistPreviewOpacity} />
        </>
      ) : null}

      {pendingDecision ? (
        <>
          {pendingDecision === "reject" ? (
            <>
              <div
                className="from-reject/45 pointer-events-none absolute inset-y-0 left-0 w-2/5 rounded-l-[var(--radius-lg)] bg-gradient-to-r to-transparent"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-[var(--radius-lg)] shadow-[0_0_0_2px_color-mix(in_oklab,var(--color-reject)_55%,transparent),0_0_24px_color-mix(in_oklab,var(--color-reject)_35%,transparent)]"
                aria-hidden="true"
              />
            </>
          ) : null}
          {pendingDecision === "shortlist" ? (
            <div
              className="border-accept pointer-events-none absolute inset-0 rounded-[var(--radius-lg)] border-2"
              aria-hidden="true"
            />
          ) : null}
          <ConfirmedStamp decision={pendingDecision} reducedMotion={reducedMotion} />
          {pendingDecision === "reject" && !reducedMotion ? <RejectParticles /> : null}
          {pendingDecision === "shortlist" && !reducedMotion ? <ShortlistTrace /> : null}
          {pendingDecision === "offer" ? (
            <OfferSeal reducedMotion={reducedMotion} />
          ) : null}
        </>
      ) : null}
    </motion.div>
  );
}

export function CandidateDeckViewport({
  current,
  upNext,
  reducedMotion,
  disabled,
  pendingDecision,
  onDragCommit,
}: {
  current: FictionalCandidate;
  upNext: FictionalCandidate[];
  reducedMotion: boolean;
  disabled: boolean;
  pendingDecision: DeckDecision | null;
  onDragCommit: (decision: DeckDecision) => void;
}) {
  return (
    <div
      data-testid="candidate-deck-viewport"
      className="relative mx-auto w-full max-w-[540px]"
    >
      {/*
        Background peeks are out of flow. Height comes only from the active
        CandidateCard — never from min-height / vh / stretched empty shells.
      */}
      {!reducedMotion && upNext.length > 0 ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 bottom-0"
          aria-hidden="true"
        >
          {upNext
            .slice(0, 2)
            .map((candidate, index) => (
              <BackgroundCard
                key={candidate.id}
                candidate={candidate}
                stackIndex={index === 0 ? 0 : 1}
              />
            ))
            .reverse()}
        </div>
      ) : null}

      <ActiveCandidateCard
        key={current.id}
        candidate={current}
        reducedMotion={reducedMotion}
        disabled={disabled}
        pendingDecision={pendingDecision}
        onDragCommit={onDragCommit}
      />

      {/* Small reserved room so the translated stack peeks don't collide with buttons. */}
      <div className="h-5 sm:h-6" aria-hidden="true" />
    </div>
  );
}
