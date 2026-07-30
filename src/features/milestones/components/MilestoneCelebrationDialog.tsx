"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import type { CelebrationIntensityPref, PendingCelebration } from "../types";
import { CelebrationParticles } from "./CelebrationParticles";

interface MilestoneCelebrationDialogProps {
  celebration: PendingCelebration;
  intensity: CelebrationIntensityPref;
  confettiEnabled: boolean;
  onKeepGoing: () => void;
  onViewProgress: () => void;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function MilestoneCelebrationDialog({
  celebration,
  intensity,
  confettiEnabled,
  onKeepGoing,
  onViewProgress,
  onDismiss,
  autoDismissMs = 6000,
}: MilestoneCelebrationDialogProps) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [userInteracting, setUserInteracting] = useState(false);
  const showParticles =
    confettiEnabled &&
    !reduceMotion &&
    intensity !== "minimal" &&
    (celebration.kind === "dialog" || celebration.kind === "summary");

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const closeButton = dialogRef.current?.querySelector<HTMLElement>(
      "[data-milestone-close]",
    );
    closeButton?.focus();
    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onDismiss]);

  useEffect(() => {
    if (userInteracting) return;
    const timer = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [autoDismissMs, onDismiss, userInteracting]);

  const shareSummary = async () => {
    trackEvent("milestone_share_started", {
      category: celebration.category,
      threshold: celebration.threshold,
    });
    const text = [
      "OfferLoop milestone",
      celebration.body,
      celebration.playfulLine,
      "",
      "Fictional simulation",
      "No real application was submitted",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      trackEvent("milestone_share_completed", {
        category: celebration.category,
        threshold: celebration.threshold,
      });
      toast.success("Simulation summary copied.");
    } catch {
      toast.error("Could not copy summary.");
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
        data-testid="milestone-dialog"
      >
        <motion.div
          aria-hidden="true"
          className="bg-background/50 absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        />
        {showParticles ? <CelebrationParticles intensity={intensity} /> : null}
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          tabIndex={-1}
          onPointerDown={() => setUserInteracting(true)}
          onFocusCapture={() => setUserInteracting(true)}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 8 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.45 }}
          className="border-border bg-surface relative z-10 w-full max-w-md rounded-[var(--radius-lg)] border p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-lg)]"
        >
          <button
            type="button"
            data-milestone-close
            onClick={onDismiss}
            aria-label="Close milestone celebration"
            className="focus-ring text-muted-foreground hover:text-foreground absolute top-3 right-3 rounded-md px-2 py-1 text-sm"
          >
            Close
          </button>

          <p className="text-brand text-xs font-medium tracking-wide uppercase">
            Fictional milestone
          </p>
          <h2 id={titleId} className="text-foreground mt-2 text-2xl font-semibold">
            {celebration.title}
          </h2>
          <p id={descriptionId} className="text-muted-foreground mt-2 text-sm">
            {celebration.body}
          </p>
          <p
            className="text-foreground mt-4 text-4xl font-semibold tabular-nums"
            aria-hidden="true"
          >
            {celebration.threshold}
          </p>
          <p className="text-brand mt-3 text-sm">{celebration.playfulLine}</p>

          {celebration.kind === "summary" && celebration.summaryCounts ? (
            <ul className="border-border mt-4 grid grid-cols-2 gap-2 rounded-[var(--radius-md)] border p-3 text-sm">
              <li>Applications: {celebration.summaryCounts.applications}</li>
              <li>Rejections: {celebration.summaryCounts.rejections}</li>
              <li>Shortlists: {celebration.summaryCounts.shortlists}</li>
              <li>
                Offers:{" "}
                {celebration.summaryCounts.offers_sent +
                  celebration.summaryCounts.offers_received}
              </li>
              <li className="col-span-2">
                Saved jobs: {celebration.summaryCounts.saved_jobs}
              </li>
            </ul>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={onKeepGoing}
              className="focus-ring bg-brand text-brand-foreground rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-medium"
            >
              Keep going
            </button>
            <button
              type="button"
              onClick={onViewProgress}
              className="focus-ring border-border text-foreground rounded-[var(--radius-md)] border px-4 py-2.5 text-sm font-medium"
            >
              {celebration.kind === "summary" ? "View achievements" : "View progress"}
            </button>
            {celebration.kind === "summary" ? (
              <button
                type="button"
                onClick={() => void shareSummary()}
                className="focus-ring border-border text-foreground rounded-[var(--radius-md)] border px-4 py-2.5 text-sm font-medium"
              >
                Share summary
              </button>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
