"use client";

import { motion, useReducedMotion } from "framer-motion";
import { getAchievementByCode } from "../catalog";
import type { AchievementCode } from "../types";

interface AchievementBadgeProps {
  code: AchievementCode;
  unlocked: boolean;
  unlockedAt?: string;
  currentProgress?: number;
  compact?: boolean;
}

export function AchievementBadge({
  code,
  unlocked,
  unlockedAt,
  currentProgress,
  compact = false,
}: AchievementBadgeProps) {
  const def = getAchievementByCode(code);
  const reduceMotion = useReducedMotion();
  if (!def) return null;

  const progress = currentProgress ?? 0;
  const ratio = Math.min(1, progress / def.threshold);

  return (
    <motion.article
      data-testid={`achievement-badge-${code}`}
      data-unlocked={unlocked ? "true" : "false"}
      initial={false}
      animate={
        unlocked && !reduceMotion
          ? { rotate: [0, -2, 2, 0], scale: [1, 1.03, 1] }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.45 }}
      className={`border-border flex flex-col gap-2 rounded-[var(--radius-lg)] border p-4 ${
        unlocked ? "bg-brand-muted/40" : "bg-surface-muted/40 opacity-80"
      } ${compact ? "min-h-0" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-foreground text-sm font-semibold">{def.name}</p>
          <p className="text-muted-foreground mt-1 text-xs">{def.description}</p>
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase ${
            unlocked
              ? "bg-brand text-brand-foreground"
              : "bg-surface-muted text-muted-foreground"
          }`}
        >
          {unlocked ? "Unlocked" : "Locked"}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={`Progress toward ${def.name}`}
        aria-valuemin={0}
        aria-valuemax={def.threshold}
        aria-valuenow={Math.min(progress, def.threshold)}
        className="bg-surface-muted h-2 overflow-hidden rounded-full"
      >
        <div
          className={`h-full rounded-full ${unlocked ? "bg-brand" : "bg-muted-foreground/40"}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>

      <p className="text-muted-foreground text-xs tabular-nums">
        {Math.min(progress, def.threshold)} / {def.threshold}
        {!unlocked && progress < def.threshold
          ? ` · ${def.threshold - progress} more`
          : null}
      </p>

      {unlocked && unlockedAt ? (
        <p className="text-muted-foreground text-[11px]">
          Unlocked {new Date(unlockedAt).toLocaleDateString()}
        </p>
      ) : null}

      <p className="text-muted-foreground text-[11px]">{def.fictionalDisclaimer}</p>
    </motion.article>
  );
}
