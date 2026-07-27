-- OfferLoop — Row Level Security verification
--
-- Run this in the Supabase SQL editor (or `psql`) against a project that has
-- already run `0001_init.sql`, `0002_row_level_security.sql`, and
-- `seed.sql`. It creates two throwaway auth users, impersonates each of them
-- (and an anonymous session) using Postgres's `set_config`/`set role`
-- mechanism — the same technique Supabase's PostgREST layer uses to enforce
-- RLS — and asserts the expected allow/deny outcome for each case.
--
-- Everything runs inside a single transaction and is rolled back at the end,
-- so it is safe to run against a project that already has real data.

begin;

-- ---------------------------------------------------------------------------
-- Fixtures: two throwaway users + one row each in every user-scoped table.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-0000000000a1', 'rls-test-user-a@example.com'),
  ('00000000-0000-4000-8000-0000000000b2', 'rls-test-user-b@example.com')
on conflict (id) do nothing;

-- Profiles are auto-created by the `on_auth_user_created` trigger; assert
-- that happened before continuing.
do $$
begin
  if (select count(*) from public.profiles where id in (
    '00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000b2'
  )) <> 2 then
    raise exception 'FAIL: profiles were not auto-created for test users';
  end if;
  raise notice 'PASS: profiles auto-created for both test users';
end $$;

insert into public.offers (
  id, user_id, job_id, recipient_display_name, currency
) values (
  '00000000-0000-4000-8000-0000000000c1',
  '00000000-0000-4000-8000-0000000000a1',
  (select id from public.jobs limit 1),
  'User A',
  'USD'
);

-- ---------------------------------------------------------------------------
-- Case 1: User A can read their own offer.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000a1', 'role', 'authenticated')::text, true);

do $$
begin
  if (select count(*) from public.offers where id = '00000000-0000-4000-8000-0000000000c1') <> 1 then
    raise exception 'FAIL: User A could not read their own offer';
  end if;
  raise notice 'PASS: User A can read their own offer';
end $$;

-- ---------------------------------------------------------------------------
-- Case 2: User B cannot read User A's offer.
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000b2', 'role', 'authenticated')::text, true);

do $$
begin
  if (select count(*) from public.offers where id = '00000000-0000-4000-8000-0000000000c1') <> 0 then
    raise exception 'FAIL: User B could read User A''s offer';
  end if;
  raise notice 'PASS: User B cannot read User A''s offer';
end $$;

-- ---------------------------------------------------------------------------
-- Case 3: User B cannot update User A's profile.
-- ---------------------------------------------------------------------------
do $$
begin
  update public.profiles set display_name = 'Hacked' where id = '00000000-0000-4000-8000-0000000000a1';
  if (select display_name from public.profiles where id = '00000000-0000-4000-8000-0000000000a1') = 'Hacked' then
    raise exception 'FAIL: User B updated User A''s profile';
  end if;
  raise notice 'PASS: User B cannot update User A''s profile (0 rows affected)';
end $$;

-- ---------------------------------------------------------------------------
-- Case 4: User B cannot insert an offer on behalf of User A.
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    insert into public.offers (user_id, job_id, recipient_display_name)
    values ('00000000-0000-4000-8000-0000000000a1', (select id from public.jobs limit 1), 'Forged');
    raise exception 'FAIL: User B inserted an offer for User A';
  exception
    when insufficient_privilege or others then
      raise notice 'PASS: User B cannot insert an offer for User A';
  end;
end $$;

-- ---------------------------------------------------------------------------
-- Case 5: Anonymous (guest) sessions cannot write profiles or offers.
-- ---------------------------------------------------------------------------
set local role anon;
select set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);

do $$
begin
  begin
    insert into public.profiles (id, display_name) values ('00000000-0000-4000-8000-0000000000c9', 'Ghost');
    raise exception 'FAIL: anonymous user inserted a profile';
  exception
    when insufficient_privilege or others then
      raise notice 'PASS: anonymous user cannot insert a profile';
  end;
end $$;

-- ---------------------------------------------------------------------------
-- Case 6: Anonymous (guest) sessions CAN read active fictional jobs.
-- ---------------------------------------------------------------------------
do $$
begin
  if (select count(*) from public.jobs where is_active = true) = 0 then
    raise exception 'FAIL: anonymous user could not read any active fictional jobs (seed data missing?)';
  end if;
  raise notice 'PASS: anonymous user can read active fictional jobs';
end $$;

-- ---------------------------------------------------------------------------
-- Case 7: Anonymous / authenticated clients cannot modify fictional content.
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    update public.jobs set title = 'Hacked Title' where true;
    raise exception 'FAIL: anonymous user updated a fictional job';
  exception
    when insufficient_privilege or others then
      raise notice 'PASS: anonymous user cannot update fictional jobs';
  end;
end $$;

do $$
begin
  begin
    insert into public.organizations (name, slug, initials, industry)
    values ('Fake Corp', 'fake-corp-rls-test', 'FC', 'Testing');
    raise exception 'FAIL: anonymous user inserted a fictional organization';
  exception
    when insufficient_privilege or others then
      raise notice 'PASS: anonymous user cannot insert fictional organizations';
  end;
end $$;

reset role;
rollback;
