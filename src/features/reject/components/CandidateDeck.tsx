"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { toast } from "sonner";
import { Check, HelpCircle, Mail, RotateCcw, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CandidateCard } from "./CandidateCard";
import {
  applyDecision,
  createInitialDeckState,
  undoLastDecision,
  type DeckState,
} from "@/features/reject/services/deckEngine";
import { getRandomRejectMessage } from "@/features/reject/services/rejectMessages";
import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";
import { recordRecruitingDecisionMilestone } from "@/lib/storage/pwaMilestone";
import { useRepositories } from "@/lib/repositories/useRepositories";
import { useGuestSession } from "@/lib/context/GuestSessionContext";
import type { DeckDecision, FictionalCandidate } from "@/types/domain";

const SWIPE_THRESHOLD = 120;

export function CandidateDeck({ candidates }: { candidates: FictionalCandidate[] }) {
  const reducedMotion = usePrefersReducedMotion();
  const router = useRouter();
  const { repositories, userId } = useRepositories();
  const { anonymousSessionId } = useGuestSession();

  const [deck, setDeck] = useState<DeckState>(() => createInitialDeckState(candidates));
  const [helpOpen, setHelpOpen] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | "up" | null>(
    null,
  );
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const rotate = useTransform(dragX, [-200, 200], [-12, 12]);
  const liveRegionRef = useRef<HTMLParagraphElement>(null);

  const current = deck.queue[0];
  const upNext = deck.queue.slice(1, 3);

  const announce = useCallback((message: string) => {
    if (liveRegionRef.current) liveRegionRef.current.textContent = message;
  }, []);

  const decide = useCallback(
    (decision: DeckDecision) => {
      if (!current) return;
      setExitDirection(
        decision === "reject" ? "left" : decision === "shortlist" ? "right" : "up",
      );
      setDeck((prev) => applyDecision(prev, decision));
      dragX.set(0);
      dragY.set(0);
      recordRecruitingDecisionMilestone();

      const actionType =
        decision === "reject"
          ? "candidate_rejected"
          : decision === "shortlist"
            ? "candidate_shortlisted"
            : "candidate_offered";
      void repositories.actions.recordAction({
        userId: userId === "guest" ? null : userId,
        anonymousSessionId,
        actionType,
        candidateId: current.id,
      });

      if (decision === "reject") {
        const message = getRandomRejectMessage();
        toast(message);
        announce(`Rejected ${current.displayName}. ${message}`);
      } else if (decision === "shortlist") {
        toast.success(`${current.displayName} shortlisted.`);
        announce(`Shortlisted ${current.displayName}.`);
      } else {
        toast.success("Simulated offer created. No real person was contacted.");
        announce(
          `Simulated offer sent to ${current.displayName}. No real person was contacted.`,
        );
      }
    },
    [current, dragX, dragY, repositories, userId, anonymousSessionId, announce],
  );

  const undo = useCallback(() => {
    if (deck.history.length === 0) return;
    const lastEntry = deck.history[deck.history.length - 1];
    setDeck((prev) => undoLastDecision(prev));
    setExitDirection(null);
    void repositories.actions.recordAction({
      userId: userId === "guest" ? null : userId,
      anonymousSessionId,
      actionType: "action_undone",
      candidateId: lastEntry.candidate.id,
    });
    toast(`Undid decision for ${lastEntry.candidate.displayName}.`);
    announce(`Undid decision for ${lastEntry.candidate.displayName}.`);
  }, [deck.history, repositories, userId, anonymousSessionId, announce]);

  const resetDeck = useCallback(() => {
    setDeck(createInitialDeckState(candidates));
    setExitDirection(null);
    void repositories.actions.recordAction({
      userId: userId === "guest" ? null : userId,
      anonymousSessionId,
      actionType: "deck_reset",
    });
    toast.success("Deck reset. All fictional candidates are back.");
    announce("Deck reset. All fictional candidates are back.");
  }, [candidates, repositories, userId, anonymousSessionId, announce]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (["INPUT", "TEXTAREA"].includes((event.target as HTMLElement)?.tagName)) return;
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          decide("reject");
          break;
        case "ArrowRight":
          event.preventDefault();
          decide("shortlist");
          break;
        case "ArrowUp":
          event.preventDefault();
          decide("offer");
          break;
        case "z":
        case "Z":
          undo();
          break;
        case "r":
        case "R":
          resetDeck();
          break;
        case "?":
          setHelpOpen(true);
          break;
        case "Enter":
          if (current) router.push(`/reject/candidates/${current.slug}`);
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [decide, undo, resetDeck, router, current]);

  const handleDragEnd = (
    _event: PointerEvent | MouseEvent | TouchEvent,
    info: PanInfo,
  ) => {
    const { offset } = info;
    if (offset.y < -SWIPE_THRESHOLD && Math.abs(offset.y) > Math.abs(offset.x)) {
      decide("offer");
    } else if (offset.x < -SWIPE_THRESHOLD) {
      decide("reject");
    } else if (offset.x > SWIPE_THRESHOLD) {
      decide("shortlist");
    } else {
      dragX.set(0);
      dragY.set(0);
    }
  };

  const totalDecided = deck.stats.rejected + deck.stats.shortlisted + deck.stats.offered;

  return (
    <div className="flex flex-col gap-6">
      <p ref={liveRegionRef} aria-live="polite" className="sr-only" />

      <p className="text-muted-foreground text-sm">
        {totalDecided} fictional decision{totalDecided === 1 ? "" : "s"} made this session
        · {deck.queue.length} remaining in the deck
      </p>

      <div className="grid grid-cols-3 gap-3 sm:max-w-md">
        <StatCard label="Rejected" value={deck.stats.rejected} icon={X} />
        <StatCard label="Shortlisted" value={deck.stats.shortlisted} icon={Check} />
        <StatCard label="Simulated offers" value={deck.stats.offered} icon={Mail} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={undo}
          disabled={deck.history.length === 0}
        >
          <Undo2 className="h-4 w-4" /> Undo
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={resetDeck}>
          <RotateCcw className="h-4 w-4" /> Reset deck
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setHelpOpen(true)}>
          <HelpCircle className="h-4 w-4" /> Keyboard shortcuts
        </Button>
      </div>

      <div className="relative mx-auto h-[560px] w-full max-w-md">
        {current ? (
          <>
            {upNext
              .slice()
              .reverse()
              .map((candidate, reverseIndex) => {
                const stackIndex = upNext.length - reverseIndex;
                return (
                  <div
                    key={candidate.id}
                    className="border-border bg-surface absolute inset-0 rounded-[var(--radius-lg)] border shadow-[var(--shadow-soft)]"
                    style={{
                      transform: `translateY(${stackIndex * 10}px) scale(${1 - stackIndex * 0.03})`,
                      zIndex: 10 - stackIndex,
                    }}
                    aria-hidden="true"
                  />
                );
              })}

            <AnimatePresence>
              <motion.div
                key={current.id}
                className="absolute inset-0 z-10 cursor-grab touch-none active:cursor-grabbing"
                drag={!reducedMotion}
                dragElastic={0.6}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                style={reducedMotion ? undefined : { x: dragX, y: dragY, rotate }}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  exitDirection === "left"
                    ? { x: -400, opacity: 0, rotate: -20 }
                    : exitDirection === "right"
                      ? { x: 400, opacity: 0, rotate: 20 }
                      : { y: -400, opacity: 0 }
                }
                transition={{ duration: reducedMotion ? 0.15 : 0.3 }}
              >
                <CandidateCard candidate={current} />
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <EmptyState
            title="You've reviewed every fictional candidate"
            description="Reset the deck to see them again, or check back later for new simulated profiles."
            action={
              <Button type="button" variant="secondary" onClick={resetDeck}>
                Reset deck
              </Button>
            }
          />
        )}
      </div>

      {current ? (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="reject"
            size="lg"
            className="rounded-full"
            aria-label={`Reject ${current.displayName}`}
            onClick={() => decide("reject")}
          >
            <X className="h-5 w-5" /> Reject
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="rounded-full"
            aria-label={`Send simulated offer to ${current.displayName}`}
            onClick={() => decide("offer")}
          >
            <Mail className="h-5 w-5" /> Offer
          </Button>
          <Button
            type="button"
            variant="accept"
            size="lg"
            className="rounded-full"
            aria-label={`Shortlist ${current.displayName}`}
            onClick={() => decide("shortlist")}
          >
            <Check className="h-5 w-5" /> Shortlist
          </Button>
        </div>
      ) : null}

      {current ? (
        <p className="text-muted-foreground text-center text-sm">
          <Link
            href={`/reject/candidates/${current.slug}`}
            className="focus-ring rounded underline-offset-4 hover:underline"
          >
            View {current.displayName}&apos;s full fictional profile
          </Link>
        </p>
      ) : null}

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>Use these keys anywhere on the deck.</DialogDescription>
          </DialogHeader>
          <ul className="text-foreground flex flex-col gap-2 text-sm">
            <ShortcutRow keys="←" label="Reject" />
            <ShortcutRow keys="→" label="Shortlist" />
            <ShortcutRow keys="↑" label="Send simulated offer" />
            <ShortcutRow keys="Z" label="Undo" />
            <ShortcutRow keys="R" label="Reset deck" />
            <ShortcutRow keys="Enter" label="View profile" />
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShortcutRow({ keys, label }: { keys: string; label: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <kbd className="border-border bg-surface-muted rounded-[var(--radius-sm)] border px-2 py-1 font-mono text-xs">
        {keys}
      </kbd>
    </li>
  );
}
