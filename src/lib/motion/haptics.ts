"use client";

export type HapticEffect = "reject" | "shortlist" | "offer";

const PATTERNS: Record<HapticEffect, number | number[]> = {
  reject: 12,
  shortlist: 8,
  offer: [8, 40, 8],
};

/**
 * Fires a very short vibration for supported mobile browsers. Callers must
 * confirm the user has opted in and that reduced motion is not preferred
 * before calling this — it performs no preference checks of its own.
 */
export function triggerHapticFeedback(effect: HapticEffect): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(PATTERNS[effect]);
  } catch {
    // Vibration is best-effort only; ignore browsers that reject the call.
  }
}
