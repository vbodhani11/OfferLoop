import { beforeEach, describe, expect, it, vi } from "vitest";
import { hasGuestDataToMigrate, migrateGuestData } from "../migrateGuestData";
import {
  writeGuestApplications,
  writeGuestOffers,
  writeGuestSavedJobs,
} from "@/lib/storage/guestStore";
import type { RepositorySet } from "@/lib/repositories/types";

function makeRepositories(overrides: Partial<RepositorySet> = {}): RepositorySet {
  const applications = new Map<string, boolean>();
  const offers = new Map<string, unknown>();
  const savedJobs = new Set<string>();

  return {
    jobs: { listJobs: vi.fn(), getJobBySlug: vi.fn(), getSimilarJobs: vi.fn() },
    candidates: { listCandidates: vi.fn(), getCandidateBySlug: vi.fn() },
    applications: {
      hasApplied: vi.fn(async (_userId, jobId: string) => applications.has(jobId)),
      createApplication: vi.fn(async (_userId, jobId: string) => {
        applications.set(jobId, true);
        return {
          id: `app-${jobId}`,
          userId: "u1",
          jobId,
          status: "accepted",
          acceptedAt: null,
          createdAt: "now",
          updatedAt: "now",
        };
      }),
      listApplications: vi.fn(async () => []),
    },
    offers: {
      listOffers: vi.fn(async () => []),
      getOfferById: vi.fn(async () => null),
      getOfferByJobId: vi.fn(async (_userId, jobId: string) =>
        offers.has(jobId) ? { jobId } : null,
      ),
      createOffer: vi.fn(async (_userId, input) => {
        offers.set(input.jobId, input);
        return { id: `offer-${input.jobId}`, userId: "u1", ...input, createdAt: "now" };
      }),
      deleteOffer: vi.fn(async () => {}),
    },
    savedJobs: {
      listSavedJobs: vi.fn(async () => []),
      isSaved: vi.fn(async (_userId, jobId: string) => savedJobs.has(jobId)),
      saveJob: vi.fn(async (_userId, jobId: string) => {
        savedJobs.add(jobId);
        return { id: `saved-${jobId}`, userId: "u1", jobId, createdAt: "now" };
      }),
      unsaveJob: vi.fn(async () => {}),
      clearAll: vi.fn(async () => {}),
    },
    profile: { getProfile: vi.fn(async () => null), updateProfile: vi.fn() },
    actions: { recordAction: vi.fn(async () => {}) },
    ...overrides,
  } as RepositorySet;
}

beforeEach(() => {
  writeGuestApplications([]);
  writeGuestOffers([]);
  writeGuestSavedJobs([]);
});

describe("hasGuestDataToMigrate", () => {
  it("returns false when there is no local guest data", () => {
    expect(hasGuestDataToMigrate()).toBe(false);
  });

  it("returns true when at least one guest collection has data", () => {
    writeGuestSavedJobs([{ jobId: "job-1", createdAt: "now" }]);
    expect(hasGuestDataToMigrate()).toBe(true);
  });
});

describe("migrateGuestData", () => {
  it("migrates guest offers, saved jobs, and applications, then clears local storage", async () => {
    writeGuestApplications([{ jobId: "job-1", status: "accepted", createdAt: "now" }]);
    writeGuestOffers([
      {
        id: "offer-1",
        jobId: "job-1",
        applicationId: null,
        recipientDisplayName: "Future You",
        fictionalStartDate: "2026-02-01",
        fictionalManagerName: "Jordan Ellis",
        salaryMin: 100000,
        salaryMax: 130000,
        currency: "USD",
        workArrangement: "remote",
        offerMessage: "Congrats",
        simulationVersion: "v1",
        createdAt: "now",
      },
    ]);
    writeGuestSavedJobs([{ jobId: "job-2", createdAt: "now" }]);

    const repositories = makeRepositories();
    const summary = await migrateGuestData("user-1", repositories);

    expect(summary).toEqual({
      offersMigrated: 1,
      savedJobsMigrated: 1,
      applicationsMigrated: 1,
    });
    expect(repositories.actions.recordAction).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", actionType: "guest_data_migrated" }),
    );
    expect(hasGuestDataToMigrate()).toBe(false);
  });

  it("is idempotent: running twice does not create duplicate records", async () => {
    writeGuestOffers([
      {
        id: "offer-1",
        jobId: "job-1",
        applicationId: null,
        recipientDisplayName: "Future You",
        fictionalStartDate: "2026-02-01",
        fictionalManagerName: "Jordan Ellis",
        salaryMin: 100000,
        salaryMax: 130000,
        currency: "USD",
        workArrangement: "remote",
        offerMessage: "Congrats",
        simulationVersion: "v1",
        createdAt: "now",
      },
    ]);

    const repositories = makeRepositories();
    const first = await migrateGuestData("user-1", repositories);
    expect(first.offersMigrated).toBe(1);
    expect(repositories.offers.createOffer).toHaveBeenCalledTimes(1);

    // Re-seed local storage to simulate the guest applying again before the
    // second migration attempt; the repository already has the record.
    writeGuestOffers([
      {
        id: "offer-1",
        jobId: "job-1",
        applicationId: null,
        recipientDisplayName: "Future You",
        fictionalStartDate: "2026-02-01",
        fictionalManagerName: "Jordan Ellis",
        salaryMin: 100000,
        salaryMax: 130000,
        currency: "USD",
        workArrangement: "remote",
        offerMessage: "Congrats",
        simulationVersion: "v1",
        createdAt: "now",
      },
    ]);
    const second = await migrateGuestData("user-1", repositories);
    expect(second.offersMigrated).toBe(0);
    expect(repositories.offers.createOffer).toHaveBeenCalledTimes(1);
  });

  it("keeps failed items in local storage for retry instead of dropping them", async () => {
    const repositories = makeRepositories({
      offers: {
        listOffers: vi.fn(async () => []),
        getOfferById: vi.fn(async () => null),
        getOfferByJobId: vi.fn(async () => null),
        createOffer: vi.fn(async () => {
          throw new Error("network error");
        }),
        deleteOffer: vi.fn(async () => {}),
      },
    });
    writeGuestOffers([
      {
        id: "offer-1",
        jobId: "job-1",
        applicationId: null,
        recipientDisplayName: "Future You",
        fictionalStartDate: "2026-02-01",
        fictionalManagerName: "Jordan Ellis",
        salaryMin: 100000,
        salaryMax: 130000,
        currency: "USD",
        workArrangement: "remote",
        offerMessage: "Congrats",
        simulationVersion: "v1",
        createdAt: "now",
      },
    ]);

    const summary = await migrateGuestData("user-1", repositories);
    expect(summary.offersMigrated).toBe(0);
    expect(hasGuestDataToMigrate()).toBe(true);
  });
});
