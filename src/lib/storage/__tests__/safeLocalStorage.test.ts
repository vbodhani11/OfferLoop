import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  safeReadLocalStorage,
  safeRemoveLocalStorage,
  safeWriteLocalStorage,
} from "../safeLocalStorage";

const schema = z.object({ name: z.string() });

describe("safeWriteLocalStorage / safeReadLocalStorage round-trip", () => {
  it("writes and reads back a valid value", () => {
    expect(safeWriteLocalStorage("test-key", { name: "Future You" })).toBe(true);
    expect(safeReadLocalStorage("test-key", schema, { name: "fallback" })).toEqual({
      name: "Future You",
    });
  });

  it("returns the fallback when the key does not exist", () => {
    expect(safeReadLocalStorage("missing-key", schema, { name: "fallback" })).toEqual({
      name: "fallback",
    });
  });
});

describe("safeReadLocalStorage validation", () => {
  it("clears and falls back on malformed JSON", () => {
    window.localStorage.setItem("bad-json", "{not valid json");
    const result = safeReadLocalStorage("bad-json", schema, { name: "fallback" });
    expect(result).toEqual({ name: "fallback" });
    expect(window.localStorage.getItem("bad-json")).toBeNull();
  });

  it("clears and falls back when the schema doesn't match", () => {
    window.localStorage.setItem("wrong-shape", JSON.stringify({ name: 42 }));
    const result = safeReadLocalStorage("wrong-shape", schema, { name: "fallback" });
    expect(result).toEqual({ name: "fallback" });
    expect(window.localStorage.getItem("wrong-shape")).toBeNull();
  });

  it("clears and falls back on an unexpected array where an object is expected", () => {
    window.localStorage.setItem("wrong-type", JSON.stringify([1, 2, 3]));
    const result = safeReadLocalStorage("wrong-type", schema, { name: "fallback" });
    expect(result).toEqual({ name: "fallback" });
  });
});

describe("safeRemoveLocalStorage", () => {
  it("removes an existing key", () => {
    window.localStorage.setItem("to-remove", "1");
    safeRemoveLocalStorage("to-remove");
    expect(window.localStorage.getItem("to-remove")).toBeNull();
  });
});

describe("localStorage unavailable", () => {
  it("safeWriteLocalStorage and safeReadLocalStorage degrade gracefully without throwing when storage is unavailable", () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
    const throwingStorage = {
      getItem: () => {
        throw new Error("storage unavailable");
      },
      setItem: () => {
        throw new Error("storage unavailable");
      },
      removeItem: () => {
        throw new Error("storage unavailable");
      },
    };
    Object.defineProperty(window, "localStorage", {
      value: throwingStorage,
      configurable: true,
    });

    try {
      expect(() => safeWriteLocalStorage("any-key", { name: "x" })).not.toThrow();
      expect(safeWriteLocalStorage("any-key", { name: "x" })).toBe(false);
      expect(() =>
        safeReadLocalStorage("any-key", schema, { name: "fallback" }),
      ).not.toThrow();
      expect(safeReadLocalStorage("any-key", schema, { name: "fallback" })).toEqual({
        name: "fallback",
      });
    } finally {
      if (originalDescriptor)
        Object.defineProperty(window, "localStorage", originalDescriptor);
    }
  });
});
