"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import type { PendingCelebration } from "../types";

interface MilestoneToastProps {
  celebration: PendingCelebration;
  onDismiss: () => void;
  durationMs?: number;
}

export function MilestoneToast({
  celebration,
  onDismiss,
  durationMs = 3500,
}: MilestoneToastProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, onDismiss]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      data-testid="milestone-toast"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.32 }}
      className="border-border bg-surface pointer-events-auto fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 z-50 w-[min(22rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-lg)] sm:bottom-8"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-foreground text-sm font-semibold">{celebration.title}</p>
          <p className="text-muted-foreground mt-1 text-sm">{celebration.body}</p>
          <p className="text-brand mt-2 text-xs">{celebration.playfulLine}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss milestone"
          className="focus-ring text-muted-foreground hover:text-foreground shrink-0 rounded-md px-2 py-1 text-xs"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}
