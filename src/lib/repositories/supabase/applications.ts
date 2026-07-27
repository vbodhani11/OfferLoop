import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Application } from "@/types/domain";
import type { ApplicationsRepository } from "@/lib/repositories/types";
import { mapApplication } from "./mappers";

export class SupabaseApplicationsRepository implements ApplicationsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async hasApplied(userId: string, jobId: string): Promise<boolean> {
    const { data } = await this.client
      .from("applications")
      .select("id")
      .eq("user_id", userId)
      .eq("job_id", jobId)
      .maybeSingle();
    return Boolean(data);
  }

  async createApplication(userId: string, jobId: string): Promise<Application> {
    const { data: existing } = await this.client
      .from("applications")
      .select("*")
      .eq("user_id", userId)
      .eq("job_id", jobId)
      .maybeSingle();
    if (existing) return mapApplication(existing);

    const now = new Date().toISOString();
    const { data, error } = await this.client
      .from("applications")
      .insert({ user_id: userId, job_id: jobId, status: "accepted", accepted_at: now })
      .select("*")
      .single();
    if (error || !data) throw new Error("APPLICATION_CREATE_FAILED");
    return mapApplication(data);
  }

  async listApplications(userId: string): Promise<Application[]> {
    const { data, error } = await this.client
      .from("applications")
      .select("*")
      .eq("user_id", userId);
    if (error || !data) return [];
    return data.map(mapApplication);
  }
}
