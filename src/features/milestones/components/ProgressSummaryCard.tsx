"use client";

import { ACHIEVEMENT_CATALOG } from "../catalog";
import { totalFromCounts, type CategoryCounts, type UnlockedAchievement } from "../types";
import { AchievementBadge } from "./AchievementBadge";

interface ProgressSummaryCardProps {
  counts: CategoryCounts;
  unlocked: UnlockedAchievement[];
  isGuest: boolean;
}

export function ProgressSummaryCard({
  counts,
  unlocked,
  isGuest,
}: ProgressSummaryCardProps) {
  const total = totalFromCounts(counts);
  const unlockedCodes = new Set(unlocked.map((a) => a.achievementCode));
  const unlockedAtByCode = new Map(
    unlocked.map((a) => [a.achievementCode, a.unlockedAt] as const),
  );

  return (
    <section
      data-testid="progress-summary-card"
      className="border-border bg-surface flex flex-col gap-5 rounded-[var(--radius-lg)] border p-6"
    >
      <div>
        <h2 className="text-foreground text-lg font-semibold">Achievements</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Playful milestones from your fictional OfferLoop activity.
        </p>
        <p className="text-muted-foreground mt-2 text-xs">
          {isGuest ? "Stored on this device" : "Synced to your OfferLoop account"}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground text-xs">Total actions</dt>
          <dd className="text-foreground font-semibold tabular-nums">{total}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Applications</dt>
          <dd className="text-foreground font-semibold tabular-nums">
            {counts.applications}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Rejections</dt>
          <dd className="text-foreground font-semibold tabular-nums">
            {counts.rejections}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Shortlists</dt>
          <dd className="text-foreground font-semibold tabular-nums">
            {counts.shortlists}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Offers sent</dt>
          <dd className="text-foreground font-semibold tabular-nums">
            {counts.offers_sent}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Offers received</dt>
          <dd className="text-foreground font-semibold tabular-nums">
            {counts.offers_received}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Saved jobs</dt>
          <dd className="text-foreground font-semibold tabular-nums">
            {counts.saved_jobs}
          </dd>
        </div>
      </dl>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ACHIEVEMENT_CATALOG.filter((a) => !a.hidden).map((def) => {
          const progress =
            def.category === "total"
              ? total
              : counts[def.category as keyof CategoryCounts];
          return (
            <AchievementBadge
              key={def.code}
              code={def.code}
              unlocked={unlockedCodes.has(def.code)}
              unlockedAt={unlockedAtByCode.get(def.code)}
              currentProgress={progress}
            />
          );
        })}
      </div>
    </section>
  );
}
