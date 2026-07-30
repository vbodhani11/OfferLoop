-- OfferLoop — User achievements & milestone display history
-- Optional persistence for authenticated users so celebrations do not replay
-- across devices. Counts are still derived/maintained client-side from
-- successful actions; these tables store unlock + display idempotency only.
--
-- Manual step: apply with `supabase db push` or run this SQL in the Supabase
-- SQL editor for your project.

-- ---------------------------------------------------------------------------
-- user_achievements
-- ---------------------------------------------------------------------------
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_code text not null,
  unlocked_at timestamptz not null default now(),
  progress_at_unlock integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint user_achievements_user_code_unique unique (user_id, achievement_code),
  constraint user_achievements_code_allowed check (
    achievement_code in (
      'first_application',
      'application_sprint',
      'application_machine',
      'application_veteran',
      'application_legend',
      'first_rejection',
      'rejection_sprint',
      'the_decider',
      'imaginary_recruiter',
      'virtual_hr_director',
      'shortlist_scout',
      'offer_collector',
      'offer_architect',
      'inbox_zeroish',
      'offerloop_regular'
    )
  )
);

create index if not exists user_achievements_user_id_idx
  on public.user_achievements (user_id);

alter table public.user_achievements enable row level security;

create policy "user_achievements_select_own"
  on public.user_achievements for select
  using (auth.uid() = user_id);

create policy "user_achievements_insert_own"
  on public.user_achievements for insert
  with check (auth.uid() = user_id);

create policy "user_achievements_update_own"
  on public.user_achievements for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_achievements_delete_own"
  on public.user_achievements for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- user_milestone_events
-- ---------------------------------------------------------------------------
create table if not exists public.user_milestone_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  milestone_key text not null,
  displayed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint user_milestone_events_user_key_unique unique (user_id, milestone_key)
);

create index if not exists user_milestone_events_user_id_idx
  on public.user_milestone_events (user_id);

alter table public.user_milestone_events enable row level security;

create policy "user_milestone_events_select_own"
  on public.user_milestone_events for select
  using (auth.uid() = user_id);

create policy "user_milestone_events_insert_own"
  on public.user_milestone_events for insert
  with check (auth.uid() = user_id);

create policy "user_milestone_events_delete_own"
  on public.user_milestone_events for delete
  using (auth.uid() = user_id);
