import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorState } from "../ErrorState";

describe("ErrorState", () => {
  it("renders with an alert role so screen readers announce it immediately", () => {
    render(<ErrorState />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders custom title and description", () => {
    render(
      <ErrorState
        title="We could not load the next candidate"
        description="Try again in a moment."
      />,
    );
    expect(screen.getByText("We could not load the next candidate")).toBeInTheDocument();
    expect(screen.getByText("Try again in a moment.")).toBeInTheDocument();
  });

  it("calls onRetry when the retry button is clicked", async () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} retryLabel="Try again" />);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render a retry button when onRetry is omitted", () => {
    render(<ErrorState />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
