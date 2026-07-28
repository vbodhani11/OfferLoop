import { STORAGE_KEYS } from "@/lib/constants/storageKeys";
import {
  guestActionsSchema,
  guestApplicationsSchema,
  guestOffersSchema,
  guestProfileSchema,
  guestSavedJobsSchema,
  guestSettingsSchema,
  type GuestAction,
  type GuestApplication,
  type GuestOffer,
  type GuestProfile,
  type GuestSavedJob,
  type GuestSettings,
} from "@/lib/validation/guest";
import { safeReadLocalStorage, safeWriteLocalStorage } from "./safeLocalStorage";

const MAX_STORED_ACTIONS = 200;

export function readGuestOffers(): GuestOffer[] {
  return safeReadLocalStorage(STORAGE_KEYS.guestOffers, guestOffersSchema, []);
}
export function writeGuestOffers(offers: GuestOffer[]): boolean {
  return safeWriteLocalStorage(STORAGE_KEYS.guestOffers, offers);
}

export function readGuestSavedJobs(): GuestSavedJob[] {
  return safeReadLocalStorage(STORAGE_KEYS.guestSavedJobs, guestSavedJobsSchema, []);
}
export function writeGuestSavedJobs(jobs: GuestSavedJob[]): boolean {
  return safeWriteLocalStorage(STORAGE_KEYS.guestSavedJobs, jobs);
}

export function readGuestApplications(): GuestApplication[] {
  return safeReadLocalStorage(
    STORAGE_KEYS.guestApplications,
    guestApplicationsSchema,
    [],
  );
}
export function writeGuestApplications(applications: GuestApplication[]): boolean {
  return safeWriteLocalStorage(STORAGE_KEYS.guestApplications, applications);
}

export function readGuestActions(): GuestAction[] {
  return safeReadLocalStorage(STORAGE_KEYS.guestActions, guestActionsSchema, []);
}
export function appendGuestAction(action: GuestAction): void {
  const current = readGuestActions();
  const next = [...current, action].slice(-MAX_STORED_ACTIONS);
  safeWriteLocalStorage(STORAGE_KEYS.guestActions, next);
}

const DEFAULT_GUEST_PROFILE: GuestProfile = {
  displayName: "Future You",
  preferredField: null,
  preferredRole: null,
  experienceLevel: null,
  preferredWorkArrangement: null,
};

export function readGuestProfile(): GuestProfile {
  return safeReadLocalStorage(
    STORAGE_KEYS.guestProfile,
    guestProfileSchema,
    DEFAULT_GUEST_PROFILE,
  );
}
export function writeGuestProfile(profile: GuestProfile): boolean {
  return safeWriteLocalStorage(STORAGE_KEYS.guestProfile, profile);
}

const DEFAULT_GUEST_SETTINGS: GuestSettings = {
  celebrationIntensity: "standard",
  confettiEnabled: true,
  soundEnabled: false,
  reducedMotion: false,
  themePreference: "system",
  quickRejectionEnabled: false,
  defaultRejectionReason: "skills_mismatch",
};

export function readGuestSettings(): GuestSettings {
  return safeReadLocalStorage(
    STORAGE_KEYS.guestSettings,
    guestSettingsSchema,
    DEFAULT_GUEST_SETTINGS,
  );
}
export function writeGuestSettings(settings: GuestSettings): boolean {
  return safeWriteLocalStorage(STORAGE_KEYS.guestSettings, settings);
}

export function clearAllGuestData(): void {
  writeGuestOffers([]);
  writeGuestSavedJobs([]);
  writeGuestApplications([]);
  safeWriteLocalStorage(STORAGE_KEYS.guestActions, []);
}
