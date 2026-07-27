import { describe, expect, it } from "vitest";
import { LocalApplicationsRepository } from "../applications";
import { LocalOffersRepository } from "../offers";
import { LocalSavedJobsRepository } from "../savedJobs";
import { allJobsWithOrganizations } from "../jobs";
import type { CreateOfferInput } from "@/lib/repositories/types";

const job = allJobsWithOrganizations[0];

function offerInput(overrides: Partial<CreateOfferInput> = {}): CreateOfferInput {
  return {
    jobId: job.id,
    applicationId: null,
    recipientDisplayName: "Future You",
    fictionalStartDate: "2026-02-01",
    fictionalManagerName: "Jordan Ellis",
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    currency: job.currency,
    workArrangement: job.workArrangement,
    offerMessage: "Congratulations!",
    simulationVersion: "v1",
    ...overrides,
  };
}

describe("LocalApplicationsRepository", () => {
  it("persists a created application to guest storage and reports it as applied", async () => {
    const repo = new LocalApplicationsRepository();
    expect(await repo.hasApplied("guest", job.id)).toBe(false);

    const application = await repo.createApplication("guest", job.id);
    expect(application.jobId).toBe(job.id);
    expect(application.status).toBe("accepted");
    expect(await repo.hasApplied("guest", job.id)).toBe(true);
  });

  it("prevents duplicate applications for the same job and returns the existing record", async () => {
    const repo = new LocalApplicationsRepository();
    const first = await repo.createApplication("guest", job.id);
    const second = await repo.createApplication("guest", job.id);
    expect(second.id).toBe(first.id);
    expect(second.createdAt).toBe(first.createdAt);

    const all = await repo.listApplications("guest");
    expect(all.filter((app) => app.jobId === job.id)).toHaveLength(1);
  });
});

describe("LocalOffersRepository", () => {
  it("creates and lists a fictional offer", async () => {
    const repo = new LocalOffersRepository();
    const offer = await repo.createOffer("guest", offerInput());
    expect(offer.jobId).toBe(job.id);

    const offers = await repo.listOffers("guest");
    expect(offers.some((o) => o.id === offer.id)).toBe(true);
  });

  it("prevents a duplicate offer for the same job", async () => {
    const repo = new LocalOffersRepository();
    const first = await repo.createOffer("guest", offerInput());
    const second = await repo.createOffer(
      "guest",
      offerInput({ recipientDisplayName: "Someone Else" }),
    );
    expect(second.id).toBe(first.id);

    const offers = await repo.listOffers("guest");
    expect(offers.filter((o) => o.jobId === job.id)).toHaveLength(1);
  });

  it("looks up an offer by job id", async () => {
    const repo = new LocalOffersRepository();
    await repo.createOffer("guest", offerInput());
    const found = await repo.getOfferByJobId("guest", job.id);
    expect(found?.jobId).toBe(job.id);
  });

  it("deletes an offer", async () => {
    const repo = new LocalOffersRepository();
    const offer = await repo.createOffer("guest", offerInput());
    await repo.deleteOffer("guest", offer.id);
    expect(await repo.getOfferById("guest", offer.id)).toBeNull();
  });
});

describe("LocalSavedJobsRepository", () => {
  it("saves a job and reports it as saved", async () => {
    const repo = new LocalSavedJobsRepository();
    expect(await repo.isSaved("guest", job.id)).toBe(false);
    await repo.saveJob("guest", job.id);
    expect(await repo.isSaved("guest", job.id)).toBe(true);
  });

  it("does not create duplicate saved-job entries", async () => {
    const repo = new LocalSavedJobsRepository();
    await repo.saveJob("guest", job.id);
    await repo.saveJob("guest", job.id);
    const saved = await repo.listSavedJobs("guest");
    expect(saved.filter((j) => j.id === job.id)).toHaveLength(1);
  });

  it("unsaves a job", async () => {
    const repo = new LocalSavedJobsRepository();
    await repo.saveJob("guest", job.id);
    await repo.unsaveJob("guest", job.id);
    expect(await repo.isSaved("guest", job.id)).toBe(false);
  });

  it("clears all saved jobs", async () => {
    const repo = new LocalSavedJobsRepository();
    await repo.saveJob("guest", job.id);
    await repo.clearAll("guest");
    expect(await repo.listSavedJobs("guest")).toHaveLength(0);
  });
});
