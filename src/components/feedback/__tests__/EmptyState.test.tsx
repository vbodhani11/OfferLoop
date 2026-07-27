import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renders the title and description", () => {
    render(
      <EmptyState
        title="No fictional offers yet"
        description="Apply to a job to receive one."
      />,
    );
    expect(
      screen.getByRole("heading", { name: "No fictional offers yet" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Apply to a job to receive one.")).toBeInTheDocument();
  });

  it("renders an optional action and forwards interactions", async () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        title="Nothing here"
        action={
          <button type="button" onClick={onClick}>
            Explore Accept Mode
          </button>
        }
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Explore Accept Mode" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
