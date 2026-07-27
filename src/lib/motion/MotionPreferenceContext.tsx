"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { readGuestSettings, writeGuestSettings } from "@/lib/storage/guestStore";
import type { CelebrationIntensity } from "@/types/domain";

interface MotionPreferenceContextValue {
  systemReducedMotion: boolean;
  reducedMotionOverride: boolean;
  reducedMotion: boolean;
  setReducedMotionOverride: (value: boolean) => void;
  celebrationIntensity: CelebrationIntensity;
  setCelebrationIntensity: (value: CelebrationIntensity) => void;
  confettiEnabled: boolean;
  setConfettiEnabled: (value: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
}

const MotionPreferenceContext = createContext<MotionPreferenceContextValue | null>(null);

export function MotionPreferenceProvider({ children }: { children: ReactNode }) {
  const systemReducedMotion = usePrefersReducedMotion();
  const [reducedMotionOverride, setReducedMotionOverride] = useState(false);
  const [celebrationIntensity, setCelebrationIntensityState] =
    useState<CelebrationIntensity>("standard");
  const [confettiEnabled, setConfettiEnabledState] = useState(true);
  const [soundEnabled, setSoundEnabledState] = useState(false);

  useEffect(() => {
    // Reading localStorage must happen after mount to avoid an SSR/client
    // hydration mismatch. This effect runs exactly once on mount, so it does
    // not cause cascading re-renders despite triggering React's
    // set-state-in-effect check.
    const settings = readGuestSettings();
    /* eslint-disable react-hooks/set-state-in-effect */
    setReducedMotionOverride(settings.reducedMotion);
    setCelebrationIntensityState(settings.celebrationIntensity);
    setConfettiEnabledState(settings.confettiEnabled);
    setSoundEnabledState(settings.soundEnabled);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const persist = (partial: Partial<ReturnType<typeof readGuestSettings>>) => {
    writeGuestSettings({ ...readGuestSettings(), ...partial });
  };

  const value = useMemo<MotionPreferenceContextValue>(
    () => ({
      systemReducedMotion,
      reducedMotionOverride,
      reducedMotion: systemReducedMotion || reducedMotionOverride,
      setReducedMotionOverride: (value) => {
        setReducedMotionOverride(value);
        persist({ reducedMotion: value });
      },
      celebrationIntensity,
      setCelebrationIntensity: (value) => {
        setCelebrationIntensityState(value);
        persist({ celebrationIntensity: value });
      },
      confettiEnabled,
      setConfettiEnabled: (value) => {
        setConfettiEnabledState(value);
        persist({ confettiEnabled: value });
      },
      soundEnabled,
      setSoundEnabled: (value) => {
        setSoundEnabledState(value);
        persist({ soundEnabled: value });
      },
    }),
    [
      systemReducedMotion,
      reducedMotionOverride,
      celebrationIntensity,
      confettiEnabled,
      soundEnabled,
    ],
  );

  return (
    <MotionPreferenceContext.Provider value={value}>
      {children}
    </MotionPreferenceContext.Provider>
  );
}

export function useMotionPreference(): MotionPreferenceContextValue {
  const ctx = useContext(MotionPreferenceContext);
  if (!ctx)
    throw new Error("useMotionPreference must be used within MotionPreferenceProvider");
  return ctx;
}
