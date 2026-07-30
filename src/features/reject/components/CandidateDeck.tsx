"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HelpCircle, RotateCcw, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CandidateDeckViewport,
  DECISION_SETTLE_MS,
  REDUCED_MOTION_SETTLE_MS,
} from "./CandidateDeckViewport";
import { CandidateActionButtons } from "./CandidateActionButtons";
import { SessionFeedbackBar } from "./SessionFeedbackBar";
import {
  RejectReasonDialog,
  type RejectReasonConfirmPayload,
} from "./RejectReasonDialog";
import { DecisionReceipt, type DecisionReceiptData } from "./DecisionReceipt";
import {
  applyDecision,
  createInitialDeckState,
  undoLastDecision,
  type DeckState,
} from "@/features/reject/services/deckEngine";
import { getRandomRejectReceiptMessage } from "@/features/reject/services/rejectMessages";
import {
  REJECTION_REASON_LABEL_BY_CODE,
  buildRejectionMetadata,
  type RejectionDetails,
  type RejectionSource,
} from "@/features/reject/services/rejectionReasons";
import { useMotionPreference } from "@/lib/motion/MotionPreferenceContext";
import { playDecisionSound } from "@/lib/audio/playEffect";
import { triggerHapticFeedback } from "@/lib/motion/haptics";
import { recordRecruitingDecisionMilestone } from "@/lib/storage/pwaMilestone";
import { notifyMilestoneAction, notifyMilestoneUndo } from "@/features/milestones/notify";
import { useRepositories } from "@/lib/repositories/useRepositories";
import { useGuestSession } from "@/lib/context/GuestSessionContext";
import { readGuestSettings } from "@/lib/storage/guestStore";
import type { DeckDecision, FictionalCandidate } from "@/types/domain";

function decisionToMilestoneKind(
  decision: DeckDecision,
):
  | "fictional_candidate_rejected"
  | "fictional_candidate_shortlisted"
  | "fictional_offer_sent" {
  if (decision === "reject") return "fictional_candidate_rejected";
  if (decision === "shortlist") return "fictional_candidate_shortlisted";
  return "fictional_offer_sent";
}

function logSafeActionError(error: unknown): void {
  if (process.env.NODE_ENV === "production") return;
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    console.error("[OfferLoop] rejection persistence failed", {
      code: record.code,
      message: record.message,
      details: record.details,
      hint: record.hint,
    });
    return;
  }
  console.error("[OfferLoop] rejection persistence failed", { message: String(error) });
}

export function CandidateDeck({ candidates }: { candidates: FictionalCandidate[] }) {
  const { soundEnabled, reducedMotion } = useMotionPreference();
  const router = useRouter();
  const { repositories, userId } = useRepositories();
  const { anonymousSessionId } = useGuestSession();

  const [deck, setDeck] = useState<DeckState>(() => createInitialDeckState(candidates));
  const [helpOpen, setHelpOpen] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<DeckDecision | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectDialogSource, setRejectDialogSource] =
    useState<RejectionSource>("reject_button");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<DecisionReceiptData | null>(null);
  const [quickRejectionEnabled, setQuickRejectionEnabled] = useState(
    () => readGuestSettings().quickRejectionEnabled,
  );

  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveRegionRef = useRef<HTMLParagraphElement>(null);
  const rejectCandidateIdRef = useRef<string | null>(null);

  const current = deck.queue[0];
  const upNext = deck.queue.slice(1, 3);
  const busy = pendingDecision !== null || rejectSubmitting || rejectDialogOpen;

  // Refresh quick-reject prefs when returning to the tab (settings may have changed).
  useEffect(() => {
    function refreshPrefs() {
      const settings = readGuestSettings();
      setQuickRejectionEnabled(settings.quickRejectionEnabled);
    }
    window.addEventListener("focus", refreshPrefs);
    return () => window.removeEventListener("focus", refreshPrefs);
  }, []);

  useEffect(
    () => () => {
      if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    },
    [],
  );

  const announce = useCallback((message: string) => {
    if (liveRegionRef.current) liveRegionRef.current.textContent = message;
  }, []);

  const focusRejectButton = useCallback(() => {
    window.requestAnimationFrame(() => {
      const button = document.querySelector(
        'button[aria-label^="Reject "]',
      ) as HTMLButtonElement | null;
      button?.focus();
    });
  }, []);

  const runExitAnimation = useCallback(
    (
      decision: DeckDecision,
      decidedCandidate: FictionalCandidate,
      rejection?: RejectionDetails,
    ) => {
      setPendingDecision(decision);

      if (soundEnabled) {
        playDecisionSound(decision);
      }
      if (soundEnabled && !reducedMotion) {
        triggerHapticFeedback(decision);
      }

      const totalAfterThisDecision =
        deck.stats.rejected + deck.stats.shortlisted + deck.stats.offered + 1;

      const settleMs = reducedMotion ? REDUCED_MOTION_SETTLE_MS : DECISION_SETTLE_MS;
      settleTimeoutRef.current = setTimeout(() => {
        settleTimeoutRef.current = null;
        setDeck((prev) => applyDecision(prev, decision, rejection));
        setPendingDecision(null);
        recordRecruitingDecisionMilestone();

        if (decision === "reject" && rejection) {
          const playfulLine = getRandomRejectReceiptMessage();
          setReceipt({
            candidateDisplayName: decidedCandidate.displayName,
            rejection,
            playfulLine,
          });
          announce(
            `${decidedCandidate.displayName} rejected in the simulation. Reason: ${rejection.reasonLabel}.`,
          );
          toast(playfulLine);
        } else if (decision === "shortlist") {
          toast.success(`${decidedCandidate.displayName} shortlisted.`);
          announce(`${decidedCandidate.displayName} shortlisted in the simulation.`);
        } else {
          toast.success("Simulated offer created. No real person was contacted.");
          announce(
            `Simulated offer created for ${decidedCandidate.displayName}. No real person was contacted.`,
          );
        }

        if (totalAfterThisDecision > 0 && totalAfterThisDecision % 5 === 0) {
          toast(`${totalAfterThisDecision} imaginary decisions complete.`);
        }
      }, settleMs);
    },
    [announce, deck.stats, reducedMotion, soundEnabled],
  );

  const persistAndReject = useCallback(
    async (payload: RejectReasonConfirmPayload, candidate: FictionalCandidate) => {
      const rejection: RejectionDetails = {
        reasonCode: payload.reasonCode,
        reasonLabel: payload.reasonLabel,
        comment: payload.comment,
        source: payload.source,
        candidateDisplayName: candidate.displayName,
        simulationOnly: true,
      };

      setRejectSubmitting(true);
      setRejectError(null);
      rejectCandidateIdRef.current = candidate.id;

      try {
        await repositories.actions.recordAction({
          userId: userId === "guest" ? null : userId,
          anonymousSessionId,
          actionType: "candidate_rejected",
          candidateId: candidate.id,
          metadata: buildRejectionMetadata(rejection),
        });
        notifyMilestoneAction("fictional_candidate_rejected");
      } catch (error) {
        logSafeActionError(error);
        setRejectSubmitting(false);
        setRejectError("Could not record this fictional decision. Try again.");
        // Keep dialog open so the user can retry; do not claim rejection.
        return;
      }

      // Candidate may have changed while we awaited (should be rare); abort safely.
      if (rejectCandidateIdRef.current !== candidate.id) {
        setRejectSubmitting(false);
        setRejectError("Could not record this fictional decision. Try again.");
        return;
      }

      setRejectDialogOpen(false);
      setRejectSubmitting(false);
      runExitAnimation("reject", candidate, rejection);
    },
    [anonymousSessionId, repositories.actions, runExitAnimation, userId],
  );

  const openRejectDialog = useCallback(
    (source: RejectionSource) => {
      if (!current || busy) return;
      setRejectError(null);
      setRejectDialogSource(source);
      setRejectDialogOpen(true);
    },
    [busy, current],
  );

  const requestReject = useCallback(
    (source: RejectionSource) => {
      if (!current || busy) return;

      const settings = readGuestSettings();
      const quickEnabled = settings.quickRejectionEnabled;
      const defaultCode = settings.defaultRejectionReason;
      setQuickRejectionEnabled(quickEnabled);

      if (quickEnabled && source !== "choose_reason") {
        void persistAndReject(
          {
            reasonCode: defaultCode,
            reasonLabel: REJECTION_REASON_LABEL_BY_CODE[defaultCode],
            source: source === "reject_button" ? "quick_reject" : source,
          },
          current,
        );
        return;
      }

      openRejectDialog(source === "choose_reason" ? "choose_reason" : source);
    },
    [busy, current, openRejectDialog, persistAndReject],
  );

  const decide = useCallback(
    (decision: DeckDecision) => {
      if (!current || busy) return;

      if (decision === "reject") {
        requestReject("reject_button");
        return;
      }

      const decidedCandidate = current;
      const actionType =
        decision === "shortlist" ? "candidate_shortlisted" : "candidate_offered";

      void repositories.actions
        .recordAction({
          userId: userId === "guest" ? null : userId,
          anonymousSessionId,
          actionType,
          candidateId: decidedCandidate.id,
        })
        .then(() => {
          notifyMilestoneAction(
            decision === "shortlist"
              ? "fictional_candidate_shortlisted"
              : "fictional_offer_sent",
          );
          runExitAnimation(decision, decidedCandidate);
        })
        .catch((error) => {
          logSafeActionError(error);
          toast.error("Could not record this fictional decision. Try again.");
        });
    },
    [
      anonymousSessionId,
      busy,
      current,
      repositories.actions,
      requestReject,
      runExitAnimation,
      userId,
    ],
  );

  const handleDragCommit = useCallback(
    (decision: DeckDecision) => {
      if (decision === "reject") {
        requestReject("swipe_left");
        return;
      }
      decide(decision);
    },
    [decide, requestReject],
  );

  const undo = useCallback(() => {
    if (deck.history.length === 0 || pendingDecision || rejectSubmitting) return;
    const lastEntry = deck.history[deck.history.length - 1];
    setDeck((prev) => undoLastDecision(prev));
    setReceipt(null);
    void repositories.actions.recordAction({
      userId: userId === "guest" ? null : userId,
      anonymousSessionId,
      actionType: "action_undone",
      candidateId: lastEntry.candidate.id,
      metadata: lastEntry.rejection
        ? {
            previousDecision: lastEntry.decision,
            reasonCode: lastEntry.rejection.reasonCode,
            simulationOnly: true,
          }
        : { previousDecision: lastEntry.decision },
    });
    notifyMilestoneUndo(decisionToMilestoneKind(lastEntry.decision));
    toast(`Undid decision for ${lastEntry.candidate.displayName}.`);
    announce(`Undid decision for ${lastEntry.candidate.displayName}.`);
  }, [
    announce,
    anonymousSessionId,
    deck.history,
    pendingDecision,
    rejectSubmitting,
    repositories,
    userId,
  ]);

  const resetDeck = useCallback(() => {
    if (pendingDecision || rejectSubmitting || rejectDialogOpen) return;
    setDeck(createInitialDeckState(candidates));
    setReceipt(null);
    void repositories.actions.recordAction({
      userId: userId === "guest" ? null : userId,
      anonymousSessionId,
      actionType: "deck_reset",
    });
    toast.success("Deck reset. All fictional candidates are back.");
    announce("Deck reset. All fictional candidates are back.");
  }, [
    announce,
    anonymousSessionId,
    candidates,
    pendingDecision,
    rejectDialogOpen,
    rejectSubmitting,
    repositories,
    userId,
  ]);

  const cancelRejectDialog = useCallback(() => {
    if (rejectSubmitting) return;
    setRejectDialogOpen(false);
    setRejectError(null);
    focusRejectButton();
  }, [focusRejectButton, rejectSubmitting]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (["INPUT", "TEXTAREA"].includes((event.target as HTMLElement)?.tagName)) return;
      if (rejectDialogOpen) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          requestReject("keyboard_left");
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
  }, [current, decide, rejectDialogOpen, requestReject, resetDeck, router, undo]);

  const totalDecided = deck.stats.rejected + deck.stats.shortlisted + deck.stats.offered;

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-5">
      <p ref={liveRegionRef} aria-live="polite" className="sr-only" />

      <div className="flex w-full flex-col gap-2">
        <p className="text-muted-foreground text-center text-sm">
          {totalDecided} fictional decision{totalDecided === 1 ? "" : "s"} made this
          session · {deck.queue.length} remaining in the deck
        </p>
        <SessionFeedbackBar
          rejected={deck.stats.rejected}
          shortlisted={deck.stats.shortlisted}
          offered={deck.stats.offered}
          remaining={deck.queue.length}
        />
      </div>

      <div className="flex w-full flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={undo}
          disabled={deck.history.length === 0 || busy}
        >
          <Undo2 className="h-4 w-4" /> Undo
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={resetDeck}
          disabled={busy}
        >
          <RotateCcw className="h-4 w-4" /> Reset deck
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setHelpOpen(true)}>
          <HelpCircle className="h-4 w-4" /> Keyboard shortcuts
        </Button>
      </div>

      {receipt ? (
        <DecisionReceipt
          receipt={receipt}
          reducedMotion={reducedMotion}
          onUndo={undo}
          onDismiss={() => setReceipt(null)}
        />
      ) : null}

      {current ? (
        <div className="flex w-full flex-col items-center gap-5">
          <CandidateDeckViewport
            current={current}
            upNext={upNext}
            reducedMotion={reducedMotion}
            disabled={busy}
            pendingDecision={pendingDecision}
            onDragCommit={handleDragCommit}
          />

          <div className="border-border bg-background/95 sticky bottom-0 z-20 -mx-4 flex w-[calc(100%+2rem)] flex-col items-center gap-2.5 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:w-full sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <CandidateActionButtons
              candidate={current}
              onDecide={decide}
              onChooseRejectReason={() => requestReject("choose_reason")}
              quickRejectionEnabled={quickRejectionEnabled}
              disabled={busy}
            />
            <p className="text-muted-foreground text-center text-sm">
              <Link
                href={`/reject/candidates/${current.slug}`}
                className="focus-ring rounded underline-offset-4 hover:underline"
              >
                View {current.displayName}&apos;s full fictional profile
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <EmptyState
          title="You've reviewed every fictional candidate"
          description="Use the Reset deck button above to see them again, or check back later for new simulated profiles."
        />
      )}

      <RejectReasonDialog
        open={rejectDialogOpen}
        candidate={current ?? null}
        source={rejectDialogSource}
        submitting={rejectSubmitting}
        errorMessage={rejectError}
        onCancel={cancelRejectDialog}
        onConfirm={(payload) => {
          if (!current) return;
          void persistAndReject(payload, current);
        }}
      />

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>Use these keys anywhere on the deck.</DialogDescription>
          </DialogHeader>
          <ul className="text-foreground flex flex-col gap-2 text-sm">
            <ShortcutRow keys="←" label="Open rejection reason dialog" />
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
    <li className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <kbd className="border-border bg-surface-muted rounded-[var(--radius-sm)] border px-2 py-1 font-mono text-xs">
        {keys}
      </kbd>
    </li>
  );
}
