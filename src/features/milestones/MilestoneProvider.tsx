"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import { useMotionPreference } from "@/lib/motion/MotionPreferenceContext";
import { useRepositories } from "@/lib/repositories/useRepositories";
import { readGuestSettings, writeGuestSettings } from "@/lib/storage/guestStore";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  evaluateMilestones,
  incrementCounts,
  mapActionKindToCategory,
  partitionCelebrations,
} from "./calculate";
import { getLiveAnnouncement } from "./milestoneCopy";
import { onMilestoneProgress, onMilestoneUndo } from "./notify";
import { playMilestoneSound } from "./playMilestoneSound";
import { syncMilestonesToSupabase } from "./supabaseSync";
import {
  broadcastMilestoneEvent,
  MILESTONE_BROADCAST_CHANNEL,
  readLifetimeProgress,
  readMilestoneSettings,
  readSessionProgress,
  writeLifetimeProgress,
  writeMilestoneSettings,
  writeSessionProgress,
  type MilestoneBroadcastMessage,
} from "./storage";
import type {
  CategoryCounts,
  MilestoneActionKind,
  MilestoneSettings,
  PendingCelebration,
  UnlockedAchievement,
} from "./types";
import { totalFromCounts } from "./types";
import { AchievementUnlockedToast } from "./components/AchievementUnlockedToast";
import { MilestoneCelebrationDialog } from "./components/MilestoneCelebrationDialog";
import { MilestoneToast } from "./components/MilestoneToast";

interface MilestoneContextValue {
  lifetimeCounts: CategoryCounts;
  sessionCounts: CategoryCounts;
  unlockedAchievements: UnlockedAchievement[];
  settings: MilestoneSettings;
  updateSettings: (partial: Partial<MilestoneSettings>) => void;
  liveAnnouncement: string;
}

const MilestoneContext = createContext<MilestoneContextValue | null>(null);

function markDisplayed(
  progress: ReturnType<typeof readLifetimeProgress>,
  keys: string[],
  sessionId: string,
) {
  const existing = new Set(progress.displayedMilestones.map((d) => d.milestoneKey));
  const now = new Date().toISOString();
  const added = keys
    .filter((key) => !existing.has(key))
    .map((milestoneKey) => ({
      milestoneKey,
      displayedAt: now,
      sessionId,
      version: 1 as const,
    }));
  return {
    ...progress,
    displayedMilestones: [...progress.displayedMilestones, ...added],
  };
}

export function MilestoneProvider({ children }: { children: ReactNode }) {
  const { userId, isGuest } = useRepositories();
  const scopeId = isGuest ? null : userId;
  const { reducedMotion, celebrationIntensity, confettiEnabled, soundEnabled } =
    useMotionPreference();
  const router = useRouter();

  const [lifetimeCounts, setLifetimeCounts] = useState<CategoryCounts>(
    () => readLifetimeProgress(null).counts,
  );
  const [sessionCounts, setSessionCounts] = useState<CategoryCounts>(
    () => readSessionProgress().counts,
  );
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>(
    [],
  );
  const [settings, setSettings] = useState<MilestoneSettings>(() =>
    readMilestoneSettings(),
  );
  const [primary, setPrimary] = useState<PendingCelebration | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<PendingCelebration[]>([]);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const processingRef = useRef(false);
  const mountedRef = useRef(true);

  // Load scoped progress after mount / auth change
  useEffect(() => {
    mountedRef.current = true;
    const lifetime = readLifetimeProgress(scopeId);
    const session = readSessionProgress();
    const guestSettings = readGuestSettings();
    const milestoneSettings = {
      ...readMilestoneSettings(),
      celebrationsEnabled: guestSettings.milestoneCelebrationsEnabled,
      celebrationSoundEnabled: guestSettings.soundEnabled,
      achievementNotificationsEnabled: guestSettings.achievementNotificationsEnabled,
    };
    /* eslint-disable react-hooks/set-state-in-effect */
    setLifetimeCounts(lifetime.counts);
    setUnlockedAchievements(lifetime.unlockedAchievements);
    setSessionCounts(session.counts);
    setSettings(milestoneSettings);
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      mountedRef.current = false;
    };
  }, [scopeId]);

  // Cross-tab sync
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(MILESTONE_BROADCAST_CHANNEL);
    channel.onmessage = (event: MessageEvent<MilestoneBroadcastMessage>) => {
      const message = event.data;
      if (!message || message.scopeId !== scopeId) return;
      if (message.type === "milestone_displayed") {
        const lifetime = readLifetimeProgress(scopeId);
        const session = readSessionProgress();
        const next = markDisplayed(lifetime, [message.milestoneKey], session.sessionId);
        writeLifetimeProgress(next, scopeId);
      }
      if (message.type === "achievement_unlocked" || message.type === "progress_reset") {
        const lifetime = readLifetimeProgress(scopeId);
        if (!mountedRef.current) return;
        setLifetimeCounts(lifetime.counts);
        setUnlockedAchievements(lifetime.unlockedAchievements);
      }
    };
    return () => channel.close();
  }, [scopeId]);

  const dismissPrimary = useCallback(() => {
    setPrimary((current) => {
      if (current) {
        trackEvent("milestone_dismissed", {
          category: current.category,
          threshold: current.threshold,
          guest: isGuest,
          reduced_motion: reducedMotion,
        });
      }
      return null;
    });
  }, [isGuest, reducedMotion]);

  const processAction = useCallback(
    (kind: MilestoneActionKind) => {
      if (processingRef.current) {
        // Allow rapid actions but serialize celebration evaluation per tick
      }
      try {
        const category = mapActionKindToCategory(kind);
        const lifetime = readLifetimeProgress(scopeId);
        const session = readSessionProgress();
        const previousCounts = lifetime.counts;
        const nextCounts = incrementCounts(previousCounts, category, 1);
        const nextSessionCounts = incrementCounts(session.counts, category, 1);

        const unlockedCodes = new Set(
          lifetime.unlockedAchievements.map((a) => a.achievementCode),
        );
        const displayedKeys = new Set(
          lifetime.displayedMilestones.map((d) => d.milestoneKey),
        );

        const evaluation = evaluateMilestones({
          previousCounts,
          nextCounts,
          unlockedCodes,
          displayedKeys,
          recentPlayfulLines: lifetime.recentPlayfulLines,
          triggeredCategory: category,
        });

        const mergedAchievements = [
          ...lifetime.unlockedAchievements,
          ...evaluation.newlyUnlocked.filter(
            (a) => !unlockedCodes.has(a.achievementCode),
          ),
        ];

        let nextLifetime = {
          ...lifetime,
          counts: nextCounts,
          unlockedAchievements: mergedAchievements,
          recentPlayfulLines: [
            ...lifetime.recentPlayfulLines,
            ...evaluation.playfulLinesUsed,
          ].slice(-12),
        };

        const { primary: nextPrimary, badges } = partitionCelebrations(
          evaluation.celebrations,
        );

        const keysToMark = [
          ...(nextPrimary ? [nextPrimary.milestoneKey] : []),
          ...badges.map((b) => b.milestoneKey),
          ...evaluation.newlyUnlocked.map((a) => `achievement:${a.achievementCode}`),
        ];

        // Always mark newly crossed keys as displayed so refresh won't re-fire
        // even when celebrations are disabled.
        nextLifetime = markDisplayed(nextLifetime, keysToMark, session.sessionId);
        writeLifetimeProgress(nextLifetime, scopeId);
        writeSessionProgress({ ...session, counts: nextSessionCounts });

        if (!isGuest && scopeId) {
          const client = getSupabaseBrowserClient();
          if (client) {
            void syncMilestonesToSupabase(
              client,
              scopeId,
              evaluation.newlyUnlocked,
              keysToMark,
            );
          }
        }

        for (const key of keysToMark) {
          broadcastMilestoneEvent({
            type: "milestone_displayed",
            milestoneKey: key,
            scopeId,
          });
        }
        for (const achievement of evaluation.newlyUnlocked) {
          broadcastMilestoneEvent({
            type: "achievement_unlocked",
            achievementCode: achievement.achievementCode,
            scopeId,
          });
          trackEvent("achievement_unlocked", {
            achievement_code: achievement.achievementCode,
            category: achievement.category,
            guest: isGuest,
            reduced_motion: reducedMotion,
          });
        }

        if (!mountedRef.current) return;

        setLifetimeCounts(nextCounts);
        setSessionCounts(nextSessionCounts);
        setUnlockedAchievements(mergedAchievements);

        const guestSettings = readGuestSettings();
        const currentSettings = {
          ...readMilestoneSettings(),
          celebrationsEnabled: guestSettings.milestoneCelebrationsEnabled,
          celebrationSoundEnabled: guestSettings.soundEnabled,
          achievementNotificationsEnabled: guestSettings.achievementNotificationsEnabled,
        };
        if (!currentSettings.celebrationsEnabled) return;

        if (nextPrimary) {
          trackEvent("milestone_reached", {
            category: nextPrimary.category,
            threshold: nextPrimary.threshold,
            celebration_intensity: celebrationIntensity,
            guest: isGuest,
            reduced_motion: reducedMotion,
          });
          setLiveAnnouncement(
            getLiveAnnouncement(nextPrimary.category, nextPrimary.threshold),
          );
          setPrimary((existing) => existing ?? nextPrimary);

          const shouldSound =
            (currentSettings.celebrationSoundEnabled || soundEnabled) &&
            (nextPrimary.kind === "dialog" ||
              nextPrimary.kind === "summary" ||
              nextPrimary.kind === "achievement");
          if (shouldSound) playMilestoneSound();
        }

        if (currentSettings.achievementNotificationsEnabled && badges.length > 0) {
          setBadgeQueue((queue) => [...queue, ...badges]);
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[milestones] processAction failed", error);
        }
      }
    },
    [celebrationIntensity, isGuest, reducedMotion, scopeId, soundEnabled],
  );

  const processUndo = useCallback(
    (kind: MilestoneActionKind) => {
      try {
        const category = mapActionKindToCategory(kind);
        const lifetime = readLifetimeProgress(scopeId);
        const session = readSessionProgress();
        const nextCounts = incrementCounts(lifetime.counts, category, -1);
        const nextSessionCounts = incrementCounts(session.counts, category, -1);
        // Policy: keep unlocked achievements as historical accomplishments.
        writeLifetimeProgress({ ...lifetime, counts: nextCounts }, scopeId);
        writeSessionProgress({ ...session, counts: nextSessionCounts });
        if (!mountedRef.current) return;
        setLifetimeCounts(nextCounts);
        setSessionCounts(nextSessionCounts);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[milestones] processUndo failed", error);
        }
      }
    },
    [scopeId],
  );

  useEffect(() => {
    const offProgress = onMilestoneProgress(processAction);
    const offUndo = onMilestoneUndo(processUndo);
    return () => {
      offProgress();
      offUndo();
    };
  }, [processAction, processUndo]);

  const updateSettings = useCallback(
    (partial: Partial<MilestoneSettings>) => {
      const next = { ...readMilestoneSettings(), ...partial, version: 1 as const };
      writeMilestoneSettings(next);
      writeGuestSettings({
        ...readGuestSettings(),
        ...(partial.celebrationsEnabled !== undefined
          ? { milestoneCelebrationsEnabled: partial.celebrationsEnabled }
          : {}),
        ...(partial.achievementNotificationsEnabled !== undefined
          ? {
              achievementNotificationsEnabled: partial.achievementNotificationsEnabled,
            }
          : {}),
        ...(partial.celebrationSoundEnabled !== undefined
          ? { soundEnabled: partial.celebrationSoundEnabled }
          : {}),
      });
      setSettings(next);
      trackEvent("milestone_setting_changed", {
        celebrations_enabled: next.celebrationsEnabled,
        celebration_intensity: next.celebrationIntensity,
        sound_enabled: next.celebrationSoundEnabled,
        guest: isGuest,
      });
    },
    [isGuest],
  );

  const value = useMemo<MilestoneContextValue>(
    () => ({
      lifetimeCounts,
      sessionCounts,
      unlockedAchievements,
      settings,
      updateSettings,
      liveAnnouncement,
    }),
    [
      lifetimeCounts,
      sessionCounts,
      unlockedAchievements,
      settings,
      updateSettings,
      liveAnnouncement,
    ],
  );

  const activeBadge = badgeQueue[0] ?? null;
  const effectiveIntensity = reducedMotion ? "minimal" : celebrationIntensity;

  return (
    <MilestoneContext.Provider value={value}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>
      <AnimatePresence>
        {primary &&
        (primary.kind === "dialog" ||
          primary.kind === "summary" ||
          (primary.kind === "achievement" && primary.threshold >= 10)) ? (
          <MilestoneCelebrationDialog
            key={primary.id}
            celebration={primary}
            intensity={effectiveIntensity}
            confettiEnabled={confettiEnabled && !reducedMotion}
            onDismiss={dismissPrimary}
            onKeepGoing={dismissPrimary}
            onViewProgress={() => {
              trackEvent("milestone_progress_viewed", {
                guest: isGuest,
                reduced_motion: reducedMotion,
              });
              dismissPrimary();
              router.push("/profile#achievements");
            }}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {primary &&
        (primary.kind === "toast" ||
          (primary.kind === "achievement" && primary.threshold < 10)) ? (
          <MilestoneToast
            key={primary.id}
            celebration={primary}
            onDismiss={dismissPrimary}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {activeBadge && !primary ? (
          <AchievementUnlockedToast
            key={activeBadge.id}
            celebration={activeBadge}
            onDismiss={() => setBadgeQueue((queue) => queue.slice(1))}
          />
        ) : null}
      </AnimatePresence>
    </MilestoneContext.Provider>
  );
}

export function useMilestones(): MilestoneContextValue {
  const ctx = useContext(MilestoneContext);
  if (!ctx) {
    throw new Error("useMilestones must be used within MilestoneProvider");
  }
  return ctx;
}

export function useAchievementProgress() {
  const { lifetimeCounts, unlockedAchievements } = useMilestones();
  const unlockedCodes = useMemo(
    () => new Set(unlockedAchievements.map((a) => a.achievementCode)),
    [unlockedAchievements],
  );
  return {
    counts: lifetimeCounts,
    total: totalFromCounts(lifetimeCounts),
    unlockedAchievements,
    unlockedCodes,
  };
}
