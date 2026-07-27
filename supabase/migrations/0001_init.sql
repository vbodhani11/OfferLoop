-- OfferLoop — initial schema
-- All content in this schema is fictional (see `is_fictional` columns). This
-- migration creates every table, constraint, index, and trigger needed for
-- OfferLoop's Accept Mode and Reject Mode simulations.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Shared trigger: keep `updated_at` current on row updates
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles — 1:1 with auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Future You',
  preferred_field text,
  preferred_role text,
  experience_level text check (
    experience_level is null
    or experience_level in ('entry', 'associate', 'mid', 'senior', 'lead', 'manager')
  ),
  preferred_work_arrangement text check (
    preferred_work_arrangement is null or preferred_work_arrangement in ('remote', 'hybrid', 'onsite')
  ),
  celebration_intensity text not null default 'standard' check (
    celebration_intensity in ('minimal', 'standard', 'maximum')
  ),
  confetti_enabled boolean not null default true,
  sound_enabled boolean not null default false,
  reduced_motion boolean not null default false,
  theme_preference text not null default 'system' check (theme_preference in ('system', 'light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user is created, so that
-- FK-dependent inserts (applications/offers/saved_jobs -> profiles) always
-- have a profile to reference, even before the user visits /profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Future You'))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- organizations — fictional companies only
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  initials text not null,
  industry text not null,
  short_description text,
  logo_style jsonb,
  is_fictional boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index organizations_slug_idx on public.organizations (slug);

-- ---------------------------------------------------------------------------
-- jobs — fictional job postings
-- ---------------------------------------------------------------------------
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text not null,
  responsibilities text[],
  qualifications text[],
  benefits text[],
  location text,
  work_arrangement text check (work_arrangement is null or work_arrangement in ('remote', 'hybrid', 'onsite')),
  employment_type text check (
    employment_type is null or employment_type in ('full_time', 'contract', 'internship')
  ),
  experience_level text check (
    experience_level is null
    or experience_level in ('entry', 'associate', 'mid', 'senior', 'lead', 'manager')
  ),
  salary_min integer,
  salary_max integer,
  signing_bonus integer,
  currency text not null default 'USD',
  category text,
  skills text[] not null default '{}',
  fictional_manager_name text,
  simulated_posted_days_ago integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index jobs_is_active_idx on public.jobs (is_active);
create index jobs_category_idx on public.jobs (category);
create index jobs_experience_level_idx on public.jobs (experience_level);
create index jobs_work_arrangement_idx on public.jobs (work_arrangement);
create index jobs_slug_idx on public.jobs (slug);
create index jobs_organization_id_idx on public.jobs (organization_id);

-- ---------------------------------------------------------------------------
-- fictional_candidates — fictional recruiter-mode profiles
-- ---------------------------------------------------------------------------
create table public.fictional_candidates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  initials text not null,
  headline text not null,
  summary text,
  location text,
  years_experience integer,
  skills text[] not null default '{}',
  education text,
  recent_role text,
  work_history jsonb,
  projects jsonb,
  achievements text[],
  preferred_work_arrangement text check (
    preferred_work_arrangement is null or preferred_work_arrangement in ('remote', 'hybrid', 'onsite')
  ),
  expected_salary_min integer,
  expected_salary_max integer,
  availability text,
  avatar_style jsonb,
  is_fictional boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index fictional_candidates_slug_idx on public.fictional_candidates (slug);

-- ---------------------------------------------------------------------------
-- applications — fictional "application" records
-- ---------------------------------------------------------------------------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  status text not null check (status in ('accepted', 'saved')),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index applications_user_id_idx on public.applications (user_id);

create trigger applications_set_updated_at
  before update on public.applications
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- offers — simulated offers, no legal or financial value
-- ---------------------------------------------------------------------------
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  application_id uuid references public.applications (id) on delete set null,
  recipient_display_name text not null,
  fictional_start_date date,
  fictional_manager_name text,
  salary_min integer,
  salary_max integer,
  signing_bonus integer,
  currency text not null default 'USD',
  work_arrangement text check (work_arrangement is null or work_arrangement in ('remote', 'hybrid', 'onsite')),
  offer_message text,
  simulation_version text,
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index offers_user_id_idx on public.offers (user_id);
create index offers_created_at_idx on public.offers (created_at);

-- ---------------------------------------------------------------------------
-- saved_jobs — bookmarks
-- ---------------------------------------------------------------------------
create table public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index saved_jobs_user_id_idx on public.saved_jobs (user_id);

-- ---------------------------------------------------------------------------
-- simulation_actions — append-only event log (auth + anonymous)
-- ---------------------------------------------------------------------------
create table public.simulation_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  anonymous_session_id text,
  action_type text not null check (
    action_type in (
      'job_viewed',
      'job_skipped',
      'job_saved',
      'job_applied',
      'offer_created',
      'offer_celebrated',
      'candidate_viewed',
      'candidate_rejected',
      'candidate_shortlisted',
      'candidate_offered',
      'action_undone',
      'deck_reset',
      'guest_data_migrated'
    )
  ),
  job_id uuid references public.jobs (id) on delete set null,
  candidate_id uuid references public.fictional_candidates (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index simulation_actions_user_id_idx on public.simulation_actions (user_id);
create index simulation_actions_candidate_id_idx on public.simulation_actions (candidate_id);
create index simulation_actions_created_at_idx on public.simulation_actions (created_at);
