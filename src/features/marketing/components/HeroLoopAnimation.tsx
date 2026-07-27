"use client";

import { motion } from "framer-motion";
import { CheckCircle2, FileText, Sparkles, UserRound } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";
import { useTabVisible } from "@/lib/motion/useTabVisible";

/**
 * Original decorative "loop" scene: a fictional job card travels the accept
 * path into a review node and returns as a glowing offer; a fictional
 * candidate card travels the reject path into a decision node and returns.
 * Purely decorative (aria-hidden) — equivalent information is provided as
 * visible text alongside the hero.
 */
export function HeroLoopAnimation() {
  const reducedMotion = usePrefersReducedMotion();
  const tabVisible = useTabVisible();
  const shouldAnimate = !reducedMotion && tabVisible;

  const loopTransition = {
    duration: 6,
    repeat: shouldAnimate ? Infinity : 0,
    ease: [0.4, 0, 0.2, 1] as const,
  };

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto flex h-72 w-full max-w-md items-center justify-center sm:h-80"
    >
      <svg
        viewBox="0 0 320 280"
        className="text-border absolute inset-0 h-full w-full"
        fill="none"
      >
        <path
          d="M160 30C90 30 40 90 40 140s50 110 120 110"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        <path
          d="M160 30c70 0 120 60 120 110s-50 110-120 110"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
      </svg>

      <motion.div
        className="border-accept/30 bg-surface text-foreground absolute top-10 left-6 flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-xs font-medium shadow-[var(--shadow-soft)] sm:left-10"
        animate={
          shouldAnimate
            ? {
                x: [0, 40, 90, 40, 0],
                y: [0, 40, 90, 140, 200],
                opacity: [1, 1, 0.6, 1, 1],
              }
            : undefined
        }
        transition={loopTransition}
      >
        <FileText className="text-accept h-4 w-4" />
        Fictional job
      </motion.div>

      <motion.div
        className="bg-brand-muted text-brand flex h-16 w-16 items-center justify-center rounded-full shadow-[var(--shadow-soft)]"
        animate={shouldAnimate ? { scale: [1, 1.08, 1] } : undefined}
        transition={{
          ...loopTransition,
          duration: 3,
          repeat: shouldAnimate ? Infinity : 0,
        }}
      >
        <Sparkles className="h-7 w-7" />
      </motion.div>

      <motion.div
        className="border-accept/30 bg-accept-muted text-accept absolute bottom-10 left-6 flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-xs font-medium shadow-[var(--shadow-soft)] sm:left-10"
        animate={shouldAnimate ? { opacity: [0, 1, 1, 0] } : undefined}
        transition={{ ...loopTransition, delay: 3 }}
      >
        <CheckCircle2 className="h-4 w-4" />
        Simulated offer
      </motion.div>

      <motion.div
        className="border-reject/30 bg-surface text-foreground absolute top-10 right-6 flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-xs font-medium shadow-[var(--shadow-soft)] sm:right-10"
        animate={
          shouldAnimate
            ? {
                x: [0, -40, -90, -40, 0],
                y: [0, 40, 90, 140, 200],
                opacity: [1, 1, 0.6, 1, 1],
              }
            : undefined
        }
        transition={loopTransition}
      >
        <UserRound className="text-reject h-4 w-4" />
        Fictional candidate
      </motion.div>

      <motion.div
        className="border-reject/30 bg-reject-muted text-reject absolute right-6 bottom-10 flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-xs font-medium shadow-[var(--shadow-soft)] sm:right-10"
        animate={shouldAnimate ? { opacity: [0, 1, 1, 0] } : undefined}
        transition={{ ...loopTransition, delay: 3 }}
      >
        Decision made
      </motion.div>
    </div>
  );
}
