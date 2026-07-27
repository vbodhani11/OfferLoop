import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OfferCelebration } from "../OfferCelebration";
import { MotionPreferenceProvider } from "@/lib/motion/MotionPreferenceContext";
import { allJobsWithOrganizations } from "@/lib/repositories/local/jobs";
import { generateFictionalStartDate, generateOfferMessage } from "@/lib/formatting/offer";
import type { Offer } from "@/types/domain";

const job = allJobsWithOrganizations[0];

function makeOffer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: "offer-1",
    userId: "guest",
    jobId: job.id,
    applicationId: "app-1",
    recipientDisplayName: "Future You",
    fictionalStartDate: generateFictionalStartDate(job.id),
    fictionalManagerName: job.fictionalManagerName,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    currency: job.currency,
    workArrangement: job.workArrangement,
    offerMessage: generateOfferMessage(
      { title: job.title, organizationName: job.organization.name },
      "Future You",
    ),
    simulationVersion: "v1",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderCelebration(props: Partial<Parameters<typeof OfferCelebration>[0]> = {}) {
  return render(
    <MotionPreferenceProvider>
      <OfferCelebration offer={makeOffer()} job={job} autoPlayIntro={false} {...props} />
    </MotionPreferenceProvider>,
  );
}

describe("OfferCelebration", () => {
  it("renders the fictional offer with a clear not-a-real-offer disclaimer", () => {
    renderCelebration();
    expect(screen.getByText("Congratulations, Future You!")).toBeInTheDocument();
    expect(
      screen.getByText("Career Simulation — Not a Real Job Offer"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This is an entertainment experience. It is not a real employment offer and has no legal or financial value.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the job title and fictional manager", () => {
    renderCelebration();
    expect(screen.getByRole("heading", { name: job.title })).toBeInTheDocument();
    expect(
      screen.getByText(`Reporting to ${job.fictionalManagerName} (fictional manager)`),
    ).toBeInTheDocument();
  });

  it("shows a retry control when saving the offer failed", () => {
    const onRetrySave = vi.fn();
    renderCelebration({ saveError: true, onRetrySave });
    expect(
      screen.getByText(
        "We created your fictional offer, but could not save it. Your device may be low on storage.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try saving again" })).toBeInTheDocument();
  });

  it("hides the 'View offer details' link for preview (unsaved) offers", () => {
    renderCelebration({ offer: makeOffer({ id: "preview-job-1" }) });
    expect(
      screen.queryByRole("link", { name: /View offer details/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the 'View offer details' link for saved offers", () => {
    renderCelebration();
    expect(screen.getByRole("link", { name: /View offer details/i })).toHaveAttribute(
      "href",
      "/offers/offer-1",
    );
  });

  it("opens the share dialog with the not-a-real-job-offer watermark", async () => {
    renderCelebration();
    await userEvent.click(screen.getByRole("button", { name: /Share simulation card/i }));
    expect(await screen.findByText("Not a real job offer")).toBeInTheDocument();
  });

  it("calls onDelete when the delete button is clicked", async () => {
    const onDelete = vi.fn();
    renderCelebration({ onDelete });
    await userEvent.click(screen.getByRole("button", { name: "Delete offer" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
