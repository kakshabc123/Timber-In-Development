import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import type { InterviewSession } from "@/lib/interview";
import { experienceLabel, RESUME_BUCKET } from "@/lib/onboarding";
import { supabase } from "@/lib/supabase";

type SessionSummary = Pick<InterviewSession, "id" | "target_role" | "status" | "overall_score" | "created_at">;

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);

  const resumePath = profile?.resume_path ?? null;

  useEffect(() => {
    if (!resumePath) return;
    supabase.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(resumePath, 60 * 60)
      .then(({ data }) => setResumeUrl(data?.signedUrl ?? null));
  }, [resumePath]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("interview_sessions")
      .select("id, target_role, status, overall_score, created_at")
      .order("created_at", { ascending: false })
      .limit(10)
      .returns<SessionSummary[]>()
      .then(({ data }) => setSessions(data ?? []));
  }, [user]);

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  const displayName =
    profile?.full_name ?? (user?.user_metadata.full_name as string | undefined) ?? user?.email;

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="font-display text-2xl">Timber</span>
        <button
          onClick={handleSignOut}
          className="rounded-full border border-border px-4 py-1.5 text-sm transition hover:bg-secondary"
        >
          Log out
        </button>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-5xl">Hi, {displayName}</h1>
        <p className="mt-3 text-muted-foreground">Signed in as {user?.email}</p>

        <Link
          to="/interview"
          className="mt-10 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Start pressure interview
        </Link>

        <section className="mt-12 rounded-2xl border border-border bg-secondary/30 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Your training profile</h2>
            <Link to="/onboarding" className="text-sm text-muted-foreground transition hover:text-foreground">
              Edit
            </Link>
          </div>
          <dl className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Target role</dt>
              <dd className="mt-1 font-display text-2xl">{profile?.target_role ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Experience</dt>
              <dd className="mt-1 font-display text-2xl">{experienceLabel(profile?.experience_level ?? null) ?? "—"}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Resume</dt>
              <dd className="mt-1 truncate text-sm">
                {profile?.resume_filename ? (
                  resumeUrl ? (
                    <a href={resumeUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                      {profile.resume_filename}
                    </a>
                  ) : (
                    profile.resume_filename
                  )
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-secondary/30 p-6">
          <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Recent interviews</h2>
          {sessions === null ? (
            <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
          ) : sessions.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No interviews yet. Your pressure scores will show up here.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/10">
              {sessions.map((session) => (
                <li key={session.id}>
                  <Link
                    to={`/interview/${session.id}`}
                    className="flex items-center justify-between py-3 text-sm transition hover:text-foreground"
                  >
                    <span>
                      {session.target_role}
                      <span className="ml-3 text-muted-foreground">
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="font-display text-2xl">
                      {session.status === "completed" ? session.overall_score : <span className="text-sm text-muted-foreground">Unfinished</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
