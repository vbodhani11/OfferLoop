import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SimulationDisclosure } from "../SimulationDisclosure";

describe("SimulationDisclosure", () => {
  it("renders the default disclosure copy as a note role for screen readers", () => {
    render(<SimulationDisclosure />);
    expect(screen.getByRole("note")).toHaveTextContent(
      "Entertainment simulation. No real jobs or candidates are involved.",
    );
  });

  it("renders custom children when provided", () => {
    render(
      <SimulationDisclosure>
        This opportunity exists only inside the OfferLoop simulation.
      </SimulationDisclosure>,
    );
    expect(screen.getByRole("note")).toHaveTextContent(
      "This opportunity exists only inside the OfferLoop simulation.",
    );
  });

  it("applies compact styling when requested", () => {
    render(<SimulationDisclosure compact>Compact disclosure</SimulationDisclosure>);
    expect(screen.getByRole("note")).toHaveClass("text-xs");
  });
});
