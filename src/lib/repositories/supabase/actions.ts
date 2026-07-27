import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ActionsRepository } from "@/lib/repositories/types";

export class SupabaseActionsRepository implements ActionsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async recordAction(input: {
    userId: string | null;
    anonymousSessionId: string | null;
    actionType: Parameters<ActionsRepository["recordAction"]>[0]["actionType"];
    jobId?: string | null;
    candidateId?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.client.from("simulation_actions").insert({
      user_id: input.userId,
      anonymous_session_id: input.anonymousSessionId,
      action_type: input.actionType,
      job_id: input.jobId ?? null,
      candidate_id: input.candidateId ?? null,
      metadata: input.metadata ?? {},
    });
  }
}
