import type { AchievementCode, MilestoneCategory, MilestoneThreshold } from "./types";

export interface AchievementDefinition {
  code: AchievementCode;
  name: string;
  description: string;
  category: MilestoneCategory;
  threshold: MilestoneThreshold;
  icon: string;
  sortOrder: number;
  hidden: boolean;
  fictionalDisclaimer: string;
}

/**
 * Stable catalog of OfferLoop achievements. Thresholds here drive unlock
 * checks — keep in sync with CATEGORY_MILESTONE_THRESHOLDS where they overlap.
 */
export const ACHIEVEMENT_CATALOG: readonly AchievementDefinition[] = [
  {
    code: "first_application",
    name: "First Leap",
    description: "Submitted the first fictional application.",
    category: "applications",
    threshold: 1,
    icon: "spark",
    sortOrder: 10,
    hidden: false,
    fictionalDisclaimer: "Fictional simulation — no real application was submitted.",
  },
  {
    code: "application_sprint",
    name: "Application Sprint",
    description: "Completed 5 fictional applications.",
    category: "applications",
    threshold: 5,
    icon: "sprint",
    sortOrder: 20,
    hidden: false,
    fictionalDisclaimer: "Fictional simulation — no real application was submitted.",
  },
  {
    code: "application_machine",
    name: "Application Machine",
    description: "Completed 10 fictional applications.",
    category: "applications",
    threshold: 10,
    icon: "machine",
    sortOrder: 30,
    hidden: false,
    fictionalDisclaimer: "Fictional simulation — no real application was submitted.",
  },
  {
    code: "application_veteran",
    name: "Résumé Marathon",
    description: "Completed 25 fictional applications.",
    category: "applications",
    threshold: 25,
    icon: "marathon",
    sortOrder: 40,
    hidden: false,
    fictionalDisclaimer: "Fictional simulation — no real application was submitted.",
  },
  {
    code: "application_legend",
    name: "Imaginary Career Athlete",
    description: "Completed 50 fictional applications.",
    category: "applications",
    threshold: 50,
    icon: "legend",
    sortOrder: 50,
    hidden: false,
    fictionalDisclaimer: "Fictional simulation — no real application was submitted.",
  },
  {
    code: "first_rejection",
    name: "First Decision",
    description: "Rejected the first fictional candidate.",
    category: "rejections",
    threshold: 1,
    icon: "gavel",
    sortOrder: 60,
    hidden: false,
    fictionalDisclaimer: "Fictional simulation — no real careers were affected.",
  },
  {
    code: "rejection_sprint",
    name: "Hiring Committee",
    description: "Completed 5 fictional candidate rejections.",
    category: "rejections",
    threshold: 5,
    icon: "committee",
    sortOrder: 70,
    hidden: false,
    fictionalDisclaimer: "Fictional simulation — no real careers were affected.",
  },
  {
    code: "the_decider",
    name: "The Decider",
    description: "Completed 10 fictional candidate rejections.",
    category: "rejections",
    threshold: 10,
    icon: "decider",
    sortOrder: 80,
    hidden: false,
    fictionalDisclaimer: "Fictional simulation — no real careers were affected.",
  },
  {
    code: "imaginary_recruiter",
    name: "Imaginary Recruiter",
    description: "Completed 25 fictional hiring decisions.",
    category: "rejections",
    threshold: 25,
    icon: "recruiter",
    sortOrder: 90,
    hidden: false,
    fictionalDisclaimer: "Fictional simulation — no real careers were affected.",
  },
  {
    code: "virtual_hr_director",
    name: "Virtual HR Director",
    description: "Completed 50 fictional hiring decisions.",
    category: "rejections",
    threshold: 50,
    icon: "director",
    sortOrder: 100,
    hidden: false,
    fictionalDisclaimer: "Fictional simulation — no real careers were affected.",
  },
  {
    code: "shortlist_scout",
    name: "Talent Scout",
    description: "Shortlisted 10 fictional candidates.",
    category: "shortlists",
    threshold: 10,
    icon: "scout",
    sortOrder: 110,
    hidden: false,
    fictionalDisclaimer: "Fictional simulation — shortlists stay imaginary.",
  },
  {
    code: "offer_collector",
    name: "Offer Collector",
    description: "Received 5 fictional offers.",
    category: "offers_received",
    threshold: 5,
    icon: "collector",
    sortOrder: 120,
    hidden: false,
    fictionalDisclaimer: "Fictional simulation — no real offer was received.",
  },
  {
    code: "offer_architect",
    name: "Offer Architect",
    description: "Sent 10 fictional offers.",
    category: "offers_sent",
    threshold: 10,
    icon: "architect",
    sortOrder: 130,
    hidden: false,
    fictionalDisclaimer: "Fictional simulation — no real offer was sent.",
  },
  {
    code: "inbox_zeroish",
    name: "Inbox Zero-ish",
    description: "Completed 50 total OfferLoop actions.",
    category: "total",
    threshold: 50,
    icon: "inbox",
    sortOrder: 140,
    hidden: false,
    fictionalDisclaimer: "Fictional simulation — imaginary productivity only.",
  },
  {
    code: "offerloop_regular",
    name: "OfferLoop Regular",
    description: "Completed 100 total OfferLoop actions.",
    category: "total",
    threshold: 100,
    icon: "regular",
    sortOrder: 150,
    hidden: false,
    fictionalDisclaimer: "Fictional simulation — imaginary productivity only.",
  },
] as const;

export function getAchievementByCode(
  code: AchievementCode,
): AchievementDefinition | undefined {
  return ACHIEVEMENT_CATALOG.find((a) => a.code === code);
}

/** Category celebration thresholds (not including first-action achievements). */
export const CATEGORY_MILESTONE_THRESHOLDS: Record<
  Exclude<import("./types").MilestoneCategory, "total">,
  readonly MilestoneThreshold[]
> = {
  applications: [5, 10, 25, 50],
  rejections: [5, 10, 25, 50],
  shortlists: [5, 10, 25],
  offers_sent: [5, 10, 25],
  offers_received: [5, 10, 25],
  saved_jobs: [5, 10, 25],
};

export const COMBINED_MILESTONE_THRESHOLDS: readonly MilestoneThreshold[] = [
  10, 25, 50, 100,
];
