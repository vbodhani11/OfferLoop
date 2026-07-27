import type { Offer, OfferWithJob } from "@/types/domain";
import type { CreateOfferInput, OffersRepository } from "@/lib/repositories/types";
import { readGuestOffers, writeGuestOffers } from "@/lib/storage/guestStore";
import { allJobsWithOrganizations } from "./jobs";
import type { GuestOffer } from "@/lib/validation/guest";

function toOffer(guestOffer: GuestOffer): Offer {
  return {
    id: guestOffer.id,
    userId: "guest",
    jobId: guestOffer.jobId,
    applicationId: guestOffer.applicationId,
    recipientDisplayName: guestOffer.recipientDisplayName,
    fictionalStartDate: guestOffer.fictionalStartDate,
    fictionalManagerName: guestOffer.fictionalManagerName,
    salaryMin: guestOffer.salaryMin,
    salaryMax: guestOffer.salaryMax,
    signingBonus: guestOffer.signingBonus,
    currency: guestOffer.currency,
    workArrangement: guestOffer.workArrangement,
    offerMessage: guestOffer.offerMessage,
    simulationVersion: guestOffer.simulationVersion,
    createdAt: guestOffer.createdAt,
  };
}

function withJob(offer: Offer): OfferWithJob | null {
  const job = allJobsWithOrganizations.find((j) => j.id === offer.jobId);
  if (!job) return null;
  return { ...offer, job };
}

export class LocalOffersRepository implements OffersRepository {
  async listOffers(_userId: string): Promise<OfferWithJob[]> {
    return readGuestOffers()
      .map(toOffer)
      .map(withJob)
      .filter((offer): offer is OfferWithJob => offer !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOfferById(_userId: string, offerId: string): Promise<OfferWithJob | null> {
    const found = readGuestOffers().find((offer) => offer.id === offerId);
    return found ? withJob(toOffer(found)) : null;
  }

  async getOfferByJobId(_userId: string, jobId: string): Promise<OfferWithJob | null> {
    const found = readGuestOffers().find((offer) => offer.jobId === jobId);
    return found ? withJob(toOffer(found)) : null;
  }

  async createOffer(_userId: string, input: CreateOfferInput): Promise<Offer> {
    const existing = readGuestOffers();
    const already = existing.find((offer) => offer.jobId === input.jobId);
    if (already) return toOffer(already);

    const guestOffer: GuestOffer = {
      id: `offer-${input.jobId}-${Date.now()}`,
      jobId: input.jobId,
      applicationId: input.applicationId,
      recipientDisplayName: input.recipientDisplayName,
      fictionalStartDate: input.fictionalStartDate,
      fictionalManagerName: input.fictionalManagerName,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      signingBonus: input.signingBonus,
      currency: input.currency,
      workArrangement: input.workArrangement,
      offerMessage: input.offerMessage,
      simulationVersion: input.simulationVersion,
      createdAt: new Date().toISOString(),
    };

    const saved = writeGuestOffers([...existing, guestOffer]);
    if (!saved) {
      throw new Error("OFFER_SAVE_FAILED");
    }
    return toOffer(guestOffer);
  }

  async deleteOffer(_userId: string, offerId: string): Promise<void> {
    const existing = readGuestOffers();
    writeGuestOffers(existing.filter((offer) => offer.id !== offerId));
  }
}
