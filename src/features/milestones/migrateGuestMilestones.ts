import { mergeGuestAchievements } from "@/features/milestones/calculate";
import {
  readLifetimeProgress,
  writeLifetimeProgress,
} from "@/features/milestones/storage";
import type { LifetimeProgress } from "@/features/milestones/types";

/**
 * Merge guest device milestone progress into an authenticated user scope.
 * - Keeps earliest unlock dates
 * - Marks all existing milestones as already displayed (no celebration replay)
 * - Does not double-count: uses max of each category count
 * Policy: unlocked achievements are preserved as historical accomplishments.
 */
export function migrateGuestMilestones(userId: string): {
  achievementsMerged: number;
  countsSynced: boolean;
} {
  const guest = readLifetimeProgress(null);
  const account = readLifetimeProgress(userId);

  const mergedAchievements = mergeGuestAchievements(
    account.unlockedAchievements,
    guest.unlockedAchievements,
  );

  const mergedCounts = {
    applications: Math.max(account.counts.applications, guest.counts.applications),
    rejections: Math.max(account.counts.rejections, guest.counts.rejections),
    shortlists: Math.max(account.counts.shortlists, guest.counts.shortlists),
    offers_sent: Math.max(account.counts.offers_sent, guest.counts.offers_sent),
    offers_received: Math.max(
      account.counts.offers_received,
      guest.counts.offers_received,
    ),
    saved_jobs: Math.max(account.counts.saved_jobs, guest.counts.saved_jobs),
  };

  const displayedKeys = new Set([
    ...account.displayedMilestones.map((d) => d.milestoneKey),
    ...guest.displayedMilestones.map((d) => d.milestoneKey),
    ...mergedAchievements.map((a) => `achievement:${a.achievementCode}`),
  ]);

  const now = new Date().toISOString();
  const displayedMilestones = Array.from(displayedKeys).map((milestoneKey) => {
    const existing =
      account.displayedMilestones.find((d) => d.milestoneKey === milestoneKey) ??
      guest.displayedMilestones.find((d) => d.milestoneKey === milestoneKey);
    return (
      existing ?? {
        milestoneKey,
        displayedAt: now,
        sessionId: "migration",
        version: 1 as const,
      }
    );
  });

  const next: LifetimeProgress = {
    version: 1,
    counts: mergedCounts,
    unlockedAchievements: mergedAchievements.map((a) => ({
      ...a,
      // Preserve earliest; mark metadata lightly for debugging without PII
    })),
    displayedMilestones,
    recentPlayfulLines: [
      ...account.recentPlayfulLines,
      ...guest.recentPlayfulLines,
    ].slice(-12),
  };

  writeLifetimeProgress(next, userId);

  return {
    achievementsMerged: mergedAchievements.length,
    countsSynced: true,
  };
}
