import { describe, expect, it } from "vitest";
import { getLocalRepositorySet } from "../index";
import { LocalOffersRepository } from "../local/offers";
import { LocalJobsRepository } from "../local/jobs";
import { isSupabaseConfigured } from "@/lib/supabase/config";

describe("getLocalRepositorySet", () => {
  it("returns a fully populated repository set backed by local implementations", () => {
    const set = getLocalRepositorySet();
    expect(set.jobs).toBeInstanceOf(LocalJobsRepository);
    expect(set.offers).toBeInstanceOf(LocalOffersRepository);
    expect(set.candidates).toBeDefined();
    expect(set.applications).toBeDefined();
    expect(set.savedJobs).toBeDefined();
    expect(set.profile).toBeDefined();
    expect(set.actions).toBeDefined();
  });

  it("memoizes the local repository set so repeated calls share the same instance", () => {
    const first = getLocalRepositorySet();
    const second = getLocalRepositorySet();
    expect(first).toBe(second);
  });
});

describe("isSupabaseConfigured", () => {
  it("reports unconfigured when the Supabase env vars are unset (demo mode default)", () => {
    const original = { ...process.env };
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(isSupabaseConfigured()).toBe(false);
    process.env = original;
  });

  it("reports configured once both Supabase env vars are present", () => {
    const original = { ...process.env };
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    expect(isSupabaseConfigured()).toBe(true);
    process.env = original;
  });
});
