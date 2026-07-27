"use client";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";

export function Skeleton({ className }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "rounded-[var(--radius-md)]",
        reducedMotion ? "skeleton-pulse" : "skeleton-shimmer",
        className,
      )}
    />
  );
}
