import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Offer, OfferWithJob } from "@/types/domain";
import type { CreateOfferInput, OffersRepository } from "@/lib/repositories/types";
import { mapJob, mapOffer, mapOrganization } from "./mappers";

export class SupabaseOffersRepository implements OffersRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  private async withJob(offer: Offer): Promise<OfferWithJob | null> {
    const { data, error } = await this.client
      .from("jobs")
      .select("*, organizations(*)")
      .eq("id", offer.jobId)
      .maybeSingle();
    if (error || !data) return null;
    const orgRow = (data as unknown as { organizations: unknown }).organizations;
    if (!orgRow) return null;
    return {
      ...offer,
      job: {
        ...mapJob(data),
        organization: mapOrganization(orgRow as Parameters<typeof mapOrganization>[0]),
      },
    };
  }

  async listOffers(userId: string): Promise<OfferWithJob[]> {
    const { data, error } = await this.client
      .from("offers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    const withJobs = await Promise.all(data.map((row) => this.withJob(mapOffer(row))));
    return withJobs.filter((offer): offer is OfferWithJob => offer !== null);
  }

  async getOfferById(userId: string, offerId: string): Promise<OfferWithJob | null> {
    const { data, error } = await this.client
      .from("offers")
      .select("*")
      .eq("user_id", userId)
      .eq("id", offerId)
      .maybeSingle();
    if (error || !data) return null;
    return this.withJob(mapOffer(data));
  }

  async getOfferByJobId(userId: string, jobId: string): Promise<OfferWithJob | null> {
    const { data, error } = await this.client
      .from("offers")
      .select("*")
      .eq("user_id", userId)
      .eq("job_id", jobId)
      .maybeSingle();
    if (error || !data) return null;
    return this.withJob(mapOffer(data));
  }

  async createOffer(userId: string, input: CreateOfferInput): Promise<Offer> {
    const { data: existing } = await this.client
      .from("offers")
      .select("*")
      .eq("user_id", userId)
      .eq("job_id", input.jobId)
      .maybeSingle();
    if (existing) return mapOffer(existing);

    const { data, error } = await this.client
      .from("offers")
      .insert({
        user_id: userId,
        job_id: input.jobId,
        application_id: input.applicationId,
        recipient_display_name: input.recipientDisplayName,
        fictional_start_date: input.fictionalStartDate,
        fictional_manager_name: input.fictionalManagerName,
        salary_min: input.salaryMin,
        salary_max: input.salaryMax,
        signing_bonus: input.signingBonus,
        currency: input.currency,
        work_arrangement: input.workArrangement,
        offer_message: input.offerMessage,
        simulation_version: input.simulationVersion,
      })
      .select("*")
      .single();
    if (error || !data) throw new Error("OFFER_SAVE_FAILED");
    return mapOffer(data);
  }

  async deleteOffer(userId: string, offerId: string): Promise<void> {
    await this.client.from("offers").delete().eq("user_id", userId).eq("id", offerId);
  }
}
