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
2. Run `supabase/migrations/20261002000000_create_profiles.sql` in the SQL editor (or `supabase db push`). It creates a `profiles` table with RLS and a trigger that adds a profile row for every new user.
3. In Authentication -> URL Configuration, set **Site URL** to your app URL and add `<app-url>/dashboard` and `<app-url>/reset-password` to **Redirect URLs**.

Routes: `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/dashboard` (protected).
