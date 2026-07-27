import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { FictionalCandidate } from "@/types/domain";
import type { CandidatesRepository } from "@/lib/repositories/types";
import { mapCandidate } from "./mappers";

export class SupabaseCandidatesRepository implements CandidatesRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listCandidates(): Promise<FictionalCandidate[]> {
    const { data, error } = await this.client
      .from("fictional_candidates")
      .select("*")
      .eq("is_active", true);
    if (error || !data) return [];
    return data.map(mapCandidate);
  }

  async getCandidateBySlug(slug: string): Promise<FictionalCandidate | null> {
    const { data, error } = await this.client
      .from("fictional_candidates")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return mapCandidate(data);
  }
}
