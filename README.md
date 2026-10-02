# Timber

## Getting started

```bash
npm install
cp .env.example .env.local   # add your Supabase URL + anon key
npm run dev
```

## Authentication (Supabase)

Email/password auth with signup, login, logout, password reset and protected routes.

1. Create a Supabase project and copy **Project URL** and **anon public key** (Project Settings -> API) into `.env.local`.
2. Run `supabase/migrations/20261002000000_create_profiles.sql` in the SQL editor (or `supabase db push`). It creates a `profiles` table with RLS and a trigger that adds a profile row for every new user. Then run `supabase/migrations/20261002010000_onboarding.sql`, which adds the onboarding columns and a private `resumes` Storage bucket scoped per user, and `supabase/migrations/20261002020000_interview_sessions.sql` for interview history.
3. In Authentication -> URL Configuration, set **Site URL** to your app URL and add `<app-url>/dashboard` and `<app-url>/reset-password` to **Redirect URLs**.

Routes: `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/onboarding` (protected: resume upload + role), `/dashboard`, `/interview` (timed AI interview), `/interview/:id` (results) — all protected and require onboarding.

## AI interview (Edge Function)

`/interview` calls the `interview` Supabase Edge Function (`supabase/functions/interview`), which generates questions from the user's resume and role and scores the answers with OpenAI. The OpenAI key lives only in Supabase secrets.

```sh
npx supabase login
npx supabase secrets set OPENAI_API_KEY=sk-... --project-ref <project-ref>
npx supabase functions deploy interview --project-ref <project-ref>
```

Optional: `OPENAI_MODEL` (defaults to `gpt-4.1-mini`).
