# OfferLoop — Security

## 1. Principles

- Least privilege: the browser only ever holds the Supabase **anon** key; the
  service-role key is never imported into any file under `src/` that ships to the
  client, and is only referenced in server-only scripts (`supabase/` SQL, optional
  admin scripts run locally/CI, never in `NEXT_PUBLIC_*`).
- Defense in depth: RLS in Postgres is the source of truth for authorization, not
  just UI checks.
- Fail safe: repositories never leak raw database errors to the UI; all repository
  errors are caught and mapped to generic, actionable messages.

## 2. Input Validation

All external input (forms, localStorage, URL query params used for filtering) is
parsed with Zod schemas in `src/lib/validation/*` before use. Invalid localStorage
data is discarded rather than trusted.

## 3. Authentication

- Supabase Auth (email + password) via `@supabase/ssr`, with separate browser
  (`createBrowserClient`) and server (`createServerClient` using Next.js cookies)
  clients, plus a middleware client (`src/middleware.ts`) that refreshes the session
  cookie on navigation.
- Server components/route handlers re-check `auth.getUser()` server-side before
  returning private data — the client session is never trusted alone.
- Auth error messages are generic ("Invalid email or password.") — never
  distinguishing "user not found" from "wrong password".
- Password reset uses Supabase's signed recovery link flow; the reset-password page
  requires a valid recovery session before allowing a new password.

## 4. Authorization

- Row Level Security (see `DATABASE.md`) enforces per-user isolation at the database
  layer for `profiles`, `applications`, `offers`, `saved_jobs`, `simulation_actions`.
- Fictional content tables (`organizations`, `jobs`, `fictional_candidates`) are
  public-read, write-restricted to the service role only.

## 5. Web Security Headers

Configured in `next.config.ts` (`headers()`):

- `Content-Security-Policy` (self + Supabase host + necessary font/style sources)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Permissions-Policy` (camera/microphone/geolocation disabled)

## 6. Safe Redirects

No user-controlled `redirect`/`next` query parameter is honored unless it is a
relative, same-origin path matched against an allow-list of known app routes
(`src/lib/security/safeRedirect.ts`), preventing open-redirect abuse from auth flows.

## 7. XSS / HTML

No `dangerouslySetInnerHTML` is used for user-influenced or fictional-seed content;
all copy is rendered as plain React text/props.

## 8. Secrets

- `.env.example` documents all variables with empty values; no real credentials are
  committed.
- `.gitignore` excludes `.env*`.
- The service-role key (if ever used for local seeding scripts) is read only from
  `process.env` in a Node script that is never bundled for the client.

## 9. Rate Limiting & Bot Protection (Guidance)

OfferLoop's Supabase plan should enable Supabase Auth's built-in rate limiting for
sign-up/sign-in. For production, front the app with Vercel's built-in DDoS protection
and consider adding Supabase's CAPTCHA (hCaptcha) integration on the sign-up form if
abuse is observed; this is documented as an optional production hardening step rather
than a hard requirement for the MVP.

## 10. Analytics Privacy

The analytics abstraction (`src/lib/analytics`) is disabled unless
`NEXT_PUBLIC_ANALYTICS_ENABLED=true`, never logs names/emails/candidate identities/
free-form text, and only ever sends the fixed event-name list documented in
`ARCHITECTURE.md`/README.

## 11. Error Messages

Repository and server-action errors are caught centrally and mapped to safe, generic,
actionable copy (see `src/lib/errors.ts`); raw Postgres/Supabase error objects,
stack traces, and SQL are never rendered to end users.
