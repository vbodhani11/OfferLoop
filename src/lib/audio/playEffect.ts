"use client";

/**
 * Tiny synthesized sound effects for Reject Mode decisions. Generated with the
 * Web Audio API instead of shipping binary audio assets — every "sound" here
 * is a couple of short, quiet oscillator tones. Callers are responsible for
 * checking the user's sound preference before invoking these.
 */

export type DecisionSoundEffect = "reject" | "shortlist" | "offer";

let sharedContext: AudioContext | null = null;

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
  type: OscillatorType,
): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const startTime = ctx.currentTime + startOffset;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(peakGain, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

/** Plays a very short, quiet effect for a decision. No-ops in unsupported environments. */
export function playDecisionSound(effect: DecisionSoundEffect): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  switch (effect) {
    case "reject":
      // Soft, low "stamp/flick" — two short square-wave thuds.
      playTone(ctx, 210, 0, 0.08, 0.05, "square");
      playTone(ctx, 130, 0.05, 0.09, 0.04, "square");
      break;
    case "shortlist":
      // Light ascending confirmation click.
      playTone(ctx, 660, 0, 0.07, 0.045, "sine");
      playTone(ctx, 900, 0.055, 0.09, 0.045, "sine");
      break;
    case "offer":
      // Soft three-note chime.
      playTone(ctx, 523.25, 0, 0.12, 0.04, "sine");
      playTone(ctx, 659.25, 0.08, 0.12, 0.04, "sine");
      playTone(ctx, 783.99, 0.16, 0.18, 0.04, "sine");
      break;
    default:
      break;
  }
}
