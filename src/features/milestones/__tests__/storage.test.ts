import { describe, expect, it, beforeEach } from "vitest";
import {
  readLifetimeProgress,
  writeLifetimeProgress,
  readMilestoneSettings,
  writeMilestoneSettings,
  clearMilestoneProgress,
} from "../storage";
import { migrateGuestMilestones } from "../migrateGuestMilestones";
import { emptyCategoryCounts } from "../types";

describe("milestone storage", () => {
  beforeEach(() => {
    clearMilestoneProgress(null);
    clearMilestoneProgress("user-a");
    localStorage.clear();
    sessionStorage.clear();
  });

  it("round-trips lifetime progress", () => {
    writeLifetimeProgress({
      version: 1,
      counts: { ...emptyCategoryCounts(), applications: 7 },
      unlockedAchievements: [
        {
          achievementCode: "first_application",
          unlockedAt: "2026-01-01T00:00:00.000Z",
          progressAtUnlock: 1,
          category: "applications",
          version: 1,
        },
      ],
      displayedMilestones: [
        {
          milestoneKey: "applications:5",
          displayedAt: "2026-01-01T00:00:00.000Z",
          version: 1,
        },
      ],
      recentPlayfulLines: ["Zero cover letters were harmed."],
    });
    const read = readLifetimeProgress(null);
    expect(read.counts.applications).toBe(7);
    expect(read.unlockedAchievements).toHaveLength(1);
    expect(read.displayedMilestones[0]?.milestoneKey).toBe("applications:5");
  });

  it("defaults sound off in settings", () => {
    expect(readMilestoneSettings().celebrationSoundEnabled).toBe(false);
    writeMilestoneSettings({
      version: 1,
      celebrationsEnabled: false,
      celebrationIntensity: "minimal",
      celebrationSoundEnabled: false,
      achievementNotificationsEnabled: false,
    });
    expect(readMilestoneSettings().celebrationsEnabled).toBe(false);
  });
});

describe("migrateGuestMilestones", () => {
  beforeEach(() => {
    clearMilestoneProgress(null);
    clearMilestoneProgress("user-1");
    localStorage.clear();
  });

  it("merges without duplicating achievements and marks displayed", () => {
    writeLifetimeProgress(
      {
        version: 1,
        counts: { ...emptyCategoryCounts(), applications: 5 },
        unlockedAchievements: [
          {
            achievementCode: "application_sprint",
            unlockedAt: "2026-01-01T00:00:00.000Z",
            progressAtUnlock: 5,
            category: "applications",
            version: 1,
          },
        ],
        displayedMilestones: [
          {
            milestoneKey: "applications:5",
            displayedAt: "2026-01-01T00:00:00.000Z",
            version: 1,
          },
        ],
        recentPlayfulLines: [],
      },
      null,
    );

    const result = migrateGuestMilestones("user-1");
    expect(result.countsSynced).toBe(true);
    const account = readLifetimeProgress("user-1");
    expect(account.counts.applications).toBe(5);
    expect(account.unlockedAchievements).toHaveLength(1);
    expect(
      account.displayedMilestones.some(
        (d) => d.milestoneKey === "achievement:application_sprint",
      ),
    ).toBe(true);
  });
});
