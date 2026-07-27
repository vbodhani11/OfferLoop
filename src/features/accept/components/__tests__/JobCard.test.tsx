import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobCard } from "../JobCard";
import { allJobsWithOrganizations } from "@/lib/repositories/local/jobs";

const job = allJobsWithOrganizations[0];

describe("JobCard", () => {
  it("renders the job title, company, and fictional-company disclosure", () => {
    render(<JobCard job={job} />);
    expect(screen.getByRole("heading", { name: job.title })).toBeInTheDocument();
    expect(screen.getByText(job.organization.name)).toBeInTheDocument();
    expect(screen.getByText("Fictional company")).toBeInTheDocument();
    expect(
      screen.getByText(`${job.matchPercentage}% fictional match`),
    ).toBeInTheDocument();
  });

  it("links View details and Apply to the correct job routes", () => {
    render(<JobCard job={job} />);
    expect(screen.getByRole("link", { name: "View details" })).toHaveAttribute(
      "href",
      `/accept/jobs/${job.slug}`,
    );
    expect(screen.getByRole("link", { name: "Apply" })).toHaveAttribute(
      "href",
      `/accept/review/${job.id}`,
    );
  });

  it("calls onSave with the job when the save button is clicked", async () => {
    const onSave = vi.fn();
    render(<JobCard job={job} onSave={onSave} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Save this fictional job" }),
    );
    expect(onSave).toHaveBeenCalledWith(job);
  });

  it("reflects saved state via an accessible pressed label", () => {
    render(<JobCard job={job} isSaved onSave={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Remove from saved jobs" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onSkip with the job when the skip button is clicked", async () => {
    const onSkip = vi.fn();
    render(<JobCard job={job} onSkip={onSkip} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Skip this fictional job" }),
    );
    expect(onSkip).toHaveBeenCalledWith(job);
  });

  it("does not render skip/save controls when their handlers are omitted", () => {
    render(<JobCard job={job} />);
    expect(
      screen.queryByRole("button", { name: "Skip this fictional job" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save this fictional job" }),
    ).not.toBeInTheDocument();
  });
});
