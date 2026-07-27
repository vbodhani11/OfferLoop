import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ProfileInsert } from "@/types/database";
import type { Profile } from "@/types/domain";
import type { ProfileRepository } from "@/lib/repositories/types";
import { mapProfile } from "./mappers";

export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return mapProfile(data);
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const payload: ProfileInsert = { id: userId };
    if (updates.displayName !== undefined) payload.display_name = updates.displayName;
    if (updates.preferredField !== undefined)
      payload.preferred_field = updates.preferredField;
    if (updates.preferredRole !== undefined)
      payload.preferred_role = updates.preferredRole;
    if (updates.experienceLevel !== undefined)
      payload.experience_level = updates.experienceLevel;
    if (updates.preferredWorkArrangement !== undefined)
      payload.preferred_work_arrangement = updates.preferredWorkArrangement;
    if (updates.celebrationIntensity !== undefined)
      payload.celebration_intensity = updates.celebrationIntensity;
    if (updates.confettiEnabled !== undefined)
      payload.confetti_enabled = updates.confettiEnabled;
    if (updates.soundEnabled !== undefined) payload.sound_enabled = updates.soundEnabled;
    if (updates.reducedMotion !== undefined)
      payload.reduced_motion = updates.reducedMotion;
    if (updates.themePreference !== undefined)
      payload.theme_preference = updates.themePreference;

    const { data, error } = await this.client
      .from("profiles")
      .upsert(payload)
      .select("*")
      .single();
    if (error || !data) throw new Error("PROFILE_UPDATE_FAILED");
    return mapProfile(data);
  }
}
