"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import type { PendingCelebration } from "../types";

interface AchievementUnlockedToastProps {
  celebration: PendingCelebration;
  onDismiss: () => void;
}

export function AchievementUnlockedToast({
  celebration,
  onDismiss,
}: AchievementUnlockedToastProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      data-testid="achievement-unlocked-toast"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="border-border bg-surface pointer-events-auto fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 w-[min(18rem,calc(100vw-2rem))] rounded-[var(--radius-lg)] border p-3 shadow-[var(--shadow-md)] sm:bottom-8"
    >
      <p className="text-brand text-[10px] font-medium tracking-wide uppercase">
        Achievement unlocked
      </p>
      <p className="text-foreground mt-1 text-sm font-semibold">{celebration.title}</p>
      <p className="text-muted-foreground mt-1 text-xs">{celebration.body}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss achievement notification"
        className="focus-ring text-muted-foreground mt-2 text-xs underline"
      >
        Dismiss
      </button>
    </motion.div>
  );
}
