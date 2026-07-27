-- OfferLoop — Row Level Security
-- Enables RLS on every table and defines the minimal policy set described in
-- SECURITY.md / DATABASE.md. Public fictional content is readable by anyone
-- (including anonymous/guest sessions) but writable only by the service role
-- (used by seed scripts) — never by `anon` or `authenticated` clients.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- applications
-- ---------------------------------------------------------------------------
alter table public.applications enable row level security;

create policy "applications_select_own"
  on public.applications for select
  using (auth.uid() = user_id);

create policy "applications_insert_own"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "applications_update_own"
  on public.applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "applications_delete_own"
  on public.applications for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- offers
-- ---------------------------------------------------------------------------
alter table public.offers enable row level security;

create policy "offers_select_own"
  on public.offers for select
  using (auth.uid() = user_id);

create policy "offers_insert_own"
  on public.offers for insert
  with check (auth.uid() = user_id);

create policy "offers_update_own"
  on public.offers for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "offers_delete_own"
  on public.offers for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- saved_jobs
-- ---------------------------------------------------------------------------
alter table public.saved_jobs enable row level security;

create policy "saved_jobs_select_own"
  on public.saved_jobs for select
  using (auth.uid() = user_id);

create policy "saved_jobs_insert_own"
  on public.saved_jobs for insert
  with check (auth.uid() = user_id);

create policy "saved_jobs_update_own"
  on public.saved_jobs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "saved_jobs_delete_own"
  on public.saved_jobs for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- simulation_actions — authenticated users may only read/write their own
-- rows; anonymous (guest) rows are never readable or writable through the
-- public API (guest actions stay local until migration, at which point they
-- are re-recorded under the authenticated user's id).
-- ---------------------------------------------------------------------------
alter table public.simulation_actions enable row level security;

create policy "simulation_actions_select_own"
  on public.simulation_actions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "simulation_actions_insert_own"
  on public.simulation_actions for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- organizations / jobs / fictional_candidates — public fictional content.
-- Readable by anyone (anon + authenticated) when active; writable only by
-- the service role (no policy grants insert/update/delete to anon or
-- authenticated, so RLS denies those by default once enabled).
-- ---------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.jobs enable row level security;
alter table public.fictional_candidates enable row level security;

create policy "organizations_select_active"
  on public.organizations for select
  using (is_active = true);

create policy "jobs_select_active"
  on public.jobs for select
  using (is_active = true);

create policy "fictional_candidates_select_active"
  on public.fictional_candidates for select
  using (is_active = true);
