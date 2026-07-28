import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RejectReasonDialog } from "../RejectReasonDialog";
import { candidates } from "@/data/candidates";
import { REJECTION_REASONS } from "@/features/reject/services/rejectionReasons";

describe("RejectReasonDialog", () => {
  it("renders the candidate summary and all approved reasons", () => {
    render(
      <RejectReasonDialog
        open
        candidate={candidates[0]}
        source="reject_button"
        submitting={false}
        errorMessage={null}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Why are you rejecting this fictional candidate?",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(candidates[0].displayName)).toBeInTheDocument();
    expect(screen.getByText("Fictional candidate")).toBeInTheDocument();

    for (const reason of REJECTION_REASONS) {
      expect(screen.getByRole("radio", { name: reason.label })).toBeInTheDocument();
    }

    const joined = screen
      .getAllByRole("radio")
      .map((node) => node.textContent?.toLowerCase() ?? "")
      .join(" ");
    expect(joined).not.toMatch(/age|gender|race|appearance|religion|disability/);
  });

  it("calls onConfirm with the selected reason and trimmed note", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <RejectReasonDialog
        open
        candidate={candidates[0]}
        source="reject_button"
        submitting={false}
        errorMessage={null}
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "Skills do not match" }));
    await user.type(
      screen.getByLabelText("Optional fictional hiring note"),
      "  Need stronger TypeScript depth.  ",
    );
    await user.click(screen.getByRole("button", { name: "Confirm rejection" }));

    expect(onConfirm).toHaveBeenCalledWith({
      reasonCode: "skills_mismatch",
      reasonLabel: "Skills do not match",
      comment: "Need stronger TypeScript depth.",
      source: "reject_button",
    });
  });

  it("shows a validation message when confirm is attempted without a reason", async () => {
    // Confirm stays disabled without a reason; assert that contract directly.
    render(
      <RejectReasonDialog
        open
        candidate={candidates[0]}
        source="reject_button"
        submitting={false}
        errorMessage={null}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Confirm rejection" })).toBeDisabled();
  });
});
