import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormMessage } from "@/components/FormControls";
import { useProfile } from "@/contexts/ProfileContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import {
  finishInterview,
  PRESSURE_STAGES,
  startInterview,
  type InterviewAnswer,
  type InterviewSession,
} from "@/lib/interview";
import { experienceLabel } from "@/lib/onboarding";

type Phase = "intro" | "starting" | "countdown" | "question" | "scoring" | "scoring-failed";

const COUNTDOWN_SECONDS = 3;

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

export default function Interview() {
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("intro");
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [remainingMs, setRemainingMs] = useState(0);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  const answersRef = useRef<InterviewAnswer[]>([]);
  const startedAtRef = useRef(0);
  const submittedIndexRef = useRef(-1);
  const answerRef = useRef("");
  answerRef.current = answer;

  const appendTranscript = useCallback((text: string) => {
    if (text) setAnswer((prev) => (prev ? `${prev} ${text}` : text));
  }, []);
  const speech = useSpeechRecognition(appendTranscript);
  const { stop: stopSpeech, reset: resetSpeech } = speech;
  const interimRef = useRef("");
  interimRef.current = speech.interim;

  async function handleStart() {
    setError(null);
    setPhase("starting");
    try {
      const next = await startInterview();
      answersRef.current = [];
      submittedIndexRef.current = -1;
      setSession(next);
      setIndex(0);
      setAnswer("");
      setCountdown(COUNTDOWN_SECONDS);
      setPhase("countdown");
    } catch (err) {
      setError(errorMessage(err));
      setPhase("intro");
    }
  }

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown === 0) {
      setPhase("question");
      return;
    }
    const id = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, countdown]);

  const scoreSession = useCallback(
    async (current: InterviewSession) => {
      stopSpeech();
      setError(null);
      setPhase("scoring");
      try {
        const scored = await finishInterview(current.id, answersRef.current);
        navigate(`/interview/${scored.id}`, { replace: true });
      } catch (err) {
        setError(errorMessage(err));
        setPhase("scoring-failed");
      }
    },
    [navigate, stopSpeech],
  );

  const submitAnswer = useCallback(() => {
    if (!session || submittedIndexRef.current === index) return;
    submittedIndexRef.current = index;

    const question = session.questions[index];
    const elapsed = Math.min(question.seconds, (performance.now() - startedAtRef.current) / 1000);
    const text = [answerRef.current, interimRef.current].filter(Boolean).join(" ").trim();
    answersRef.current = [...answersRef.current, { answer: text, seconds_used: Math.round(elapsed * 10) / 10 }];

    if (index + 1 >= session.questions.length) {
      void scoreSession(session);
      return;
    }
    setAnswer("");
    resetSpeech();
    setIndex(index + 1);
  }, [session, index, scoreSession, resetSpeech]);

  const submitRef = useRef(submitAnswer);
  submitRef.current = submitAnswer;

  useEffect(() => {
    if (phase !== "question" || !session) return;
    const limit = session.questions[index].seconds * 1000;
    startedAtRef.current = performance.now();
    setRemainingMs(limit);
    const id = setInterval(() => {
      const left = limit - (performance.now() - startedAtRef.current);
      if (left <= 0) {
        clearInterval(id);
        setRemainingMs(0);
        submitRef.current();
      } else {
        setRemainingMs(left);
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, session, index]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitAnswer();
    }
  }

  const header = (
    <header className="flex items-center justify-between px-6 py-5 md:px-12">
      <Link to="/" className="font-display text-3xl tracking-tight">
        Timber<sup className="text-xs">®</sup>
      </Link>
      {(phase === "intro" || phase === "starting" || phase === "scoring-failed") && (
        <Link to="/dashboard" className="text-sm text-muted-foreground transition hover:text-foreground">
          Back to dashboard
        </Link>
      )}
    </header>
  );

  if (phase === "intro" || phase === "starting") {
    return (
      <div className="min-h-screen">
        {header}
        <main className="mx-auto w-full max-w-2xl px-6 pb-16 pt-8">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Pressure interview</p>
          <h1 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">Step into the room.</h1>
          <p className="mt-4 text-muted-foreground">
            Ten questions built from your resume for{" "}
            <span className="text-foreground">{profile?.target_role ?? "your role"}</span>
            {profile?.experience_level ? ` (${experienceLabel(profile.experience_level)})` : ""}. The clock gets
            shorter as you go. When time runs out, your answer is submitted automatically.
          </p>

          <ol className="mt-10 grid grid-cols-5 gap-2">
            {PRESSURE_STAGES.map((stage, i) => (
              <li
                key={stage.label}
                className="rounded-xl border border-border bg-secondary/30 px-2 py-4 text-center"
                style={{ opacity: 0.45 + i * 0.14 }}
              >
                <span className="block font-display text-3xl">{stage.seconds}s</span>
                <span className="mt-1 block text-[10px] tracking-[0.2em] text-muted-foreground">{stage.label}</span>
              </li>
            ))}
          </ol>

          <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
            <li>Answer out loud {speech.supported ? "with your mic" : "(voice works in Chrome)"} or type your answer.</li>
            <li>Press Enter to submit early. Faster, clearer answers score higher.</li>
            <li>You&apos;ll get a pressure score and feedback on every answer at the end.</li>
          </ul>

          {error && (
            <div className="mt-8">
              <FormMessage type="error">{error}</FormMessage>
            </div>
          )}

          <button
            onClick={() => void handleStart()}
            disabled={phase === "starting"}
            className="mt-10 w-full rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {phase === "starting" ? "Preparing your questions…" : "Begin interview"}
          </button>
        </main>
      </div>
    );
  }

  if (phase === "countdown") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">First question in</p>
        <span className="mt-6 font-display text-9xl">{countdown}</span>
      </div>
    );
  }

  if (phase === "scoring" || phase === "scoring-failed" || !session) {
    return (
      <div className="min-h-screen">
        {header}
        <main className="flex flex-col items-center px-6 pt-32 text-center">
          {phase === "scoring-failed" ? (
            <>
              <h1 className="font-display text-4xl">Scoring didn&apos;t finish.</h1>
              <div className="mt-6 w-full max-w-md">{error && <FormMessage type="error">{error}</FormMessage>}</div>
              <button
                onClick={() => session && void scoreSession(session)}
                className="mt-8 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Retry scoring
              </button>
            </>
          ) : (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
              <h1 className="mt-8 font-display text-4xl">Scoring your interview…</h1>
              <p className="mt-3 text-sm text-muted-foreground">Breathe. The pressure&apos;s off.</p>
            </>
          )}
        </main>
      </div>
    );
  }

  const question = session.questions[index];
  const stageIndex = PRESSURE_STAGES.findIndex((stage) => stage.label === question.stage);
  const limitMs = question.seconds * 1000;
  const urgent = remainingMs <= 3000;

  return (
    <div className="min-h-screen">
      {header}
      <main className="mx-auto w-full max-w-2xl px-6 pb-16 pt-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground">
          <span>{question.stage}</span>
          <span>
            Question {index + 1} of {session.questions.length}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {PRESSURE_STAGES.map((stage, i) => (
            <div key={stage.label} className={`h-1 rounded-full ${i <= stageIndex ? "bg-foreground" : "bg-white/10"}`} />
          ))}
        </div>

        <div className="mt-10 flex items-end justify-between gap-6">
          <h1 className="font-display text-3xl leading-snug sm:text-4xl">{question.question}</h1>
          <span
            aria-live="off"
            className={`shrink-0 font-display text-6xl tabular-nums transition-colors ${urgent ? "text-destructive" : ""}`}
          >
            {Math.ceil(remainingMs / 1000)}
            <span className="text-xl text-muted-foreground">s</span>
          </span>
        </div>
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${urgent ? "bg-destructive" : "bg-foreground/70"}`}
            style={{ width: `${(remainingMs / limitMs) * 100}%` }}
          />
        </div>

        <textarea
          key={index}
          autoFocus
          aria-label="Your answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={5}
          maxLength={2000}
          placeholder={speech.listening ? "Listening… speak your answer" : "Type your answer"}
          className="mt-8 w-full resize-none rounded-2xl border border-input bg-background/60 px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {speech.interim && <p className="mt-2 text-sm italic text-muted-foreground">{speech.interim}</p>}
        {speech.error && (
          <div className="mt-3">
            <FormMessage type="error">{speech.error}</FormMessage>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          {speech.supported && (
            <button
              type="button"
              onClick={speech.listening ? speech.stop : speech.start}
              aria-pressed={speech.listening}
              className={`rounded-full border px-5 py-2.5 text-sm transition ${
                speech.listening
                  ? "border-destructive/60 bg-destructive/10 text-destructive"
                  : "border-border hover:bg-secondary"
              }`}
            >
              {speech.listening ? "● Mic on" : "🎙 Speak your answer"}
            </button>
          )}
          <button
            type="button"
            onClick={submitAnswer}
            className="ml-auto rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            {index + 1 === session.questions.length ? "Finish" : "Submit answer"}
          </button>
        </div>
      </main>
    </div>
  );
}
