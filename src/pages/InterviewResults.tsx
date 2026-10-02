import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FullScreenLoader } from "@/components/RouteGuards";
import { SCORE_LABELS, type InterviewSession } from "@/lib/interview";
import { supabase } from "@/lib/supabase";

export default function InterviewResults() {
  const { id } = useParams();
  const [session, setSession] = useState<InterviewSession | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", id)
      .maybeSingle<InterviewSession>()
      .then(({ data }) => setSession(data ?? null));
  }, [id]);

  if (session === undefined) return <FullScreenLoader />;

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link to="/" className="font-display text-3xl tracking-tight">
          Timber<sup className="text-xs">®</sup>
        </Link>
        <Link to="/dashboard" className="text-sm text-muted-foreground transition hover:text-foreground">
          Dashboard
        </Link>
      </header>

      <main className="mx-auto w-full max-w-2xl px-6 pb-24 pt-8">
        {!session || session.status !== "completed" || !session.scores ? (
          <div className="pt-24 text-center">
            <h1 className="font-display text-4xl">{session ? "This interview wasn't finished." : "Interview not found."}</h1>
            <Link
              to="/interview"
              className="mt-8 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Start a new interview
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {session.target_role} · {new Date(session.created_at).toLocaleDateString()}
            </p>
            <h1 className="mt-4 font-display text-5xl leading-tight">Here&apos;s where you break.</h1>
            {session.summary && <p className="mt-4 text-muted-foreground">{session.summary}</p>}

            <section className="liquid-glass mt-10 rounded-2xl p-6 sm:p-8">
              <span className="text-[11px] tracking-[0.25em] text-muted-foreground">PRESSURE SCORE</span>
              <span className="mt-4 block font-display text-7xl">
                {session.overall_score}
                <span className="text-2xl text-muted-foreground"> / 100</span>
              </span>
              <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6">
                {SCORE_LABELS.map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span>{session.scores?.[key]}</span>
                    </div>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-foreground/70" style={{ width: `${session.scores?.[key]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              {session.focus_area && (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <span className="text-[10px] tracking-[0.2em] text-muted-foreground">FOCUS AREA</span>
                  <p className="mt-2 text-sm">{session.focus_area}</p>
                </div>
              )}
            </section>

            <h2 className="mt-16 text-xs uppercase tracking-[0.25em] text-muted-foreground">Answer by answer</h2>
            <ol className="mt-6 space-y-4">
              {session.questions.map((question, i) => {
                const answer = session.answers?.[i];
                const feedback = session.feedback?.[i];
                return (
                  <li key={i} className="rounded-2xl border border-border bg-secondary/30 p-5">
                    <div className="flex items-center justify-between text-[10px] tracking-[0.2em] text-muted-foreground">
                      <span>
                        {question.stage} · {answer?.seconds_used ?? 0}s / {question.seconds}s
                      </span>
                      <span className="font-display text-xl tracking-normal text-foreground">{feedback?.score ?? 0}</span>
                    </div>
                    <p className="mt-3 font-display text-xl leading-snug">{question.question}</p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {answer?.answer ? `“${answer.answer}”` : "No answer"}
                    </p>
                    {feedback && <p className="mt-3 border-t border-white/10 pt-3 text-sm">{feedback.feedback}</p>}
                  </li>
                );
              })}
            </ol>

            <Link
              to="/interview"
              className="mt-12 block w-full rounded-full bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Train again
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
