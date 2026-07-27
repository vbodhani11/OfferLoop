import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Job, JobWithOrganization } from "@/types/domain";
import type { JobFilters, JobsRepository } from "@/lib/repositories/types";
import { filterJobs } from "@/features/accept/services/filterJobs";
import { mapJob, mapOrganization } from "./mappers";

export class SupabaseJobsRepository implements JobsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  private async fetchAll(): Promise<JobWithOrganization[]> {
    const { data, error } = await this.client
      .from("jobs")
      .select("*, organizations(*)")
      .eq("is_active", true);
    if (error || !data) return [];

    return data
      .map((row) => {
        const orgRow = (row as unknown as { organizations: unknown }).organizations;
        if (!orgRow) return null;
        return {
          ...mapJob(row),
          organization: mapOrganization(orgRow as Parameters<typeof mapOrganization>[0]),
        };
      })
      .filter((job): job is JobWithOrganization => job !== null);
  }

  async listJobs(filters?: JobFilters): Promise<JobWithOrganization[]> {
    const all = await this.fetchAll();
    return filterJobs(all, filters);
  }

  async getJobBySlug(slug: string): Promise<JobWithOrganization | null> {
    const all = await this.fetchAll();
    return all.find((job) => job.slug === slug) ?? null;
  }

  async getSimilarJobs(job: Job, limit = 3): Promise<JobWithOrganization[]> {
    const all = await this.fetchAll();
    return all
      .filter(
        (j) =>
          j.id !== job.id &&
          (j.category === job.category || j.organizationId === job.organizationId),
      )
      .slice(0, limit);
  }
}
