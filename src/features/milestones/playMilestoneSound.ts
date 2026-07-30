"use client";

/**
 * Soft milestone success chime. Off by default — only call when the user has
 * explicitly enabled celebration sound. Uses Web Audio; no binary assets.
 */

let sharedContext: AudioContext | null = null;
let lastPlayedAt = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!sharedContext) {
    sharedContext = new AudioContextCtor();
  }
  return sharedContext;
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startOffset: number,
  duration: number,
  peakGain: number,
): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const startTime = ctx.currentTime + startOffset;
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

/** Quiet ascending chime for major milestones. Debounced to avoid overlap. */
export function playMilestoneSound(): void {
  const now = Date.now();
  if (now - lastPlayedAt < 800) return;
  lastPlayedAt = now;

  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  playTone(ctx, 523.25, 0, 0.14, 0.035);
  playTone(ctx, 659.25, 0.1, 0.16, 0.035);
  playTone(ctx, 783.99, 0.2, 0.2, 0.03);
}
