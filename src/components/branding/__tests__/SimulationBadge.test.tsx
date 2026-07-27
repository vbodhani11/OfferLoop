import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SimulationBadge } from "../SimulationBadge";

describe("SimulationBadge", () => {
  it("renders the entertainment-simulation disclosure text", () => {
    render(<SimulationBadge />);
    expect(screen.getByText("Entertainment simulation")).toBeInTheDocument();
  });

  it("accepts a custom className", () => {
    render(<SimulationBadge className="custom-class" />);
    expect(screen.getByText("Entertainment simulation")).toHaveClass("custom-class");
  });
});
