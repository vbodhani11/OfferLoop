import type { JobWithOrganization, SavedJob } from "@/types/domain";
import type { SavedJobsRepository } from "@/lib/repositories/types";
import { readGuestSavedJobs, writeGuestSavedJobs } from "@/lib/storage/guestStore";
import { allJobsWithOrganizations } from "./jobs";

export class LocalSavedJobsRepository implements SavedJobsRepository {
  async listSavedJobs(_userId: string): Promise<JobWithOrganization[]> {
    const saved = readGuestSavedJobs();
    return saved
      .map((entry) => allJobsWithOrganizations.find((job) => job.id === entry.jobId))
      .filter((job): job is JobWithOrganization => job !== undefined);
  }

  async isSaved(_userId: string, jobId: string): Promise<boolean> {
    return readGuestSavedJobs().some((entry) => entry.jobId === jobId);
  }

  async saveJob(_userId: string, jobId: string): Promise<SavedJob> {
    const existing = readGuestSavedJobs();
    const already = existing.find((entry) => entry.jobId === jobId);
    const createdAt = already?.createdAt ?? new Date().toISOString();
    if (!already) {
      writeGuestSavedJobs([...existing, { jobId, createdAt }]);
    }
    return { id: `guest-saved-${jobId}`, userId: "guest", jobId, createdAt };
  }

  async unsaveJob(_userId: string, jobId: string): Promise<void> {
    const existing = readGuestSavedJobs();
    writeGuestSavedJobs(existing.filter((entry) => entry.jobId !== jobId));
  }

  async clearAll(_userId: string): Promise<void> {
    writeGuestSavedJobs([]);
  }
}
