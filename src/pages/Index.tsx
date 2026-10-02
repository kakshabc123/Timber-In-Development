import { Link } from "react-router-dom";
import { GlassButton } from "@/components/GlassButton";
import { Reveal } from "@/components/Reveal";
import { useAuth } from "@/contexts/AuthContext";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

const NAV_LINKS = ["Home", "Studio", "About", "Journal", "Reach Us"];

const PRESSURE_STAGES = [
  { time: "30s", label: "WARM UP", opacity: 0.4 },
  { time: "20s", label: "INTERVIEW", opacity: 0.55 },
  { time: "15s", label: "PRESSURE", opacity: 0.7 },
  { time: "10s", label: "RAPID FIRE", opacity: 0.85 },
  { time: "5s", label: "BOSS MODE", opacity: 1 },
];

const SCORES = [
  { label: "Response Speed", value: 84 },
  { label: "Answer Quality", value: 91 },
  { label: "Communication", value: 76 },
  { label: "Technical", value: 88 },
];

const FOOTER_LINKS = ["Product", "Coding", "About", "Contact", "Privacy", "Terms"];

function Wordmark({ className = "text-3xl", supClass = "text-xs" }: { className?: string; supClass?: string }) {
  return (
    <span className={`font-display tracking-tight text-foreground ${className}`}>
      Timber<sup className={supClass}>®</sup>
    </span>
  );
}

export default function Index() {
  const { user } = useAuth();
  const authPath = user ? "/dashboard" : "/signup";

  return (
    <div className="w-full bg-background">
      <div className="relative min-h-screen w-full overflow-hidden bg-background">
        <video
          autoPlay
          loop
          muted
          playsInline
          src={HERO_VIDEO}
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />

        <nav className="relative z-10 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6">
          <Link to="/">
            <Wordmark />
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((label, index) => (
              <a
                key={label}
                href="#"
                className={`text-sm transition-colors hover:text-foreground ${
                  index === 0 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {!user && (
              <Link to="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Log in
              </Link>
            )}
            <GlassButton to={authPath}>{user ? "Dashboard" : "Begin Journey"}</GlassButton>
          </div>
        </nav>

        <section className="relative z-10 flex flex-col items-center px-6 py-[90px] pb-40 pt-32 text-center">
          <h1 className="animate-fade-rise max-w-7xl font-display text-5xl font-normal leading-[0.95] tracking-[-2.46px] sm:text-7xl md:text-8xl">
            Where <em className="not-italic text-muted-foreground">dreams</em> rise{" "}
            <em className="not-italic text-muted-foreground">through the silence.</em>
          </h1>
          <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital
            spaces for sharp focus and inspired work.
          </p>
          <GlassButton to={authPath} size="lg" className="animate-fade-rise-delay-2 mt-12">
            Begin Journey
          </GlassButton>
        </section>
      </div>

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 py-32 text-center md:py-48">
        <Reveal>
          <span className="text-xs tracking-[0.3em] text-muted-foreground">THE PROBLEM</span>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="mt-8 font-display text-4xl leading-[1.05] tracking-[-1.5px] text-foreground sm:text-5xl md:text-6xl">
            Knowing the answer
            <br />
            isn't enough.
          </h2>
        </Reveal>
        <Reveal delay={240}>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Real interviews test more than what you know. They test how quickly you think, how clearly you communicate,
            and how well you perform when the clock starts.
          </p>
        </Reveal>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl border-t border-border px-6 py-32 md:py-40">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2 md:gap-12">
          <Reveal>
            <span className="text-xs tracking-[0.3em] text-muted-foreground">MEET TIMBER</span>
            <h2 className="mt-8 font-display text-4xl leading-[1.05] tracking-[-1.5px] text-foreground sm:text-5xl md:text-6xl">
              An interview gym
              <br />
              for real pressure.
            </h2>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Upload your resume. Choose your role. Step into an AI-powered interview built around your experience —
              then answer under pressure.
            </p>
            <GlassButton to={authPath} size="md" className="mt-10">
              Start Training
            </GlassButton>
          </Reveal>
          <Reveal delay={150}>
            <div className="liquid-glass mx-auto w-full max-w-md rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-[0.25em] text-muted-foreground">AI INTERVIEWER</span>
                <span className="h-2 w-2 rounded-full bg-foreground/70" />
              </div>
              <p className="mt-6 font-display text-xl leading-snug text-foreground sm:text-2xl">
                "Tell me about a difficult problem you solved."
              </p>
              <div className="mt-10 flex items-end justify-between">
                <span className="font-display text-6xl text-foreground sm:text-7xl">15</span>
                <span className="pb-2 text-xs text-muted-foreground">sec</span>
              </div>
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-2/3 rounded-full bg-foreground/70" />
              </div>
              <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">
                <span className="text-lg">🎙</span>
                <span className="text-sm text-muted-foreground">Speak your answer</span>
              </div>
              <div className="mt-6 text-center">
                <span className="text-[10px] tracking-[0.25em] text-muted-foreground">PRESSURE MODE · BEHAVIORAL</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl border-t border-border px-6 py-32 text-center md:py-40">
        <Reveal>
          <h2 className="font-display text-4xl leading-[1.05] tracking-[-1.5px] text-foreground sm:text-5xl md:text-6xl">
            The pressure
            <br />
            adapts to you.
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            TIMBER learns how you perform and adjusts the challenge. Start comfortable. Build until pressure feels
            normal.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-20 overflow-x-auto">
            <div className="relative mx-auto flex min-w-[560px] items-start justify-between px-2">
              <div className="absolute left-0 right-0 top-[7px] h-px bg-gradient-to-r from-white/10 via-white/25 to-white/60" />
              {PRESSURE_STAGES.map((stage) => (
                <div key={stage.label} className="relative z-10 flex flex-1 flex-col items-center">
                  <span
                    style={{ opacity: stage.opacity }}
                    className="block h-[15px] w-[15px] rounded-full border border-white/30 bg-background"
                  />
                  <span className="mt-6 font-display text-2xl text-foreground sm:text-3xl">{stage.time}</span>
                  <span className="mt-2 whitespace-nowrap text-[10px] tracking-[0.2em] text-muted-foreground">
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 mx-auto max-w-4xl border-t border-border px-6 py-32 text-center md:py-40">
        <Reveal>
          <span className="text-xs tracking-[0.3em] text-muted-foreground">FOR ENGINEERS</span>
          <h2 className="mt-8 font-display text-4xl leading-[1.05] tracking-[-1.5px] text-foreground sm:text-5xl md:text-6xl">
            Don't just solve it.
            <br />
            Solve it under pressure.
          </h2>
          <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Practice coding interviews with timed problems, interviewer interruptions, complexity questions, and
            adaptive difficulty.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <div className="liquid-glass mx-auto mt-16 max-w-2xl rounded-2xl p-6 text-left sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <span className="text-[11px] tracking-[0.25em] text-muted-foreground">PROBLEM</span>
              <span className="font-display text-lg text-foreground sm:text-xl">01:24</span>
            </div>
            <p className="mt-6 text-lg leading-relaxed text-foreground sm:text-xl">
              Find the longest consecutive sequence.
            </p>
            <div className="mt-6 rounded-xl bg-white/5 px-5 py-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="mr-2 text-[10px] tracking-[0.2em] text-muted-foreground">AI INTERVIEWER</span>
                <br />
                "What is the time complexity?"
              </p>
            </div>
            <div className="mt-8 flex justify-center">
              <GlassButton to={authPath} size="md">
                Try Coding Pressure
              </GlassButton>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl border-t border-border px-6 py-32 text-center md:py-40">
        <Reveal>
          <h2 className="font-display text-4xl leading-[1.05] tracking-[-1.5px] text-foreground sm:text-5xl md:text-6xl">
            Know exactly
            <br />
            where you break.
          </h2>
          <p className="mx-auto mt-8 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            After every session, TIMBER turns your performance into actionable feedback.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <div className="liquid-glass mx-auto mt-16 max-w-md rounded-2xl p-6 text-left sm:p-8">
            <span className="text-[11px] tracking-[0.25em] text-muted-foreground">PRESSURE SCORE</span>
            <span className="mt-4 block font-display text-6xl text-foreground sm:text-7xl">
              82<span className="text-2xl text-muted-foreground"> / 100</span>
            </span>
            <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6">
              {SCORES.map((score) => (
                <div key={score.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{score.label}</span>
                    <span className="text-foreground">{score.value}</span>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-foreground/70" style={{ width: `${score.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 border-t border-white/10 pt-6">
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground">FOCUS AREA</span>
              <p className="mt-2 text-sm text-foreground">Get to your main point faster.</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center border-t border-border px-6 py-40 text-center md:py-56">
        <Reveal>
          <h2 className="font-display text-4xl leading-[1.05] tracking-[-1.5px] text-foreground sm:text-5xl md:text-6xl">
            Ready when
            <br />
            the pressure starts.
          </h2>
          <p className="mt-8 text-base text-muted-foreground sm:text-lg">
            Stop practicing interviews in perfect conditions.
          </p>
          <div className="mt-12 flex flex-col items-center">
            <GlassButton to={authPath} size="lg">
              Start Training
            </GlassButton>
            <span className="mt-5 text-xs text-muted-foreground">Free to start.</span>
          </div>
        </Reveal>
      </section>

      <footer className="relative z-10 mx-auto max-w-7xl border-t border-border px-6 py-14">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <Wordmark className="text-xl" supClass="text-[10px]" />
            <p className="mt-1 text-xs text-muted-foreground">Train under pressure. Perform without it.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((label) => (
              <a key={label} href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                {label}
              </a>
            ))}
          </div>
        </div>
        <p className="mt-10 text-center text-[11px] text-muted-foreground md:text-left">© 2026 Timber.</p>
      </footer>
    </div>
  );
}
