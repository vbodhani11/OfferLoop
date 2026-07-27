import { jobs as seedJobs } from "@/data/jobs";
import { organizations } from "@/data/organizations";
import type { Job, JobWithOrganization } from "@/types/domain";
import { filterJobs } from "@/features/accept/services/filterJobs";
import type { JobFilters, JobsRepository } from "@/lib/repositories/types";

function withOrganization(job: Job): JobWithOrganization | null {
  const organization = organizations.find((org) => org.id === job.organizationId);
  if (!organization) return null;
  return { ...job, organization };
}

export const allJobsWithOrganizations: JobWithOrganization[] = seedJobs
  .map(withOrganization)
  .filter((job): job is JobWithOrganization => job !== null);

export class LocalJobsRepository implements JobsRepository {
  async listJobs(filters?: JobFilters): Promise<JobWithOrganization[]> {
    return filterJobs(allJobsWithOrganizations, filters);
  }

  async getJobBySlug(slug: string): Promise<JobWithOrganization | null> {
    return allJobsWithOrganizations.find((job) => job.slug === slug) ?? null;
  }

  async getSimilarJobs(job: Job, limit = 3): Promise<JobWithOrganization[]> {
    return allJobsWithOrganizations
      .filter(
        (candidate) =>
          candidate.id !== job.id &&
          (candidate.category === job.category ||
            candidate.organizationId === job.organizationId),
      )
      .slice(0, limit);
  }
}
