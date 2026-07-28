import { z } from "zod";

/**
 * Stable rejection reason codes for OfferLoop Reject Mode.
 * Labels are UI-facing; codes are what we persist in simulation_actions.metadata.
 * Intentionally job-related only — no protected-characteristic reasons.
 *
 * Future extension: a private rejection-history UI (Profile/Settings) can list
 * guest or authenticated `candidate_rejected` actions with reasonCode,
 * reasonLabel, optional comment, and timestamp. The repository + metadata
 * shape below already support that; no public exposure is intended.
 */
export const REJECTION_REASON_CODES = [
  "skills_mismatch",
  "insufficient_relevant_experience",
  "experience_not_aligned",
  "salary_mismatch",
  "location_or_work_arrangement_mismatch",
  "availability_mismatch",
  "overqualified",
  "another_candidate_selected",
  "role_not_right_fit",
  "other",
] as const;

export type RejectionReasonCode = (typeof REJECTION_REASON_CODES)[number];

/** Codes allowed as the automatic default for Quick rejection mode (`other` excluded). */
export const QUICK_REJECTION_DEFAULT_CODES = REJECTION_REASON_CODES.filter(
  (code) => code !== "other",
) as Exclude<RejectionReasonCode, "other">[];

export type QuickRejectionDefaultCode = (typeof QUICK_REJECTION_DEFAULT_CODES)[number];

export const REJECTION_REASONS: ReadonlyArray<{
  code: RejectionReasonCode;
  label: string;
}> = [
  { code: "skills_mismatch", label: "Skills do not match" },
  {
    code: "insufficient_relevant_experience",
    label: "Not enough relevant experience",
  },
  {
    code: "experience_not_aligned",
    label: "Experience is not aligned with this role",
  },
  {
    code: "salary_mismatch",
    label: "Salary expectations are outside the fictional range",
  },
  {
    code: "location_or_work_arrangement_mismatch",
    label: "Location or work arrangement does not match",
  },
  { code: "availability_mismatch", label: "Availability does not match" },
  { code: "overqualified", label: "Overqualified for this fictional role" },
  {
    code: "another_candidate_selected",
    label: "Another fictional candidate was selected",
  },
  { code: "role_not_right_fit", label: "Role is not the right fit" },
  { code: "other", label: "Other" },
];

export const REJECTION_REASON_LABEL_BY_CODE: Record<RejectionReasonCode, string> =
  Object.fromEntries(REJECTION_REASONS.map((reason) => [reason.code, reason.label])) as Record<
    RejectionReasonCode,
    string
  >;

export const REJECTION_SOURCES = [
  "reject_button",
  "swipe_left",
  "keyboard_left",
  "quick_reject",
  "choose_reason",
] as const;

export type RejectionSource = (typeof REJECTION_SOURCES)[number];

export const MAX_REJECTION_COMMENT_LENGTH = 240;

export const rejectionReasonCodeSchema = z.enum(REJECTION_REASON_CODES);
export const quickRejectionDefaultCodeSchema = z.enum(
  QUICK_REJECTION_DEFAULT_CODES as [
    QuickRejectionDefaultCode,
    ...QuickRejectionDefaultCode[],
  ],
);
export const rejectionSourceSchema = z.enum(REJECTION_SOURCES);

/** Optional note: trim, reject whitespace-only, max 240, plain text only. */
export const rejectionCommentSchema = z
  .string()
  .max(MAX_REJECTION_COMMENT_LENGTH, {
    message: `Your comment is too long. Keep it under ${MAX_REJECTION_COMMENT_LENGTH} characters.`,
  })
  .transform((value) => value.trim())
  .refine((value) => value.length === 0 || value.length > 0, {
    message: "Select a rejection reason before continuing.",
  })
  .transform((value) => (value.length === 0 ? undefined : value))
  // Strip any accidental HTML-looking tags; notes are never rendered as HTML.
  .transform((value) => value?.replace(/<[^>]*>/g, "") || undefined);

export const rejectionReasonSelectionSchema = z.object({
  reasonCode: rejectionReasonCodeSchema,
  comment: z
    .string()
    .max(MAX_REJECTION_COMMENT_LENGTH, {
      message: `Your comment is too long. Keep it under ${MAX_REJECTION_COMMENT_LENGTH} characters.`,
    })
    .optional()
    .default(""),
});

export type RejectionReasonSelectionInput = z.input<typeof rejectionReasonSelectionSchema>;

export interface RejectionDetails {
  reasonCode: RejectionReasonCode;
  reasonLabel: string;
  comment?: string;
  source: RejectionSource;
  candidateDisplayName: string;
  simulationOnly: true;
}

export function normalizeRejectionComment(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  const trimmed = raw.trim().replace(/<[^>]*>/g, "");
  if (!trimmed) return undefined;
  if (trimmed.length > MAX_REJECTION_COMMENT_LENGTH) {
    throw new Error(
      `Your comment is too long. Keep it under ${MAX_REJECTION_COMMENT_LENGTH} characters.`,
    );
  }
  return trimmed;
}

export function parseRejectionSelection(input: {
  reasonCode: string;
  comment?: string;
}):
  | { ok: true; reasonCode: RejectionReasonCode; reasonLabel: string; comment?: string }
  | { ok: false; message: string } {
  const parsed = rejectionReasonCodeSchema.safeParse(input.reasonCode);
  if (!parsed.success) {
    return { ok: false, message: "Select a rejection reason before continuing." };
  }

  let comment: string | undefined;
  try {
    comment = normalizeRejectionComment(input.comment);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Invalid comment.",
    };
  }

  return {
    ok: true,
    reasonCode: parsed.data,
    reasonLabel: REJECTION_REASON_LABEL_BY_CODE[parsed.data],
    comment,
  };
}

export function buildRejectionMetadata(details: RejectionDetails): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    reasonCode: details.reasonCode,
    reasonLabel: details.reasonLabel,
    candidateDisplayName: details.candidateDisplayName,
    simulationOnly: true,
    source: details.source,
  };
  if (details.comment) {
    metadata.comment = details.comment;
  }
  return metadata;
}

/** Analytics-safe subset — never includes the free-text comment. */
export function buildRejectionAnalyticsSafeFields(details: RejectionDetails): {
  reasonCode: RejectionReasonCode;
  source: RejectionSource;
  simulationOnly: true;
} {
  return {
    reasonCode: details.reasonCode,
    source: details.source,
    simulationOnly: true,
  };
}
