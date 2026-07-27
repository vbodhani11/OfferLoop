import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./config";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Returns a memoized Supabase browser client, or `null` when Supabase is not
 * configured (Local Demo Mode). Callers must check for `null`.
 */
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  if (browserClient) return browserClient;
  browserClient = createBrowserClient<Database>(getSupabaseUrl()!, getSupabaseAnonKey()!);
  return browserClient;
}
