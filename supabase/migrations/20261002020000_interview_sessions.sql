create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  target_role text not null,
  experience_level text,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  questions jsonb not null,
  answers jsonb,
  feedback jsonb,
  scores jsonb,
  overall_score integer,
  focus_area text,
  summary text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists interview_sessions_user_created_idx
  on public.interview_sessions (user_id, created_at desc);

alter table public.interview_sessions enable row level security;

-- Sessions are created and scored only by the `interview` Edge Function (service role),
-- so users can read their own sessions but cannot write scores directly.
create policy "Users can view their own interview sessions"
  on public.interview_sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);
