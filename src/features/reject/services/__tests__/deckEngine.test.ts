import { describe, expect, it } from "vitest";
import { applyDecision, createInitialDeckState, undoLastDecision } from "../deckEngine";
import type { FictionalCandidate } from "@/types/domain";

function makeCandidate(id: string): FictionalCandidate {
  return {
    id,
    slug: id,
    displayName: `Candidate ${id}`,
    initials: "CX",
    headline: "Fictional headline",
    summary: "A fictional candidate summary.",
    location: "Remote",
    yearsExperience: 5,
    skills: ["Skill A"],
    education: "Fictional University",
    recentRole: "Fictional Role",
    category: "software_engineering",
    workHistory: [],
    projects: [],
    achievements: [],
    preferredWorkArrangement: "remote",
    expectedSalaryMin: 90000,
    expectedSalaryMax: 110000,
    availability: "Immediate",
    avatarStyle: { gradientFrom: "#111", gradientTo: "#222", pattern: "dots" },
    isFictional: true,
    isActive: true,
  };
}

describe("createInitialDeckState", () => {
  it("seeds the queue with all candidates and zeroed stats", () => {
    const candidates = [makeCandidate("1"), makeCandidate("2")];
    const state = createInitialDeckState(candidates);
    expect(state.queue).toHaveLength(2);
    expect(state.history).toHaveLength(0);
    expect(state.stats).toEqual({ rejected: 0, shortlisted: 0, offered: 0 });
  });

  it("does not mutate the original candidates array", () => {
    const candidates = [makeCandidate("1")];
    const state = createInitialDeckState(candidates);
    state.queue.pop();
    expect(candidates).toHaveLength(1);
  });
});

describe("applyDecision", () => {
  it("moves the current candidate from the queue into history and increments the reject count", () => {
    const state = createInitialDeckState([makeCandidate("1"), makeCandidate("2")]);
    const next = applyDecision(state, "reject");
    expect(next.queue.map((c) => c.id)).toEqual(["2"]);
    expect(next.history).toHaveLength(1);
    expect(next.history[0].decision).toBe("reject");
    expect(next.stats).toEqual({ rejected: 1, shortlisted: 0, offered: 0 });
  });

  it("increments the shortlist count for shortlist decisions", () => {
    const state = createInitialDeckState([makeCandidate("1")]);
    const next = applyDecision(state, "shortlist");
    expect(next.stats.shortlisted).toBe(1);
  });

  it("increments the offer count for offer decisions", () => {
    const state = createInitialDeckState([makeCandidate("1")]);
    const next = applyDecision(state, "offer");
    expect(next.stats.offered).toBe(1);
  });

  it("is a no-op when the queue is empty", () => {
    const state = createInitialDeckState([]);
    const next = applyDecision(state, "reject");
    expect(next).toBe(state);
  });
});

describe("undoLastDecision", () => {
  it("returns the most recently decided candidate to the front of the queue", () => {
    const state = createInitialDeckState([makeCandidate("1"), makeCandidate("2")]);
    const afterDecision = applyDecision(state, "reject");
    const undone = undoLastDecision(afterDecision);
    expect(undone.queue.map((c) => c.id)).toEqual(["1", "2"]);
    expect(undone.history).toHaveLength(0);
    expect(undone.stats.rejected).toBe(0);
  });

  it("is a no-op when there is no history", () => {
    const state = createInitialDeckState([makeCandidate("1")]);
    const undone = undoLastDecision(state);
    expect(undone).toBe(state);
  });

  it("never lets a stat go negative", () => {
    const state = createInitialDeckState([makeCandidate("1")]);
    const decided = applyDecision(state, "reject");
    const undoneOnce = undoLastDecision(decided);
    const undoneTwice = undoLastDecision(undoneOnce);
    expect(undoneTwice.stats.rejected).toBe(0);
  });

  it("supports undoing several decisions in sequence (deck reset semantics)", () => {
    let state = createInitialDeckState([
      makeCandidate("1"),
      makeCandidate("2"),
      makeCandidate("3"),
    ]);
    state = applyDecision(state, "reject");
    state = applyDecision(state, "shortlist");
    state = applyDecision(state, "offer");
    expect(state.queue).toHaveLength(0);

    state = undoLastDecision(state);
    state = undoLastDecision(state);
    state = undoLastDecision(state);
    expect(state.queue.map((c) => c.id)).toEqual(["1", "2", "3"]);
    expect(state.stats).toEqual({ rejected: 0, shortlisted: 0, offered: 0 });
  });
});
