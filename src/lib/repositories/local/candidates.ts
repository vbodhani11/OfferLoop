import { candidates as seedCandidates } from "@/data/candidates";
import type { FictionalCandidate } from "@/types/domain";
import type { CandidatesRepository } from "@/lib/repositories/types";

export class LocalCandidatesRepository implements CandidatesRepository {
  async listCandidates(): Promise<FictionalCandidate[]> {
    return seedCandidates.filter((candidate) => candidate.isActive);
  }

  async getCandidateBySlug(slug: string): Promise<FictionalCandidate | null> {
    return seedCandidates.find((candidate) => candidate.slug === slug) ?? null;
  }
}
