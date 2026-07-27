import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { JobWithOrganization, SavedJob } from "@/types/domain";
import type { SavedJobsRepository } from "@/lib/repositories/types";
import { mapJob, mapOrganization, mapSavedJob } from "./mappers";

export class SupabaseSavedJobsRepository implements SavedJobsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listSavedJobs(userId: string): Promise<JobWithOrganization[]> {
    const { data, error } = await this.client
      .from("saved_jobs")
      .select("job_id, jobs(*, organizations(*))")
      .eq("user_id", userId);
    if (error || !data) return [];
    return data
      .map((row) => {
        const jobRow = (row as unknown as { jobs: unknown }).jobs;
        if (!jobRow) return null;
        const job = jobRow as Parameters<typeof mapJob>[0] & { organizations: unknown };
        if (!job.organizations) return null;
        return {
          ...mapJob(job),
          organization: mapOrganization(
            job.organizations as Parameters<typeof mapOrganization>[0],
          ),
        };
      })
      .filter((job): job is JobWithOrganization => job !== null);
  }

  async isSaved(userId: string, jobId: string): Promise<boolean> {
    const { data } = await this.client
      .from("saved_jobs")
      .select("id")
      .eq("user_id", userId)
      .eq("job_id", jobId)
      .maybeSingle();
    return Boolean(data);
  }

  async saveJob(userId: string, jobId: string): Promise<SavedJob> {
    const { data: existing } = await this.client
      .from("saved_jobs")
      .select("*")
      .eq("user_id", userId)
      .eq("job_id", jobId)
      .maybeSingle();
    if (existing) return mapSavedJob(existing);

    const { data, error } = await this.client
      .from("saved_jobs")
      .insert({ user_id: userId, job_id: jobId })
      .select("*")
      .single();
    if (error || !data) throw new Error("SAVE_JOB_FAILED");
    return mapSavedJob(data);
  }

  async unsaveJob(userId: string, jobId: string): Promise<void> {
    await this.client
      .from("saved_jobs")
      .delete()
      .eq("user_id", userId)
      .eq("job_id", jobId);
  }

  async clearAll(userId: string): Promise<void> {
    await this.client.from("saved_jobs").delete().eq("user_id", userId);
  }
}
