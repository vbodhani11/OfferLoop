import type { Profile } from "@/types/domain";
import type { ProfileRepository } from "@/lib/repositories/types";
import {
  readGuestProfile,
  readGuestSettings,
  writeGuestProfile,
  writeGuestSettings,
} from "@/lib/storage/guestStore";

function toProfile(): Profile {
  const guestProfile = readGuestProfile();
  const settings = readGuestSettings();
  const now = new Date().toISOString();
  return {
    id: "guest",
    displayName: guestProfile.displayName,
    preferredField: guestProfile.preferredField,
    preferredRole: guestProfile.preferredRole,
    experienceLevel: guestProfile.experienceLevel,
    preferredWorkArrangement: guestProfile.preferredWorkArrangement,
    celebrationIntensity: settings.celebrationIntensity,
    confettiEnabled: settings.confettiEnabled,
    soundEnabled: settings.soundEnabled,
    reducedMotion: settings.reducedMotion,
    themePreference: settings.themePreference,
    createdAt: now,
    updatedAt: now,
  };
}

export class LocalProfileRepository implements ProfileRepository {
  async getProfile(_userId: string): Promise<Profile | null> {
    return toProfile();
  }

  async updateProfile(_userId: string, updates: Partial<Profile>): Promise<Profile> {
    const currentProfile = readGuestProfile();
    const currentSettings = readGuestSettings();

    writeGuestProfile({
      ...currentProfile,
      ...(updates.displayName !== undefined ? { displayName: updates.displayName } : {}),
      ...(updates.preferredField !== undefined
        ? { preferredField: updates.preferredField }
        : {}),
      ...(updates.preferredRole !== undefined
        ? { preferredRole: updates.preferredRole }
        : {}),
      ...(updates.experienceLevel !== undefined
        ? { experienceLevel: updates.experienceLevel }
        : {}),
      ...(updates.preferredWorkArrangement !== undefined
        ? { preferredWorkArrangement: updates.preferredWorkArrangement }
        : {}),
    });

    writeGuestSettings({
      ...currentSettings,
      ...(updates.celebrationIntensity !== undefined
        ? { celebrationIntensity: updates.celebrationIntensity }
        : {}),
      ...(updates.confettiEnabled !== undefined
        ? { confettiEnabled: updates.confettiEnabled }
        : {}),
      ...(updates.soundEnabled !== undefined
        ? { soundEnabled: updates.soundEnabled }
        : {}),
      ...(updates.reducedMotion !== undefined
        ? { reducedMotion: updates.reducedMotion }
        : {}),
      ...(updates.themePreference !== undefined
        ? { themePreference: updates.themePreference }
        : {}),
    });

    return toProfile();
  }
}
