"use client";

import { useMemo } from "react";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getLocalRepositorySet, getSupabaseRepositorySet } from "./index";
import type { RepositorySet } from "./types";

export interface UseRepositoriesResult {
  repositories: RepositorySet;
  userId: string;
  isGuest: boolean;
  isAuthLoading: boolean;
  isSupabaseConfigured: boolean;
}

/**
 * Selects Local* repositories for guests / demo mode, or Supabase* repositories
 * for authenticated users when Supabase is configured. UI code should use this
 * hook rather than importing a concrete repository.
 */
export function useRepositories(): UseRepositoriesResult {
  const { user, loading, isSupabaseConfigured } = useSupabaseUser();

  const repositories = useMemo(() => {
    if (isSupabaseConfigured && user) {
      const client = getSupabaseBrowserClient();
      if (client) return getSupabaseRepositorySet(client);
    }
    return getLocalRepositorySet();
  }, [isSupabaseConfigured, user]);

  return {
    repositories,
    userId: user?.id ?? "guest",
    isGuest: !user,
    isAuthLoading: loading,
    isSupabaseConfigured,
  };
}
