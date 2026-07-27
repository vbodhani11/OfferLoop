import type { ActionsRepository } from "@/lib/repositories/types";
import { appendGuestAction } from "@/lib/storage/guestStore";

export class LocalActionsRepository implements ActionsRepository {
  async recordAction(input: {
    userId: string | null;
    anonymousSessionId: string | null;
    actionType: Parameters<ActionsRepository["recordAction"]>[0]["actionType"];
    jobId?: string | null;
    candidateId?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    appendGuestAction({
      actionType: input.actionType,
      jobId: input.jobId ?? null,
      candidateId: input.candidateId ?? null,
      metadata: input.metadata ?? {},
      createdAt: new Date().toISOString(),
    });
  }
}
