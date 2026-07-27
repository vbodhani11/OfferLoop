# OfferLoop — Deployment Guide

OfferLoop targets **Vercel** as the primary deployment platform, with optional notes
for Netlify. The app builds and runs with zero configuration in Local Demo Mode; the
steps below add optional Supabase-backed persistence and authentication.

## 1. Prerequisites

- A GitHub repository containing this project.
- A Vercel account (free tier is sufficient for the MVP).
- (Optional, for accounts/persistence) A Supabase account and project.

## 2. Local Demo Mode (No Supabase Required)

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Guests can use both modes fully; data is stored in
`localStorage`.

## 3. Supabase Setup (Optional but Recommended)

1. Create a Supabase project at `supabase.com`.
2. In the Supabase SQL editor (or via the CLI), run migrations in order from
   `supabase/migrations/` (`0001_init.sql`, `0002_row_level_security.sql`).
3. Run `supabase/seed.sql` to load the 18 organizations / 36 jobs / 40 candidates.
4. Copy the **Project URL** (Settings → API).
5. Copy the **anon public key** (Settings → API). Never copy the service-role key
   into the app.
6. Create `.env.local` from `.env.example` and fill in:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_ANALYTICS_ENABLED=false
   ```
7. Add the same variables in Vercel → Project → Settings → Environment Variables
   (use your production `NEXT_PUBLIC_APP_URL`).
8. In Supabase → Authentication → URL Configuration, set **Site URL** to your
   production URL.
9. Add **Redirect URLs**: `https://your-domain/**` and
   `http://localhost:3000/**` (for local development).
10. Deploy (see below).
11. Verify authentication: sign up, confirm email flow (or disable email
    confirmation for testing in Supabase Auth settings), sign in, sign out.
12. Verify RLS using `supabase/tests/rls_verification.sql` with two test users.
13. Verify PWA installation (Chrome/Edge install icon, or "Add to Home Screen" on
    mobile).
14. Verify guest mode still works with Supabase configured (sign out and browse).
15. Verify mobile layout at 375/430px widths.
16. Verify simulation disclosures are visible on homepage, job cards, review, offer,
    Reject Mode, candidate pages.
17. Verify dark mode via the theme toggle.
18. Verify a custom domain if configured (Vercel → Domains).
19. Verify `/privacy`, `/terms`, `/simulation`, `/about`, `/contact` render.
20. Run a production smoke test of both Accept Mode and Reject Mode end to end.

## 4. Deploying to Vercel

```bash
# Push to GitHub, then either:
vercel            # first-time interactive deploy
vercel --prod     # production deploy
```

Or connect the GitHub repo in the Vercel dashboard for automatic preview deployments
on every PR and production deployments on `main`. Build command: `next build`
(default). Output: managed by the Next.js Vercel builder — no custom output setting
required. No paid Vercel feature is required for the MVP.

## 5. Optional Netlify Notes

The project can build on Netlify via the official Next.js Runtime
(`@netlify/plugin-nextjs`), which is added automatically when you connect the repo in
the Netlify UI. Environment variables are the same as Vercel. Netlify support is
best-effort only; Vercel remains the primary, fully-verified target and no Vercel-
specific behavior is sacrificed to support it.

## 6. Post-Deployment Checklist

See `IMPLEMENTATION_PLAN.md` §Production Checklist for the full Product / Design /
Engineering / Security / Deployment verification list.
