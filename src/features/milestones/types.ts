import { z } from "zod";

export const MILESTONE_CATEGORIES = [
  "applications",
  "rejections",
  "shortlists",
  "offers_sent",
  "offers_received",
  "saved_jobs",
  "total",
] as const;

export type MilestoneCategory = (typeof MILESTONE_CATEGORIES)[number];

export const MILESTONE_THRESHOLDS = [1, 5, 10, 25, 50, 100] as const;
export type MilestoneThreshold = (typeof MILESTONE_THRESHOLDS)[number];

export const ACHIEVEMENT_CODES = [
  "first_application",
  "application_sprint",
  "application_machine",
  "application_veteran",
  "application_legend",
  "first_rejection",
  "rejection_sprint",
  "the_decider",
  "imaginary_recruiter",
  "virtual_hr_director",
  "shortlist_scout",
  "offer_collector",
  "offer_architect",
  "inbox_zeroish",
  "offerloop_regular",
] as const;

export type AchievementCode = (typeof ACHIEVEMENT_CODES)[number];

/** Action kinds that feed the milestone system after a successful repository write. */
export const MILESTONE_ACTION_KINDS = [
  "fictional_application_submitted",
  "fictional_candidate_rejected",
  "fictional_candidate_shortlisted",
  "fictional_offer_sent",
  "fictional_offer_received",
  "fictional_job_saved",
] as const;

export type MilestoneActionKind = (typeof MILESTONE_ACTION_KINDS)[number];

export const ACTION_KIND_TO_CATEGORY: Record<
  MilestoneActionKind,
  Exclude<MilestoneCategory, "total">
> = {
  fictional_application_submitted: "applications",
  fictional_candidate_rejected: "rejections",
  fictional_candidate_shortlisted: "shortlists",
  fictional_offer_sent: "offers_sent",
  fictional_offer_received: "offers_received",
  fictional_job_saved: "saved_jobs",
};

/** Reuses app-wide celebration intensity; "maximum" maps to Extra in the UI. */
export type CelebrationIntensityPref = "minimal" | "standard" | "maximum";

export const milestoneSettingsSchema = z.object({
  version: z.literal(1).default(1),
  celebrationsEnabled: z.boolean().default(true),
  /** Prefer reading MotionPreference / guest settings; kept for isolation & tests. */
  celebrationIntensity: z.enum(["minimal", "standard", "maximum"]).default("standard"),
  celebrationSoundEnabled: z.boolean().default(false),
  achievementNotificationsEnabled: z.boolean().default(true),
});

export type MilestoneSettings = z.infer<typeof milestoneSettingsSchema>;

export const categoryCountsSchema = z.object({
  applications: z.number().int().nonnegative().default(0),
  rejections: z.number().int().nonnegative().default(0),
  shortlists: z.number().int().nonnegative().default(0),
  offers_sent: z.number().int().nonnegative().default(0),
  offers_received: z.number().int().nonnegative().default(0),
  saved_jobs: z.number().int().nonnegative().default(0),
});

export type CategoryCounts = z.infer<typeof categoryCountsSchema>;

export function emptyCategoryCounts(): CategoryCounts {
  return {
    applications: 0,
    rejections: 0,
    shortlists: 0,
    offers_sent: 0,
    offers_received: 0,
    saved_jobs: 0,
  };
}

export function totalFromCounts(counts: CategoryCounts): number {
  return (
    counts.applications +
    counts.rejections +
    counts.shortlists +
    counts.offers_sent +
    counts.offers_received +
    counts.saved_jobs
  );
}

export const unlockedAchievementSchema = z.object({
  achievementCode: z.enum(ACHIEVEMENT_CODES),
  unlockedAt: z.string(),
  progressAtUnlock: z.number().int().nonnegative(),
  category: z.enum(MILESTONE_CATEGORIES),
  version: z.literal(1).default(1),
});

export type UnlockedAchievement = z.infer<typeof unlockedAchievementSchema>;

export const displayedMilestoneSchema = z.object({
  milestoneKey: z.string().min(1),
  displayedAt: z.string(),
  sessionId: z.string().optional(),
  version: z.literal(1).default(1),
});

export type DisplayedMilestone = z.infer<typeof displayedMilestoneSchema>;

export const lifetimeProgressSchema = z.object({
  version: z.literal(1).default(1),
  counts: categoryCountsSchema.default(emptyCategoryCounts()),
  unlockedAchievements: z.array(unlockedAchievementSchema).default([]),
  displayedMilestones: z.array(displayedMilestoneSchema).default([]),
  recentPlayfulLines: z.array(z.string()).max(20).default([]),
});

export type LifetimeProgress = z.infer<typeof lifetimeProgressSchema>;

export const sessionProgressSchema = z.object({
  version: z.literal(1).default(1),
  sessionId: z.string(),
  counts: categoryCountsSchema.default(emptyCategoryCounts()),
  startedAt: z.string(),
});

export type SessionProgress = z.infer<typeof sessionProgressSchema>;

export type CelebrationKind = "toast" | "dialog" | "achievement" | "summary";

export interface PendingCelebration {
  id: string;
  kind: CelebrationKind;
  category: MilestoneCategory;
  threshold: MilestoneThreshold;
  milestoneKey: string;
  title: string;
  body: string;
  playfulLine: string;
  achievementCode?: AchievementCode;
  summaryCounts?: CategoryCounts & { total: number };
}

export function milestoneKey(
  category: MilestoneCategory,
  threshold: MilestoneThreshold,
): string {
  return `${category}:${threshold}`;
}
