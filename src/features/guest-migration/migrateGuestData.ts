import type { RepositorySet } from "@/lib/repositories/types";
import {
  readGuestApplications,
  readGuestOffers,
  readGuestSavedJobs,
  writeGuestApplications,
  writeGuestOffers,
  writeGuestSavedJobs,
} from "@/lib/storage/guestStore";

export interface MigrationSummary {
  offersMigrated: number;
  savedJobsMigrated: number;
  applicationsMigrated: number;
}

/**
 * Idempotently copies guest localStorage data into Supabase repositories for a
 * newly authenticated user. Safe to re-run: only inserts records that don't
 * already exist (matched by job id), and only clears each local collection
 * after every item in it has been migrated successfully.
 */
export async function migrateGuestData(
  userId: string,
  repositories: RepositorySet,
): Promise<MigrationSummary> {
  const summary: MigrationSummary = {
    offersMigrated: 0,
    savedJobsMigrated: 0,
    applicationsMigrated: 0,
  };

  const guestApplications = readGuestApplications();
  const remainingApplications: typeof guestApplications = [];
  for (const application of guestApplications) {
    try {
      const already = await repositories.applications.hasApplied(
        userId,
        application.jobId,
      );
      if (!already) {
        await repositories.applications.createApplication(userId, application.jobId);
        summary.applicationsMigrated += 1;
      }
    } catch {
      remainingApplications.push(application);
    }
  }
  writeGuestApplications(remainingApplications);

  const guestOffers = readGuestOffers();
  const remainingOffers: typeof guestOffers = [];
  for (const offer of guestOffers) {
    try {
      const existing = await repositories.offers.getOfferByJobId(userId, offer.jobId);
      if (!existing) {
        await repositories.offers.createOffer(userId, {
          jobId: offer.jobId,
          applicationId: offer.applicationId,
          recipientDisplayName: offer.recipientDisplayName,
          fictionalStartDate: offer.fictionalStartDate,
          fictionalManagerName: offer.fictionalManagerName,
          salaryMin: offer.salaryMin,
          salaryMax: offer.salaryMax,
          signingBonus: offer.signingBonus,
          currency: offer.currency,
          workArrangement: offer.workArrangement,
          offerMessage: offer.offerMessage,
          simulationVersion: offer.simulationVersion,
        });
        summary.offersMigrated += 1;
      }
    } catch {
      remainingOffers.push(offer);
    }
  }
  writeGuestOffers(remainingOffers);

  const guestSavedJobs = readGuestSavedJobs();
  const remainingSavedJobs: typeof guestSavedJobs = [];
  for (const savedJob of guestSavedJobs) {
    try {
      const alreadySaved = await repositories.savedJobs.isSaved(userId, savedJob.jobId);
      if (!alreadySaved) {
        await repositories.savedJobs.saveJob(userId, savedJob.jobId);
        summary.savedJobsMigrated += 1;
      }
    } catch {
      remainingSavedJobs.push(savedJob);
    }
  }
  writeGuestSavedJobs(remainingSavedJobs);

  await repositories.actions.recordAction({
    userId,
    anonymousSessionId: null,
    actionType: "guest_data_migrated",
    metadata: { ...summary },
  });

  return summary;
}

export function hasGuestDataToMigrate(): boolean {
  return (
    readGuestOffers().length > 0 ||
    readGuestSavedJobs().length > 0 ||
    readGuestApplications().length > 0
  );
}
