import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "../ThemeToggle";

function renderWithTheme(defaultTheme: "light" | "dark" = "light") {
  return render(
    <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem={false}>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe("ThemeToggle", () => {
  it("renders an accessible toggle once mounted, defaulting to a dark-theme label in light mode", async () => {
    renderWithTheme("light");
    const button = await screen.findByRole("button", { name: "Switch to dark theme" });
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("switches the label and aria-pressed state after a click", async () => {
    renderWithTheme("light");
    const button = await screen.findByRole("button", { name: "Switch to dark theme" });
    await userEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Switch to light theme" }),
      ).toHaveAttribute("aria-pressed", "true");
    });
  });
});
