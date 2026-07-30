import {
  ACHIEVEMENT_CATALOG,
  CATEGORY_MILESTONE_THRESHOLDS,
  COMBINED_MILESTONE_THRESHOLDS,
  getAchievementByCode,
} from "./catalog";
import { getDialogCopy, getSummaryCopy, getToastCopy } from "./milestoneCopy";
import type {
  AchievementCode,
  CategoryCounts,
  CelebrationKind,
  MilestoneActionKind,
  MilestoneCategory,
  MilestoneThreshold,
  PendingCelebration,
  UnlockedAchievement,
} from "./types";
import {
  ACTION_KIND_TO_CATEGORY,
  emptyCategoryCounts,
  milestoneKey,
  totalFromCounts,
} from "./types";

export function mapActionKindToCategory(
  kind: MilestoneActionKind,
): Exclude<MilestoneCategory, "total"> {
  return ACTION_KIND_TO_CATEGORY[kind];
}

export function isSupportedMilestoneAction(value: string): value is MilestoneActionKind {
  return value in ACTION_KIND_TO_CATEGORY;
}

/** Map repository SimulationActionType → milestone action kind when supported. */
export function simulationTypeToMilestoneKind(type: string): MilestoneActionKind | null {
  switch (type) {
    case "job_applied":
      return "fictional_application_submitted";
    case "candidate_rejected":
      return "fictional_candidate_rejected";
    case "candidate_shortlisted":
      return "fictional_candidate_shortlisted";
    case "candidate_offered":
      return "fictional_offer_sent";
    case "offer_created":
      return "fictional_offer_received";
    case "job_saved":
      return "fictional_job_saved";
    default:
      return null;
  }
}

export function incrementCounts(
  counts: CategoryCounts,
  category: Exclude<MilestoneCategory, "total">,
  delta = 1,
): CategoryCounts {
  const next = { ...counts };
  next[category] = Math.max(0, next[category] + delta);
  return next;
}

export function crossedThresholds(
  previous: number,
  next: number,
  thresholds: readonly MilestoneThreshold[],
): MilestoneThreshold[] {
  return thresholds.filter((t) => previous < t && next >= t);
}

export function celebrationKindForThreshold(
  threshold: MilestoneThreshold,
): CelebrationKind {
  if (threshold >= 50) return "summary";
  if (threshold >= 25) return "achievement";
  if (threshold >= 10) return "dialog";
  return "toast";
}

export interface MilestoneEvaluationInput {
  previousCounts: CategoryCounts;
  nextCounts: CategoryCounts;
  unlockedCodes: ReadonlySet<AchievementCode>;
  displayedKeys: ReadonlySet<string>;
  recentPlayfulLines: readonly string[];
  /** Category that just incremented (excluding total). */
  triggeredCategory: Exclude<MilestoneCategory, "total">;
}

export interface MilestoneEvaluationResult {
  celebrations: PendingCelebration[];
  newlyUnlocked: UnlockedAchievement[];
  playfulLinesUsed: string[];
}

/**
 * Evaluate milestones after one successful action.
 * Priority: permanent achievement → category milestone → combined total.
 * Returns ordered celebrations; caller should show at most one full celebration
 * and queue the rest as badge notifications.
 */
export function evaluateMilestones(
  input: MilestoneEvaluationInput,
): MilestoneEvaluationResult {
  const {
    previousCounts,
    nextCounts,
    unlockedCodes,
    displayedKeys,
    recentPlayfulLines,
    triggeredCategory,
  } = input;

  const previousTotal = totalFromCounts(previousCounts);
  const nextTotal = totalFromCounts(nextCounts);
  const now = new Date().toISOString();
  const celebrations: PendingCelebration[] = [];
  const newlyUnlocked: UnlockedAchievement[] = [];
  const playfulLinesUsed: string[] = [];
  let recent = [...recentPlayfulLines];

  const takeLine = (line: string) => {
    playfulLinesUsed.push(line);
    recent = [...recent, line].slice(-12);
  };

  // 1. Achievements (permanent)
  for (const def of ACHIEVEMENT_CATALOG) {
    if (unlockedCodes.has(def.code)) continue;
    const progress =
      def.category === "total"
        ? nextTotal
        : nextCounts[def.category as keyof CategoryCounts];
    const previousProgress =
      def.category === "total"
        ? previousTotal
        : previousCounts[def.category as keyof CategoryCounts];
    if (previousProgress >= def.threshold || progress < def.threshold) continue;

    newlyUnlocked.push({
      achievementCode: def.code,
      unlockedAt: now,
      progressAtUnlock: progress,
      category: def.category,
      version: 1,
    });

    const key = `achievement:${def.code}`;
    if (!displayedKeys.has(key)) {
      celebrations.push({
        id: key,
        kind: "achievement",
        category: def.category,
        threshold: def.threshold,
        milestoneKey: key,
        title: def.name,
        body: def.description,
        playfulLine: def.fictionalDisclaimer,
        achievementCode: def.code,
      });
    }
  }

  // 2. Category milestones for the triggered category
  const categoryThresholds = CATEGORY_MILESTONE_THRESHOLDS[triggeredCategory];
  const previousCat = previousCounts[triggeredCategory];
  const nextCat = nextCounts[triggeredCategory];
  for (const threshold of crossedThresholds(previousCat, nextCat, categoryThresholds)) {
    const key = milestoneKey(triggeredCategory, threshold);
    if (displayedKeys.has(key)) continue;
    // Skip if an achievement celebration already covers this exact threshold
    const matchingAchievement = ACHIEVEMENT_CATALOG.find(
      (a) =>
        a.category === triggeredCategory &&
        a.threshold === threshold &&
        newlyUnlocked.some((u) => u.achievementCode === a.code),
    );
    if (matchingAchievement) continue;

    const kind = celebrationKindForThreshold(threshold);
    if (kind === "toast") {
      const copy = getToastCopy(triggeredCategory, threshold, recent);
      takeLine(copy.playfulLine);
      celebrations.push({
        id: key,
        kind,
        category: triggeredCategory,
        threshold,
        milestoneKey: key,
        ...copy,
      });
    } else if (kind === "dialog") {
      const copy = getDialogCopy(triggeredCategory, threshold, recent);
      takeLine(copy.playfulLine);
      celebrations.push({
        id: key,
        kind,
        category: triggeredCategory,
        threshold,
        milestoneKey: key,
        ...copy,
      });
    } else if (kind === "summary") {
      const copy = getSummaryCopy(recent);
      takeLine(copy.playfulLine);
      celebrations.push({
        id: key,
        kind: "summary",
        category: triggeredCategory,
        threshold,
        milestoneKey: key,
        ...copy,
        summaryCounts: { ...nextCounts, total: nextTotal },
      });
    } else {
      // achievement-style category milestone without a catalog entry
      const copy = getDialogCopy(triggeredCategory, threshold, recent);
      takeLine(copy.playfulLine);
      celebrations.push({
        id: key,
        kind: "achievement",
        category: triggeredCategory,
        threshold,
        milestoneKey: key,
        ...copy,
      });
    }
  }

  // 3. Combined total milestones
  for (const threshold of crossedThresholds(
    previousTotal,
    nextTotal,
    COMBINED_MILESTONE_THRESHOLDS,
  )) {
    const key = milestoneKey("total", threshold);
    if (displayedKeys.has(key)) continue;
    const coveredByAchievement = newlyUnlocked.some((u) => {
      const def = getAchievementByCode(u.achievementCode);
      return def?.category === "total" && def.threshold === threshold;
    });
    if (coveredByAchievement) continue;

    const kind = celebrationKindForThreshold(threshold);
    if (kind === "summary" || threshold === 50) {
      const copy = getSummaryCopy(recent);
      takeLine(copy.playfulLine);
      celebrations.push({
        id: key,
        kind: "summary",
        category: "total",
        threshold,
        milestoneKey: key,
        title: copy.title,
        body: `${threshold} fictional actions completed`,
        playfulLine: copy.playfulLine,
        summaryCounts: { ...nextCounts, total: nextTotal },
      });
    } else if (kind === "dialog" || threshold === 10 || threshold === 25) {
      const copy = getDialogCopy("total", threshold, recent);
      takeLine(copy.playfulLine);
      celebrations.push({
        id: key,
        kind: threshold >= 25 ? "achievement" : "dialog",
        category: "total",
        threshold,
        milestoneKey: key,
        ...copy,
      });
    } else {
      const copy = getToastCopy("total", threshold, recent);
      takeLine(copy.playfulLine);
      celebrations.push({
        id: key,
        kind: "toast",
        category: "total",
        threshold,
        milestoneKey: key,
        ...copy,
      });
    }
  }

  // Priority sort: achievement → category (non-total) → total
  celebrations.sort((a, b) => {
    const rank = (c: PendingCelebration) => {
      if (c.kind === "achievement" || c.achievementCode) return 0;
      if (c.category !== "total") return 1;
      return 2;
    };
    return rank(a) - rank(b);
  });

  return { celebrations, newlyUnlocked, playfulLinesUsed };
}

/**
 * Pick the primary celebration and secondary badge notifications.
 * At most one full celebration (dialog/summary/toast); extras become badges.
 */
export function partitionCelebrations(celebrations: PendingCelebration[]): {
  primary: PendingCelebration | null;
  badges: PendingCelebration[];
} {
  if (celebrations.length === 0) return { primary: null, badges: [] };
  const [primary, ...rest] = celebrations;
  const badges = rest.map((c) =>
    c.kind === "toast"
      ? c
      : {
          ...c,
          kind: "achievement" as const,
        },
  );
  return { primary: primary ?? null, badges };
}

export function mergeGuestAchievements(
  existing: UnlockedAchievement[],
  incoming: UnlockedAchievement[],
): UnlockedAchievement[] {
  const byCode = new Map<AchievementCode, UnlockedAchievement>();
  for (const a of existing) {
    byCode.set(a.achievementCode, a);
  }
  for (const a of incoming) {
    const prev = byCode.get(a.achievementCode);
    if (!prev) {
      byCode.set(a.achievementCode, a);
      continue;
    }
    // Keep earliest unlock date
    const keep =
      new Date(a.unlockedAt).getTime() < new Date(prev.unlockedAt).getTime() ? a : prev;
    byCode.set(a.achievementCode, keep);
  }
  return Array.from(byCode.values());
}

export function progressTowardNext(
  counts: CategoryCounts,
  unlockedCodes: ReadonlySet<AchievementCode>,
): {
  next: (typeof ACHIEVEMENT_CATALOG)[number] | null;
  current: number;
  remaining: number;
} {
  const total = totalFromCounts(counts);
  for (const def of ACHIEVEMENT_CATALOG) {
    if (unlockedCodes.has(def.code) || def.hidden) continue;
    const current =
      def.category === "total" ? total : counts[def.category as keyof CategoryCounts];
    if (current < def.threshold) {
      return {
        next: def,
        current,
        remaining: def.threshold - current,
      };
    }
  }
  return { next: null, current: total, remaining: 0 };
}

export { emptyCategoryCounts, totalFromCounts };
