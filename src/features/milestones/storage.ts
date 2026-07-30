import { STORAGE_KEYS } from "@/lib/constants/storageKeys";
import {
  safeReadLocalStorage,
  safeWriteLocalStorage,
  safeRemoveLocalStorage,
} from "@/lib/storage/safeLocalStorage";
import { z } from "zod";
import {
  emptyCategoryCounts,
  lifetimeProgressSchema,
  milestoneSettingsSchema,
  sessionProgressSchema,
  type LifetimeProgress,
  type MilestoneSettings,
  type SessionProgress,
} from "./types";

function isSessionStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__offerloop_session_test__";
    window.sessionStorage.setItem(testKey, "1");
    window.sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function safeReadSessionStorage<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  if (!isSessionStorageAvailable()) return fallback;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    if (!result.success) {
      window.sessionStorage.removeItem(key);
      return fallback;
    }
    return result.data;
  } catch {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      /* no-op */
    }
    return fallback;
  }
}

function safeWriteSessionStorage<T>(key: string, value: T): boolean {
  if (!isSessionStorageAvailable()) return false;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ms-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const DEFAULT_LIFETIME: LifetimeProgress = {
  version: 1,
  counts: emptyCategoryCounts(),
  unlockedAchievements: [],
  displayedMilestones: [],
  recentPlayfulLines: [],
};

const DEFAULT_SETTINGS: MilestoneSettings = {
  version: 1,
  celebrationsEnabled: true,
  celebrationIntensity: "standard",
  celebrationSoundEnabled: false,
  achievementNotificationsEnabled: true,
};

function storageScopeKey(base: string, scopeId: string | null): string {
  return scopeId ? `${base}:${scopeId}` : base;
}

export function readLifetimeProgress(scopeId: string | null = null): LifetimeProgress {
  const key = storageScopeKey(STORAGE_KEYS.milestonesLifetime, scopeId);
  return safeReadLocalStorage(key, lifetimeProgressSchema, DEFAULT_LIFETIME);
}

export function writeLifetimeProgress(
  progress: LifetimeProgress,
  scopeId: string | null = null,
): boolean {
  const key = storageScopeKey(STORAGE_KEYS.milestonesLifetime, scopeId);
  return safeWriteLocalStorage(key, progress);
}

export function readMilestoneSettings(): MilestoneSettings {
  return safeReadLocalStorage(
    STORAGE_KEYS.milestoneSettings,
    milestoneSettingsSchema,
    DEFAULT_SETTINGS,
  );
}

export function writeMilestoneSettings(settings: MilestoneSettings): boolean {
  return safeWriteLocalStorage(STORAGE_KEYS.milestoneSettings, settings);
}

export function readSessionProgress(): SessionProgress {
  if (!isSessionStorageAvailable()) {
    return {
      version: 1,
      sessionId: generateId(),
      counts: emptyCategoryCounts(),
      startedAt: new Date().toISOString(),
    };
  }
  const raw = window.sessionStorage.getItem(STORAGE_KEYS.milestoneSession);
  if (raw === null) {
    const created: SessionProgress = {
      version: 1,
      sessionId: generateId(),
      counts: emptyCategoryCounts(),
      startedAt: new Date().toISOString(),
    };
    safeWriteSessionStorage(STORAGE_KEYS.milestoneSession, created);
    return created;
  }
  return safeReadSessionStorage(STORAGE_KEYS.milestoneSession, sessionProgressSchema, {
    version: 1,
    sessionId: generateId(),
    counts: emptyCategoryCounts(),
    startedAt: new Date().toISOString(),
  });
}

export function writeSessionProgress(progress: SessionProgress): boolean {
  return safeWriteSessionStorage(STORAGE_KEYS.milestoneSession, progress);
}

export function clearMilestoneProgress(scopeId: string | null = null): void {
  const key = storageScopeKey(STORAGE_KEYS.milestonesLifetime, scopeId);
  safeRemoveLocalStorage(key);
  if (isSessionStorageAvailable()) {
    try {
      window.sessionStorage.removeItem(STORAGE_KEYS.milestoneSession);
    } catch {
      /* no-op */
    }
  }
}

export function clearGuestMilestoneProgress(): void {
  clearMilestoneProgress(null);
}

export const MILESTONE_BROADCAST_CHANNEL = "offerloop-milestones-v1";

export type MilestoneBroadcastMessage =
  | { type: "milestone_displayed"; milestoneKey: string; scopeId: string | null }
  | { type: "achievement_unlocked"; achievementCode: string; scopeId: string | null }
  | { type: "progress_reset"; scopeId: string | null };

export function broadcastMilestoneEvent(message: MilestoneBroadcastMessage): void {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
  try {
    const channel = new BroadcastChannel(MILESTONE_BROADCAST_CHANNEL);
    channel.postMessage(message);
    channel.close();
  } catch {
    /* other tabs may briefly duplicate; persistence still wins on refresh */
  }
}
