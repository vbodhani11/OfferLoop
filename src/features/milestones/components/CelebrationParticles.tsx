"use client";

import { useEffect, useRef } from "react";
import type { CelebrationIntensityPref } from "../types";

interface CelebrationParticlesProps {
  intensity: CelebrationIntensityPref;
}

/**
 * Brief restrained confetti burst. Decorative only (aria-hidden).
 * Cleans up by cancelling pending import work; canvases are short-lived.
 */
export function CelebrationParticles({ intensity }: CelebrationParticlesProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    let cancelled = false;

    void import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      const particleCount = intensity === "maximum" ? 90 : 45;
      const spread = intensity === "maximum" ? 70 : 55;
      void confetti({
        particleCount,
        spread,
        startVelocity: 28,
        gravity: 1.1,
        ticks: 120,
        origin: { y: 0.65 },
        disableForReducedMotion: true,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [intensity]);

  return (
    <div
      aria-hidden="true"
      data-testid="celebration-particles"
      className="pointer-events-none"
    />
  );
}
