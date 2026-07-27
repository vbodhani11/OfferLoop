import { describe, expect, it } from "vitest";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatRelativeDays,
  formatSalaryRange,
} from "../currency";

describe("formatCurrency", () => {
  it("formats a whole-dollar USD amount with no decimals", () => {
    expect(formatCurrency(125000)).toBe("$125,000");
  });

  it("supports other currency codes", () => {
    expect(formatCurrency(1000, "EUR")).toContain("1,000");
  });
});

describe("formatCompactCurrency", () => {
  it("compacts large values with a k/m suffix", () => {
    expect(formatCompactCurrency(125000)).toBe("$125K");
  });

  it("does not compact values under 1000", () => {
    expect(formatCompactCurrency(45)).toBe("$45");
  });
});

describe("formatSalaryRange", () => {
  it("renders an hourly range for internship-style values under 1000", () => {
    expect(formatSalaryRange(20, 30)).toBe("$20–$30/hr");
  });

  it("renders a compact annual range for salaried values", () => {
    expect(formatSalaryRange(90000, 120000)).toBe("$90K–$120K");
  });
});

describe("formatRelativeDays", () => {
  it("labels same-day postings", () => {
    expect(formatRelativeDays(0)).toBe("Simulated today");
  });

  it("labels a single day ago in the singular", () => {
    expect(formatRelativeDays(1)).toBe("Simulated 1 day ago");
  });

  it("labels multiple days ago in the plural", () => {
    expect(formatRelativeDays(3)).toBe("Simulated 3 days ago");
  });

  it("labels weeks ago once past 7 days", () => {
    expect(formatRelativeDays(14)).toBe("Simulated 2 weeks ago");
  });

  it("labels months ago once past ~5 weeks", () => {
    expect(formatRelativeDays(60)).toBe("Simulated 2 months ago");
  });
});

describe("formatDate", () => {
  it("formats an ISO date string as a long-form date", () => {
    expect(formatDate("2026-01-15")).toBe("January 15, 2026");
  });
});
