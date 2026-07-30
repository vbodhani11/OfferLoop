import { describe, expect, it } from "vitest";
import {
  crossedThresholds,
  evaluateMilestones,
  incrementCounts,
  isSupportedMilestoneAction,
  mapActionKindToCategory,
  mergeGuestAchievements,
  partitionCelebrations,
  simulationTypeToMilestoneKind,
  emptyCategoryCounts,
  totalFromCounts,
} from "../calculate";
import { ACHIEVEMENT_CATALOG } from "../catalog";
import { getToastCopy, LINES_BY_CATEGORY } from "../milestoneCopy";
import { lifetimeProgressSchema, milestoneSettingsSchema } from "../types";

describe("milestone action mapping", () => {
  it("maps supported simulation types", () => {
    expect(simulationTypeToMilestoneKind("job_applied")).toBe(
      "fictional_application_submitted",
    );
    expect(simulationTypeToMilestoneKind("candidate_rejected")).toBe(
      "fictional_candidate_rejected",
    );
    expect(simulationTypeToMilestoneKind("candidate_shortlisted")).toBe(
      "fictional_candidate_shortlisted",
    );
    expect(simulationTypeToMilestoneKind("candidate_offered")).toBe(
      "fictional_offer_sent",
    );
    expect(simulationTypeToMilestoneKind("offer_created")).toBe(
      "fictional_offer_received",
    );
    expect(simulationTypeToMilestoneKind("job_saved")).toBe("fictional_job_saved");
  });

  it("rejects unsupported actions", () => {
    expect(simulationTypeToMilestoneKind("job_viewed")).toBeNull();
    expect(simulationTypeToMilestoneKind("job_skipped")).toBeNull();
    expect(simulationTypeToMilestoneKind("action_undone")).toBeNull();
    expect(simulationTypeToMilestoneKind("deck_reset")).toBeNull();
    expect(isSupportedMilestoneAction("fictional_application_submitted")).toBe(true);
    expect(isSupportedMilestoneAction("job_viewed")).toBe(false);
  });

  it("maps kinds to categories", () => {
    expect(mapActionKindToCategory("fictional_application_submitted")).toBe(
      "applications",
    );
    expect(mapActionKindToCategory("fictional_candidate_rejected")).toBe("rejections");
  });
});

describe("counts and thresholds", () => {
  it("increments and totals", () => {
    const next = incrementCounts(emptyCategoryCounts(), "applications", 1);
    expect(next.applications).toBe(1);
    expect(totalFromCounts(next)).toBe(1);
  });

  it("does not go below zero on undo decrement", () => {
    const next = incrementCounts(emptyCategoryCounts(), "rejections", -1);
    expect(next.rejections).toBe(0);
  });

  it("detects crossed thresholds", () => {
    expect(crossedThresholds(4, 5, [5, 10, 25])).toEqual([5]);
    expect(crossedThresholds(9, 10, [5, 10, 25])).toEqual([10]);
    expect(crossedThresholds(5, 5, [5, 10])).toEqual([]);
  });
});

describe("evaluateMilestones", () => {
  it("unlocks first application achievement and prioritizes achievements", () => {
    const previous = emptyCategoryCounts();
    const next = incrementCounts(previous, "applications", 1);
    const result = evaluateMilestones({
      previousCounts: previous,
      nextCounts: next,
      unlockedCodes: new Set(),
      displayedKeys: new Set(),
      recentPlayfulLines: [],
      triggeredCategory: "applications",
    });
    expect(result.newlyUnlocked.map((a) => a.achievementCode)).toContain(
      "first_application",
    );
    expect(result.celebrations[0]?.achievementCode).toBe("first_application");
  });

  it("suppresses already-displayed milestones", () => {
    const previous = { ...emptyCategoryCounts(), applications: 4 };
    const next = { ...previous, applications: 5 };
    const result = evaluateMilestones({
      previousCounts: previous,
      nextCounts: next,
      unlockedCodes: new Set(["first_application", "application_sprint"]),
      displayedKeys: new Set(["applications:5", "achievement:application_sprint"]),
      recentPlayfulLines: [],
      triggeredCategory: "applications",
    });
    expect(result.celebrations).toHaveLength(0);
  });

  it("creates a dialog celebration at 10 applications", () => {
    const previous = { ...emptyCategoryCounts(), applications: 9 };
    const next = { ...previous, applications: 10 };
    const result = evaluateMilestones({
      previousCounts: previous,
      nextCounts: next,
      unlockedCodes: new Set(["first_application", "application_sprint"]),
      displayedKeys: new Set(),
      recentPlayfulLines: [],
      triggeredCategory: "applications",
    });
    expect(
      result.newlyUnlocked.some((a) => a.achievementCode === "application_machine"),
    ).toBe(true);
    const { primary } = partitionCelebrations(result.celebrations);
    expect(primary?.kind).toBe("achievement");
    expect(primary?.threshold).toBe(10);
  });

  it("detects combined total milestones", () => {
    const previous = {
      ...emptyCategoryCounts(),
      applications: 5,
      rejections: 4,
    };
    const next = { ...previous, rejections: 5 };
    const result = evaluateMilestones({
      previousCounts: previous,
      nextCounts: next,
      unlockedCodes: new Set([
        "first_application",
        "application_sprint",
        "first_rejection",
        "rejection_sprint",
      ]),
      displayedKeys: new Set([
        "applications:5",
        "rejections:5",
        "achievement:application_sprint",
        "achievement:rejection_sprint",
      ]),
      recentPlayfulLines: [],
      triggeredCategory: "rejections",
    });
    expect(result.celebrations.some((c) => c.milestoneKey === "total:10")).toBe(true);
  });

  it("partitions to one primary celebration", () => {
    const { primary, badges } = partitionCelebrations([
      {
        id: "a",
        kind: "achievement",
        category: "applications",
        threshold: 10,
        milestoneKey: "achievement:application_machine",
        title: "A",
        body: "B",
        playfulLine: "C",
      },
      {
        id: "b",
        kind: "dialog",
        category: "total",
        threshold: 10,
        milestoneKey: "total:10",
        title: "T",
        body: "B",
        playfulLine: "P",
      },
    ]);
    expect(primary?.id).toBe("a");
    expect(badges).toHaveLength(1);
  });
});

describe("achievement catalog", () => {
  it("has unique codes and stable thresholds", () => {
    const codes = ACHIEVEMENT_CATALOG.map((a) => a.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(
      ACHIEVEMENT_CATALOG.find((a) => a.code === "application_machine")?.threshold,
    ).toBe(10);
  });
});

describe("playful copy", () => {
  it("avoids immediate repetition when recent lines are provided", () => {
    const recent = [LINES_BY_CATEGORY.applications[0]!];
    const copy = getToastCopy("applications", 5, recent);
    expect(copy.playfulLine).not.toBe(recent[0]);
  });
});

describe("guest achievement merge", () => {
  it("keeps earliest unlock and dedupes", () => {
    const merged = mergeGuestAchievements(
      [
        {
          achievementCode: "first_application",
          unlockedAt: "2026-01-02T00:00:00.000Z",
          progressAtUnlock: 1,
          category: "applications",
          version: 1,
        },
      ],
      [
        {
          achievementCode: "first_application",
          unlockedAt: "2026-01-01T00:00:00.000Z",
          progressAtUnlock: 1,
          category: "applications",
          version: 1,
        },
        {
          achievementCode: "first_rejection",
          unlockedAt: "2026-01-03T00:00:00.000Z",
          progressAtUnlock: 1,
          category: "rejections",
          version: 1,
        },
      ],
    );
    expect(merged).toHaveLength(2);
    expect(
      merged.find((a) => a.achievementCode === "first_application")?.unlockedAt,
    ).toBe("2026-01-01T00:00:00.000Z");
  });
});

describe("schemas", () => {
  it("validates lifetime progress and settings defaults", () => {
    expect(lifetimeProgressSchema.parse({}).counts.applications).toBe(0);
    expect(milestoneSettingsSchema.parse({}).celebrationsEnabled).toBe(true);
    expect(milestoneSettingsSchema.parse({}).celebrationSoundEnabled).toBe(false);
  });

  it("rejects corrupted lifetime payloads", () => {
    expect(
      lifetimeProgressSchema.safeParse({ version: 1, counts: { applications: -1 } })
        .success,
    ).toBe(false);
  });
});
