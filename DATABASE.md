# OfferLoop — Database

## 1. Overview

Supabase Postgres schema lives in `supabase/migrations/*.sql`, applied in order. Seed
data lives in `supabase/seed.sql`, generated from the same canonical TypeScript source
(`src/data/*.ts`) used by demo mode, via `npm run db:generate-seed`.

## 2. Tables

See migration `0001_init.sql` for full DDL. Summary:

- `profiles` — 1:1 with `auth.users`, stores display name + preferences (celebration
  intensity, confetti, sound, reduced motion, theme).
- `organizations` — fictional companies (`is_fictional` always `true`).
- `jobs` — fictional job postings, FK to `organizations`.
- `fictional_candidates` — fictional candidate profiles for Reject Mode.
- `applications` — one row per user+job "application" (`accepted` | `saved`), unique
  on `(user_id, job_id)`.
- `offers` — one simulated offer per user+job, unique on `(user_id, job_id)`.
- `saved_jobs` — bookmark table, unique on `(user_id, job_id)`.
- `simulation_actions` — append-only analytics/event log for both modes; supports
  anonymous (`anonymous_session_id`) and authenticated (`user_id`) rows.

All tables use `uuid` primary keys (`gen_random_uuid()`, pgcrypto/pgcrypto-free via
`gen_random_uuid()` available by default on Supabase). `updated_at` columns are kept
current via a shared `set_updated_at()` trigger function on `profiles`, `applications`.

## 3. Constraints

- `applications.status` — `CHECK (status IN ('accepted','saved'))`.
- `simulation_actions.action_type` — `CHECK` against the full allowed list (see
  migration for exact set: `job_viewed`, `job_skipped`, `job_saved`, `job_applied`,
  `offer_created`, `offer_celebrated`, `candidate_viewed`, `candidate_rejected`,
  `candidate_shortlisted`, `candidate_offered`, `action_undone`, `deck_reset`,
  `guest_data_migrated`).
- Unique constraints: `applications(user_id, job_id)`, `offers(user_id, job_id)`,
  `saved_jobs(user_id, job_id)`, `organizations.slug`, `jobs.slug`,
  `fictional_candidates.slug`.

## 4. Indexes

Created on: `jobs.is_active`, `jobs.category`, `jobs.experience_level`,
`jobs.work_arrangement`, `organizations.slug`, `jobs.slug`,
`fictional_candidates.slug`, `applications.user_id`, `offers.user_id`,
`saved_jobs.user_id`, `simulation_actions.user_id`, `simulation_actions.candidate_id`,
and `created_at` on high-write tables (`offers`, `simulation_actions`).

## 5. Row Level Security

RLS is enabled on every user-scoped table. Policies (full SQL in
`0002_row_level_security.sql`):

- **profiles:** `select/insert/update/delete` restricted to `auth.uid() = id`.
- **applications / offers / saved_jobs:** `select/insert/update/delete` restricted to
  `auth.uid() = user_id`; insert policies additionally check
  `auth.uid() = user_id` so a user cannot write rows on behalf of another id.
- **simulation_actions:** authenticated users may `insert`/`select` only rows where
  `user_id = auth.uid()` OR the row is anonymous and being inserted by the same
  request (anonymous rows are write-only from the client through a restricted policy
  that never allows `user_id` to be set to another user).
- **organizations / jobs / fictional_candidates:** public (including anonymous) `select`
  where `is_active = true`; **no** insert/update/delete policy is granted to the
  `anon`/`authenticated` roles, so only the service role (server-side seed scripts) can
  write fictional content.

`supabase/tests/rls_verification.sql` contains explicit checks (run via `psql` or the
Supabase SQL editor with two test JWTs) proving: User A cannot read/update User B's
`offers`/`profiles`; anonymous users cannot write `profiles`/`offers`; anonymous/
authenticated users can `select` active fictional jobs; anonymous/authenticated users
cannot `insert`/`update`/`delete` `jobs`/`organizations`/`fictional_candidates`.

## 6. Local Storage (Demo / Guest Mode)

When Supabase is not configured, or for guest users, state is kept in versioned
localStorage keys, validated with Zod on every read (`src/lib/storage/*`):

| Key                             | Shape                                           |
| ------------------------------- | ----------------------------------------------- |
| `offerloop_guest_profile_v1`    | display name + preferences                      |
| `offerloop_guest_offers_v1`     | array of guest `Offer` records                  |
| `offerloop_guest_saved_jobs_v1` | array of saved job ids + timestamps             |
| `offerloop_guest_actions_v1`    | capped ring buffer of recent simulation actions |
| `offerloop_guest_settings_v1`   | theme/motion/sound preferences                  |

Reads use `safeParseLocalStorage(key, schema)` which never throws: invalid or missing
data returns a typed default and clears the corrupt key.

## 7. Migration Path (Guest → Account)

`src/features/guest-migration/migrateGuestData.ts` validates each local record, checks
for existing Supabase rows by natural key (`job_id` for offers/saved jobs), inserts
only new/valid rows, and only clears the corresponding localStorage key once all
inserts for that collection succeed. The function is idempotent: re-running it after a
partial failure will not create duplicates and will retry only the remaining items.
