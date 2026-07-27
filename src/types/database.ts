/**
 * Hand-written row types mirroring `supabase/migrations/0001_init.sql`.
 * Field names are snake_case to match Postgres columns exactly.
 *
 * IMPORTANT: These must be declared with `type`, not `interface`.
 * `@supabase/postgrest-js` resolves `Insert`/`Update`/`Row` through deeply
 * nested conditional and mapped types (e.g. `RejectExcessProperties`). When
 * those shapes are `interface` declarations instead of `type` aliases, the
 * conditional type resolution silently collapses to `never`, which makes
 * every `.insert()`/`.update()` call fail with a confusing
 * "does not exist in type 'never[]'" error. This is a known TypeScript
 * limitation that Supabase's own generated types avoid by always using
 * `type`. Keep every exported shape below (including `Database` itself) as
 * a `type` alias.
 */

export type ProfileRow = {
  id: string;
  display_name: string;
  preferred_field: string | null;
  preferred_role: string | null;
  experience_level: string | null;
  preferred_work_arrangement: string | null;
  celebration_intensity: string;
  confetti_enabled: boolean;
  sound_enabled: boolean;
  reduced_motion: boolean;
  theme_preference: string;
  created_at: string;
  updated_at: string;
};

export type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  initials: string;
  industry: string;
  short_description: string | null;
  logo_style: Record<string, unknown> | null;
  is_fictional: boolean;
  is_active: boolean;
  created_at: string;
};

export type JobRow = {
  id: string;
  organization_id: string;
  slug: string;
  title: string;
  description: string;
  responsibilities: string[] | null;
  qualifications: string[] | null;
  benefits: string[] | null;
  location: string | null;
  work_arrangement: string | null;
  employment_type: string | null;
  experience_level: string | null;
  salary_min: number | null;
  salary_max: number | null;
  signing_bonus: number | null;
  currency: string;
  category: string | null;
  skills: string[];
  fictional_manager_name: string | null;
  simulated_posted_days_ago: number | null;
  is_active: boolean;
  created_at: string;
};

export type FictionalCandidateRow = {
  id: string;
  slug: string;
  display_name: string;
  initials: string;
  headline: string;
  summary: string | null;
  location: string | null;
  years_experience: number | null;
  skills: string[];
  education: string | null;
  recent_role: string | null;
  work_history: unknown;
  projects: unknown;
  achievements: string[] | null;
  preferred_work_arrangement: string | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  availability: string | null;
  avatar_style: Record<string, unknown> | null;
  is_fictional: boolean;
  is_active: boolean;
  created_at: string;
};

export type ApplicationRow = {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OfferRow = {
  id: string;
  user_id: string;
  job_id: string;
  application_id: string | null;
  recipient_display_name: string;
  fictional_start_date: string | null;
  fictional_manager_name: string | null;
  salary_min: number | null;
  salary_max: number | null;
  signing_bonus: number | null;
  currency: string;
  work_arrangement: string | null;
  offer_message: string | null;
  simulation_version: string | null;
  created_at: string;
};

export type SavedJobRow = {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
};

export type SimulationActionRow = {
  id: string;
  user_id: string | null;
  anonymous_session_id: string | null;
  action_type: string;
  job_id: string | null;
  candidate_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type ProfileInsert = {
  id: string;
  display_name?: string;
  preferred_field?: string | null;
  preferred_role?: string | null;
  experience_level?: string | null;
  preferred_work_arrangement?: string | null;
  celebration_intensity?: string;
  confetti_enabled?: boolean;
  sound_enabled?: boolean;
  reduced_motion?: boolean;
  theme_preference?: string;
};

export type OrganizationInsert = {
  name: string;
  slug: string;
  initials: string;
  industry: string;
  short_description?: string | null;
  logo_style?: Record<string, unknown> | null;
  is_active?: boolean;
};

export type JobInsert = {
  organization_id: string;
  slug: string;
  title: string;
  description: string;
  responsibilities?: string[] | null;
  qualifications?: string[] | null;
  benefits?: string[] | null;
  location?: string | null;
  work_arrangement?: string | null;
  employment_type?: string | null;
  experience_level?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  signing_bonus?: number | null;
  currency?: string;
  category?: string | null;
  skills?: string[];
  fictional_manager_name?: string | null;
  simulated_posted_days_ago?: number | null;
  is_active?: boolean;
};

export type FictionalCandidateInsert = {
  slug: string;
  display_name: string;
  initials: string;
  headline: string;
  summary?: string | null;
  location?: string | null;
  years_experience?: number | null;
  skills?: string[];
  education?: string | null;
  recent_role?: string | null;
  work_history?: unknown;
  projects?: unknown;
  achievements?: string[] | null;
  preferred_work_arrangement?: string | null;
  expected_salary_min?: number | null;
  expected_salary_max?: number | null;
  availability?: string | null;
  avatar_style?: Record<string, unknown> | null;
  is_active?: boolean;
};

export type ApplicationInsert = {
  user_id: string;
  job_id: string;
  status: string;
  accepted_at?: string | null;
};

export type OfferInsert = {
  user_id: string;
  job_id: string;
  application_id?: string | null;
  recipient_display_name: string;
  fictional_start_date?: string | null;
  fictional_manager_name?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  signing_bonus?: number | null;
  currency?: string;
  work_arrangement?: string | null;
  offer_message?: string | null;
  simulation_version?: string | null;
};

export type SavedJobInsert = {
  user_id: string;
  job_id: string;
};

export type SimulationActionInsert = {
  user_id?: string | null;
  anonymous_session_id?: string | null;
  action_type: string;
  job_id?: string | null;
  candidate_id?: string | null;
  metadata?: Record<string, unknown>;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: Partial<ProfileInsert>;
        Relationships: [];
      };
      organizations: {
        Row: OrganizationRow;
        Insert: OrganizationInsert;
        Update: Partial<OrganizationInsert>;
        Relationships: [];
      };
      jobs: {
        Row: JobRow;
        Insert: JobInsert;
        Update: Partial<JobInsert>;
        Relationships: [];
      };
      fictional_candidates: {
        Row: FictionalCandidateRow;
        Insert: FictionalCandidateInsert;
        Update: Partial<FictionalCandidateInsert>;
        Relationships: [];
      };
      applications: {
        Row: ApplicationRow;
        Insert: ApplicationInsert;
        Update: Partial<ApplicationInsert>;
        Relationships: [];
      };
      offers: {
        Row: OfferRow;
        Insert: OfferInsert;
        Update: Partial<OfferInsert>;
        Relationships: [];
      };
      saved_jobs: {
        Row: SavedJobRow;
        Insert: SavedJobInsert;
        Update: Partial<SavedJobInsert>;
        Relationships: [];
      };
      simulation_actions: {
        Row: SimulationActionRow;
        Insert: SimulationActionInsert;
        Update: Partial<SimulationActionInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
