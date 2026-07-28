import { describe, expect, it, vi } from "vitest";
import {
  getRandomRejectMessage,
  pickRejectMessage,
  resetRejectMessageHistory,
} from "../rejectMessages";

describe("pickRejectMessage", () => {
  it("returns one of the known reject messages", () => {
    for (let i = 0; i < 20; i += 1) {
      expect(typeof pickRejectMessage()).toBe("string");
    }
  });

  it("never returns the same message twice in a row", () => {
    let previous = pickRejectMessage();
    for (let i = 0; i < 50; i += 1) {
      const next = pickRejectMessage(previous);
      expect(next).not.toBe(previous);
      previous = next;
    }
  });

  it("does not use cruel, appearance-based, or humiliating language", () => {
    const disallowed = ["ugly", "stupid", "dumb", "fat", "loser", "worthless"];
    for (let i = 0; i < 20; i += 1) {
      const message = pickRejectMessage().toLowerCase();
      for (const word of disallowed) {
        expect(message).not.toContain(word);
      }
    }
  });
});

describe("getRandomRejectMessage", () => {
  it("tracks the last message shown and avoids repeating it consecutively", () => {
    resetRejectMessageHistory();
    const seen: string[] = [];
    for (let i = 0; i < 30; i += 1) {
      seen.push(getRandomRejectMessage());
    }
    for (let i = 1; i < seen.length; i += 1) {
      expect(seen[i]).not.toBe(seen[i - 1]);
    }
  });

  it("falls back to the full pool when Math.random always returns 0", () => {
    resetRejectMessageHistory();
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
    const first = getRandomRejectMessage();
    const second = getRandomRejectMessage();
    expect(second).not.toBe(first);
    randomSpy.mockRestore();
  });
});
