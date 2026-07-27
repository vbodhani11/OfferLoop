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
});
