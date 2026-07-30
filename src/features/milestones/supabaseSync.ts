import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { UnlockedAchievement } from "./types";

/**
 * Best-effort sync of unlocked achievements + displayed milestone keys to
 * Supabase. Never throws to callers — milestone persistence must not break
 * core actions. Requires migration 0003_user_milestones.sql.
 */
export async function syncMilestonesToSupabase(
  client: SupabaseClient<Database>,
  userId: string,
  achievements: UnlockedAchievement[],
  displayedKeys: string[],
): Promise<void> {
  try {
    if (achievements.length > 0) {
      const rows = achievements.map((a) => ({
        user_id: userId,
        achievement_code: a.achievementCode,
        unlocked_at: a.unlockedAt,
        progress_at_unlock: a.progressAtUnlock,
        metadata: { category: a.category, version: a.version },
      }));
      const { error } = await client
        .from("user_achievements")
        .upsert(rows, { onConflict: "user_id,achievement_code", ignoreDuplicates: true });
      if (error && process.env.NODE_ENV !== "production") {
        console.warn("[milestones] user_achievements upsert failed", error.message);
      }
    }

    if (displayedKeys.length > 0) {
      const rows = displayedKeys.map((milestone_key) => ({
        user_id: userId,
        milestone_key,
        displayed_at: new Date().toISOString(),
        metadata: { version: 1 },
      }));
      const { error } = await client
        .from("user_milestone_events")
        .upsert(rows, { onConflict: "user_id,milestone_key", ignoreDuplicates: true });
      if (error && process.env.NODE_ENV !== "production") {
        console.warn("[milestones] user_milestone_events upsert failed", error.message);
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[milestones] syncMilestonesToSupabase failed", error);
    }
  }
}
