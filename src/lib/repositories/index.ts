import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { RepositorySet } from "./types";
import {
  LocalActionsRepository,
  LocalApplicationsRepository,
  LocalCandidatesRepository,
  LocalJobsRepository,
  LocalOffersRepository,
  LocalProfileRepository,
  LocalSavedJobsRepository,
} from "./local";
import {
  SupabaseActionsRepository,
  SupabaseApplicationsRepository,
  SupabaseCandidatesRepository,
  SupabaseJobsRepository,
  SupabaseOffersRepository,
  SupabaseProfileRepository,
  SupabaseSavedJobsRepository,
} from "./supabase";

let localSet: RepositorySet | null = null;

export function getLocalRepositorySet(): RepositorySet {
  if (localSet) return localSet;
  localSet = {
    jobs: new LocalJobsRepository(),
    candidates: new LocalCandidatesRepository(),
    applications: new LocalApplicationsRepository(),
    offers: new LocalOffersRepository(),
    savedJobs: new LocalSavedJobsRepository(),
    profile: new LocalProfileRepository(),
    actions: new LocalActionsRepository(),
  };
  return localSet;
}

export function getSupabaseRepositorySet(
  client: SupabaseClient<Database>,
): RepositorySet {
  return {
    jobs: new SupabaseJobsRepository(client),
    candidates: new SupabaseCandidatesRepository(client),
    applications: new SupabaseApplicationsRepository(client),
    offers: new SupabaseOffersRepository(client),
    savedJobs: new SupabaseSavedJobsRepository(client),
    profile: new SupabaseProfileRepository(client),
    actions: new SupabaseActionsRepository(client),
  };
}

export type { RepositorySet } from "./types";
