import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CandidateCard } from "../CandidateCard";
import { candidates } from "@/data/candidates";

const candidate = candidates[0];

describe("CandidateCard", () => {
  it("renders the candidate's name, headline, and fictional-candidate disclosure", () => {
    render(<CandidateCard candidate={candidate} />);
    expect(
      screen.getByRole("heading", { name: candidate.displayName }),
    ).toBeInTheDocument();
    expect(screen.getByText(candidate.headline)).toBeInTheDocument();
    expect(screen.getByText("Fictional candidate")).toBeInTheDocument();
  });

  it("links the candidate name to their profile route", () => {
    render(<CandidateCard candidate={candidate} />);
    expect(screen.getByRole("link", { name: candidate.displayName })).toHaveAttribute(
      "href",
      `/reject/candidates/${candidate.slug}`,
    );
  });

  it("hides the summary and education in compact mode", () => {
    render(<CandidateCard candidate={candidate} compact />);
    expect(screen.queryByText(candidate.summary)).not.toBeInTheDocument();
    expect(screen.queryByText(candidate.education)).not.toBeInTheDocument();
  });

  it("shows the summary and education outside of compact mode", () => {
    render(<CandidateCard candidate={candidate} />);
    expect(screen.getByText(candidate.summary)).toBeInTheDocument();
    expect(screen.getByText(candidate.education)).toBeInTheDocument();
  });

  it("does not size the card with a fixed viewport-height utility", () => {
    const { container } = render(<CandidateCard candidate={candidate} />);
    const article = container.querySelector("article");
    expect(article).not.toBeNull();
    expect(article?.className).not.toMatch(
      /\b(h-screen|min-h-screen|h-\[\d+px\]|min-h-\[\d{3,}px\]|h-\d+\/\d+|vh|h-full|flex-1)\b/,
    );
  });

  it("clamps the summary instead of stretching the card to fit long content", () => {
    const longCandidate = {
      ...candidate,
      summary:
        "A fictional summary that goes on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on.",
      skills: [
        "Skill One",
        "Skill Two",
        "Skill Three",
        "Skill Four",
        "Skill Five",
        "Skill Six",
        "Skill Seven",
        "Skill Eight",
      ],
    };
    render(<CandidateCard candidate={longCandidate} />);

    const summary = screen.getByText(longCandidate.summary);
    expect(summary.className).toMatch(/line-clamp-3/);

    // Skill chips are capped rather than rendering every single one.
    expect(screen.getAllByText(/^Skill /)).toHaveLength(5);
  });

  it("clamps the headline so long titles do not inflate the card", () => {
    const longCandidate = {
      ...candidate,
      headline:
        "Senior Fictional Specialist for Simulated Systems Across Multiple Imaginary Domains And Then Some More Words",
    };
    render(<CandidateCard candidate={longCandidate} />);
    expect(screen.getByText(longCandidate.headline).className).toMatch(/line-clamp-2/);
  });

  it("renders salary, work arrangement, and availability in the bottom section", () => {
    render(<CandidateCard candidate={candidate} />);
    expect(screen.getByText(new RegExp(candidate.availability))).toBeInTheDocument();
  });
});
