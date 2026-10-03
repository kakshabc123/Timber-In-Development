import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type SessionSummary = {
  id: string;
  target_role: string;
  status: "in_progress" | "completed";
  overall_score: number | null;
  created_at: string;
};

const PAGE_SIZE = 20;

export default function InterviewHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;

    async function loadSessions() {
      setLoading(true);
      setError(null);

      let request = supabase
        .from("interview_sessions")
        .select("id, target_role, status, overall_score, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (search.trim()) request = request.ilike("target_role", `%${search.trim()}%`);
      if (status !== "all") request = request.eq("status", status);

      const { data, count, error: queryError } = await request.returns<SessionSummary[]>();
      if (!active) return;

      if (queryError) {
        setError("Your interview history couldn't be loaded. Please try again.");
        setSessions([]);
        setTotal(0);
      } else {
        setSessions(data ?? []);
        setTotal(count ?? 0);
      }
      setLoading(false);
    }

    void loadSessions();
    return () => {
      active = false;
    };
  }, [user, search, status, page]);

  function updateSearch(value: string) {
    setSearch(value);
    setPage(0);
  }

  function updateStatus(value: string) {
    setStatus(value);
    setPage(0);
  }

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 md:px-12">
        <Link to="/dashboard" className="font-display text-2xl">TimberVue</Link>
        <Link to="/dashboard" className="text-sm text-muted-foreground transition hover:text-foreground">
          Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Training log</p>
            <h1 className="mt-3 font-display text-5xl">Interview history</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {loading ? "Loading sessions…" : `${total} ${total === 1 ? "session" : "sessions"}`}
            </p>
          </div>
          <Link
            to="/interview"
            className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Start interview
          </Link>
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-[1fr_190px]">
          <label className="sr-only" htmlFor="history-search">Search roles</label>
          <input
            id="history-search"
            type="search"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Search by target role"
            className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/50"
          />
          <label className="sr-only" htmlFor="history-status">Filter by status</label>
          <select
            id="history-status"
            value={status}
            onChange={(event) => updateStatus(event.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground/50"
          >
            <option value="all">All sessions</option>
            <option value="completed">Completed</option>
            <option value="in_progress">Unfinished</option>
          </select>
        </div>

        <section className="mt-5 border-t border-border">
          {loading ? (
            <p className="py-10 text-sm text-muted-foreground">Loading sessions…</p>
          ) : error ? (
            <p role="alert" className="py-10 text-sm text-destructive">{error}</p>
          ) : sessions.length === 0 ? (
            <div className="py-12">
              <h2 className="font-display text-3xl">{search || status !== "all" ? "No matching sessions" : "Nothing here yet"}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {search || status !== "all" ? "Try changing your search or filter." : "Your completed and unfinished interviews will appear here."}
              </p>
              {!search && status === "all" && (
                <Link to="/interview" className="mt-5 inline-block text-sm underline underline-offset-4">
                  Start your first interview
                </Link>
              )}
            </div>
          ) : (
            <>
              <ul className="divide-y divide-border">
                {sessions.map((session) => (
                  <li key={session.id}>
                    <Link
                      to={`/interview/${session.id}`}
                      className="flex items-center justify-between gap-4 py-5 transition hover:text-foreground"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-display text-2xl">{session.target_role}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        {session.status === "completed" ? (
                          <>
                            <span className="block font-display text-3xl">{session.overall_score ?? "—"}</span>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Score</span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unfinished</span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {pageCount > 1 && (
                <nav aria-label="History pages" className="flex items-center justify-between border-t border-border py-5">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((current) => current - 1)}
                    className="text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-muted-foreground">Page {page + 1} of {pageCount}</span>
                  <button
                    type="button"
                    disabled={page + 1 >= pageCount}
                    onClick={() => setPage((current) => current + 1)}
                    className="text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-40"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}