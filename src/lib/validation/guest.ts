import { z } from "zod";
import {
  quickRejectionDefaultCodeSchema,
  type QuickRejectionDefaultCode,
} from "@/features/reject/services/rejectionReasons";

export const celebrationIntensitySchema = z.enum(["minimal", "standard", "maximum"]);
export const themePreferenceSchema = z.enum(["system", "light", "dark"]);
export const workArrangementSchema = z.enum(["remote", "hybrid", "onsite"]);
export const experienceLevelSchema = z.enum([
  "entry",
  "associate",
  "mid",
  "senior",
  "lead",
  "manager",
]);

export const guestProfileSchema = z.object({
  displayName: z.string().min(1).max(60).default("Future You"),
  preferredField: z.string().max(80).nullable().default(null),
  preferredRole: z.string().max(80).nullable().default(null),
  experienceLevel: experienceLevelSchema.nullable().default(null),
  preferredWorkArrangement: workArrangementSchema.nullable().default(null),
});
export type GuestProfile = z.infer<typeof guestProfileSchema>;

export const guestSettingsSchema = z.object({
  celebrationIntensity: celebrationIntensitySchema.default("standard"),
  confettiEnabled: z.boolean().default(true),
  soundEnabled: z.boolean().default(false),
  reducedMotion: z.boolean().default(false),
  themePreference: themePreferenceSchema.default("system"),
  /** When true, Reject uses the configured default reason without opening the dialog. Off by default. */
  quickRejectionEnabled: z.boolean().default(false),
  /** Must be a predefined job-related reason; `other` is not allowed as the automatic default. */
  defaultRejectionReason: quickRejectionDefaultCodeSchema.default("skills_mismatch"),
});
export type GuestSettings = z.infer<typeof guestSettingsSchema>;
export type { QuickRejectionDefaultCode };

export const guestOfferSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  applicationId: z.string().nullable().default(null),
  recipientDisplayName: z.string(),
  fictionalStartDate: z.string(),
  fictionalManagerName: z.string(),
  salaryMin: z.number(),
  salaryMax: z.number(),
  signingBonus: z.number().optional(),
  currency: z.string().default("USD"),
  workArrangement: workArrangementSchema,
  offerMessage: z.string(),
  simulationVersion: z.string(),
  createdAt: z.string(),
});
export type GuestOffer = z.infer<typeof guestOfferSchema>;
export const guestOffersSchema = z.array(guestOfferSchema);

export const guestSavedJobSchema = z.object({
  jobId: z.string(),
  createdAt: z.string(),
});
export type GuestSavedJob = z.infer<typeof guestSavedJobSchema>;
export const guestSavedJobsSchema = z.array(guestSavedJobSchema);

export const guestApplicationSchema = z.object({
  jobId: z.string(),
  status: z.enum(["accepted", "saved"]),
  createdAt: z.string(),
});
export type GuestApplication = z.infer<typeof guestApplicationSchema>;
export const guestApplicationsSchema = z.array(guestApplicationSchema);

export const simulationActionTypeSchema = z.enum([
  "job_viewed",
  "job_skipped",
  "job_saved",
  "job_applied",
  "offer_created",
  "offer_celebrated",
  "candidate_viewed",
  "candidate_rejected",
  "candidate_shortlisted",
  "candidate_offered",
  "action_undone",
  "deck_reset",
  "guest_data_migrated",
]);

export const guestActionSchema = z.object({
  actionType: simulationActionTypeSchema,
  jobId: z.string().nullable().default(null),
  candidateId: z.string().nullable().default(null),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string(),
});
export type GuestAction = z.infer<typeof guestActionSchema>;
export const guestActionsSchema = z.array(guestActionSchema);
