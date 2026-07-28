import { describe, expect, it } from "vitest";
import {
  formatOfferSalaryLine,
  generateFictionalStartDate,
  generateOfferId,
  generateOfferMessage,
} from "../offer";

describe("generateFictionalStartDate", () => {
  it("returns an ISO date roughly three weeks after the reference date", () => {
    const from = new Date("2026-01-01T00:00:00.000Z");
    const result = generateFictionalStartDate("job-nova-sap-engineer", from);
    const diffDays =
      (new Date(result).getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThanOrEqual(21);
    expect(diffDays).toBeLessThan(35);
  });

  it("is deterministic for the same job id and reference date", () => {
    const from = new Date("2026-01-01T00:00:00.000Z");
    const first = generateFictionalStartDate("job-orbit-pm", from);
    const second = generateFictionalStartDate("job-orbit-pm", from);
    expect(first).toBe(second);
  });

  it("varies the offset based on the job id so offers don't collide", () => {
    const from = new Date("2026-01-01T00:00:00.000Z");
    const dateA = generateFictionalStartDate("job-a", from);
    const dateB = generateFictionalStartDate("job-completely-different-id", from);
    expect(dateA === dateB).toBe(false);
  });
});

describe("generateOfferMessage", () => {
  it("includes the recipient name, company, and title", () => {
    const message = generateOfferMessage(
      { title: "Senior SAP Application Engineer", organizationName: "Nova Systems" },
      "Future You",
    );
    expect(message).toContain("Future You");
    expect(message).toContain("Nova Systems");
    expect(message).toContain("Senior SAP Application Engineer");
    expect(message).toContain("simulation");
  });

  it("does not duplicate the standalone legal disclaimer shown by <OfferCelebration>", () => {
    // That exact sentence is rendered once, separately, by the celebration UI.
    // If this message ever contains it too, the disclaimer would appear twice.
    const message = generateOfferMessage(
      { title: "Senior SAP Application Engineer", organizationName: "Nova Systems" },
      "Future You",
    );
    expect(message).not.toContain("not a real employment offer");
  });
});

describe("generateOfferId", () => {
  it("is deterministic for the same seed", () => {
    expect(generateOfferId("offer-123")).toBe(generateOfferId("offer-123"));
  });

  it("produces different ids for different seeds", () => {
    expect(generateOfferId("offer-123")).not.toBe(generateOfferId("offer-456"));
  });

  it("always uses the OL- prefix", () => {
    expect(generateOfferId("anything")).toMatch(/^OL-[0-9A-Z]{6,}$/);
  });
});

describe("formatOfferSalaryLine", () => {
  it("formats a compact fictional annual salary line", () => {
    const line = formatOfferSalaryLine({
      salaryMin: 90000,
      salaryMax: 120000,
      currency: "USD",
    });
    expect(line).toBe("$90K–$120K / year (fictional)");
  });
});
