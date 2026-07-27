import type { Application } from "@/types/domain";
import type { ApplicationsRepository } from "@/lib/repositories/types";
import { readGuestApplications, writeGuestApplications } from "@/lib/storage/guestStore";

function toApplication(
  jobId: string,
  status: "accepted" | "saved",
  createdAt: string,
): Application {
  return {
    id: `guest-application-${jobId}`,
    userId: "guest",
    jobId,
    status,
    acceptedAt: status === "accepted" ? createdAt : null,
    createdAt,
    updatedAt: createdAt,
  };
}

export class LocalApplicationsRepository implements ApplicationsRepository {
  async hasApplied(_userId: string, jobId: string): Promise<boolean> {
    return readGuestApplications().some((app) => app.jobId === jobId);
  }

  async createApplication(_userId: string, jobId: string): Promise<Application> {
    const existing = readGuestApplications();
    const already = existing.find((app) => app.jobId === jobId);
    if (already) return toApplication(already.jobId, already.status, already.createdAt);

    const createdAt = new Date().toISOString();
    const next = [...existing, { jobId, status: "accepted" as const, createdAt }];
    writeGuestApplications(next);
    return toApplication(jobId, "accepted", createdAt);
  }

  async listApplications(_userId: string): Promise<Application[]> {
    return readGuestApplications().map((app) =>
      toApplication(app.jobId, app.status, app.createdAt),
    );
  }
}
