import { describe, expect, it } from "vitest";
import {
  MAX_REJECTION_COMMENT_LENGTH,
  QUICK_REJECTION_DEFAULT_CODES,
  REJECTION_REASON_CODES,
  REJECTION_REASONS,
  buildRejectionAnalyticsSafeFields,
  buildRejectionMetadata,
  normalizeRejectionComment,
  parseRejectionSelection,
  quickRejectionDefaultCodeSchema,
  rejectionReasonCodeSchema,
} from "../rejectionReasons";

describe("rejection reason codes", () => {
  it("includes only the approved job-related codes", () => {
    expect(REJECTION_REASON_CODES).toEqual([
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
    ]);
  });

  it("rejects invalid reason codes", () => {
    expect(rejectionReasonCodeSchema.safeParse("age").success).toBe(false);
    expect(rejectionReasonCodeSchema.safeParse("appearance").success).toBe(false);
    expect(rejectionReasonCodeSchema.safeParse("").success).toBe(false);
  });

  it("accepts every predefined reason code", () => {
    for (const code of REJECTION_REASON_CODES) {
      expect(rejectionReasonCodeSchema.safeParse(code).success).toBe(true);
    }
  });

  it("does not allow Other as a quick-rejection default", () => {
    expect(QUICK_REJECTION_DEFAULT_CODES).not.toContain("other");
    expect(quickRejectionDefaultCodeSchema.safeParse("other").success).toBe(false);
    expect(quickRejectionDefaultCodeSchema.safeParse("skills_mismatch").success).toBe(
      true,
    );
  });

  it("never exposes protected-characteristic reason labels", () => {
    const joined = REJECTION_REASONS.map((reason) => reason.label.toLowerCase()).join(
      " ",
    );
    for (const disallowed of [
      "age",
      "gender",
      "race",
      "ethnicity",
      "religion",
      "disability",
      "appearance",
      "pregnant",
      "nationality",
    ]) {
      expect(joined).not.toContain(disallowed);
    }
  });
});

describe("parseRejectionSelection / comments", () => {
  it("requires a valid reason code", () => {
    const result = parseRejectionSelection({ reasonCode: "not-a-reason" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/Select a rejection reason/i);
    }
  });

  it("trims optional comments and drops whitespace-only notes", () => {
    const withNote = parseRejectionSelection({
      reasonCode: "skills_mismatch",
      comment: "  Looking for deeper backend experience.  ",
    });
    expect(withNote.ok).toBe(true);
    if (withNote.ok) {
      expect(withNote.comment).toBe("Looking for deeper backend experience.");
      expect(withNote.reasonLabel).toBe("Skills do not match");
    }

    const blank = parseRejectionSelection({
      reasonCode: "skills_mismatch",
      comment: "   \n\t  ",
    });
    expect(blank.ok).toBe(true);
    if (blank.ok) expect(blank.comment).toBeUndefined();
  });

  it("rejects comments longer than the maximum", () => {
    const result = parseRejectionSelection({
      reasonCode: "other",
      comment: "x".repeat(MAX_REJECTION_COMMENT_LENGTH + 1),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/240 characters/i);
    }
  });

  it("strips HTML-looking tags from comments", () => {
    expect(normalizeRejectionComment("<b>Hello</b> world")).toBe("Hello world");
  });
});

describe("buildRejectionMetadata", () => {
  it("stores stable codes plus labels and omits empty comments", () => {
    expect(
      buildRejectionMetadata({
        reasonCode: "skills_mismatch",
        reasonLabel: "Skills do not match",
        source: "reject_button",
        candidateDisplayName: "Amara Osei",
        simulationOnly: true,
      }),
    ).toEqual({
      reasonCode: "skills_mismatch",
      reasonLabel: "Skills do not match",
      candidateDisplayName: "Amara Osei",
      simulationOnly: true,
      source: "reject_button",
    });
  });

  it("includes a comment when provided", () => {
    const metadata = buildRejectionMetadata({
      reasonCode: "role_not_right_fit",
      reasonLabel: "Role is not the right fit",
      comment: "Looking for deeper backend experience.",
      source: "swipe_left",
      candidateDisplayName: "Amara Osei",
      simulationOnly: true,
    });
    expect(metadata.comment).toBe("Looking for deeper backend experience.");
  });

  it("never puts the free-text comment into analytics-safe fields", () => {
    expect(
      buildRejectionAnalyticsSafeFields({
        reasonCode: "skills_mismatch",
        reasonLabel: "Skills do not match",
        comment: "secret note",
        source: "keyboard_left",
        candidateDisplayName: "Amara Osei",
        simulationOnly: true,
      }),
    ).toEqual({
      reasonCode: "skills_mismatch",
      source: "keyboard_left",
      simulationOnly: true,
    });
  });
});
