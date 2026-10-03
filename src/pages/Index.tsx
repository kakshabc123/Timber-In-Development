import { Link } from "react-router-dom";
import { GlassButton } from "@/components/GlassButton";
import { Reveal } from "@/components/Reveal";
import { useAuth } from "@/contexts/AuthContext";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "30-second rounds", href: "#rounds" },
  { label: "Scoring", href: "#scoring" },
  { label: "History", href: "#history" },
];

const PRESSURE_STAGES = [
  { range: "01–02", label: "WARM UP", detail: "Find your footing with a clear opener." },
  { range: "03–04", label: "INTERVIEW", detail: "Show how you approach familiar work." },
  { range: "05–06", label: "PRESSURE", detail: "Explain trade-offs and decisions." },
  { range: "07–08", label: "RAPID FIRE", detail: "Make the point without the preamble." },
  { range: "09–10", label: "BOSS MODE", detail: "Bring the full answer into focus." },
];

const SCORES = [
  { label: "Answer quality", detail: "Relevance, correctness, and useful detail." },
  { label: "Speaking fluency", detail: "Clarity and flow in the transcript." },
  { label: "Confidence", detail: "Direct language and clear ownership." },
];

const FOOTER_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Rounds", href: "#rounds" },
  { label: "Scoring", href: "#scoring" },
  { label: "Log in", href: "/login" },
];

function Wordmark({ className = "text-3xl", supClass = "text-xs" }: { className?: string; supClass?: string }) {
  return (
    <span className={`font-display tracking-tight text-foreground ${className}`}>
      TimberVue<sup className={supClass}>®</sup>
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
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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

      <section className="relative z-10 mx-auto grid max-w-7xl gap-10 border-t border-border px-6 py-24 md:grid-cols-[0.9fr_1.1fr] md:gap-20 md:py-32">
        <Reveal>
          <span className="text-xs tracking-[0.3em] text-muted-foreground">THE MOMENT THAT MATTERS</span>
          <h2 className="mt-8 font-display text-4xl leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
            Knowing it is one thing. Saying it is another.
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            An interview asks you to find the point, put it into words, and keep moving while the clock is running.
            TimberVue gives you a repeatable place to practice that exact moment: one question, one spoken answer, and
            useful feedback before the next round.
          </p>
          <div className="mt-8 grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-foreground">Think clearly</span>
              Organize a relevant answer without hiding behind a prepared script.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-foreground">Speak with intent</span>
              Practice direct, fluent delivery and see where your answer can get sharper.
            </p>
          </div>
        </Reveal>
      </section>

      <section id="how-it-works" className="relative z-10 mx-auto max-w-7xl border-t border-border px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2 md:gap-12">
          <Reveal>
            <span className="text-xs tracking-[0.3em] text-muted-foreground">HOW IT WORKS</span>
            <h2 className="mt-8 font-display text-4xl leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
              A focused practice loop, from setup to debrief.
            </h2>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Choose a target role and experience level, then take a ten-question spoken interview. Each prompt is read
              aloud, and your answer is captured as a transcript for review.
            </p>
            <GlassButton to={authPath} size="md" className="mt-10">
              Set up your profile
            </GlassButton>
          </Reveal>
          <Reveal delay={150}>
            <div className="border-y border-border">
              {[
                { number: "01", title: "Set your direction", detail: "Pick a role and experience level for your session." },
                { number: "02", title: "Answer out loud", detail: "Hear each prompt, start the mic, and speak to the 30-second clock." },
                { number: "03", title: "Review your performance", detail: "See feedback by question, a three-part score, and your focus area." },
              ].map((step) => (
                <div key={step.number} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-border py-6 last:border-b-0 sm:grid-cols-[4rem_1fr] sm:gap-6">
                  <span className="font-display text-2xl text-muted-foreground">{step.number}</span>
                  <div>
                    <h3 className="font-display text-2xl text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="rounds" className="relative z-10 mx-auto max-w-7xl border-t border-border px-6 py-24 md:py-32">
        <Reveal>
          <span className="text-xs tracking-[0.3em] text-muted-foreground">THE ROUND FORMAT</span>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
            The questions get sharper. The clock stays steady.
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Ten questions move through five modes, with two prompts per mode. Every answer gets the same 30 seconds;
            the challenge comes from the questions, not a shrinking timer. Submit early or skip up to three.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mx-auto mt-16 grid max-w-7xl gap-px border-y border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
            {PRESSURE_STAGES.map((stage) => (
              <div key={stage.label} className="min-h-52 bg-background p-5 text-foreground sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs text-muted-foreground">{stage.range} / 10</span>
                  <span className="font-display text-6xl leading-none text-foreground">
                    30<span className="ml-1 text-xl text-muted-foreground">s</span>
                  </span>
                </div>
                <h3 className="mt-8 text-[10px] tracking-[0.18em] text-muted-foreground">{stage.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{stage.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="session" className="relative z-10 border-t border-border px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
          <Reveal>
            <span className="text-xs tracking-[0.3em] text-muted-foreground">INSIDE ONE SESSION</span>
            <div className="mt-8 flex items-end gap-3">
              <span className="font-display text-[9rem] leading-[0.72] text-[hsl(var(--brand-signal))]">10</span>
              <span className="pb-1 text-xs uppercase leading-relaxed tracking-[0.18em] text-muted-foreground">spoken<br />questions</span>
            </div>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Five stages. Two questions per stage. One focused practice session built to fit into a short break.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <div className="border-t border-border">
              {[
                { label: "01 / HEAR", title: "The prompt is read aloud", detail: "See the question on screen and hear it before your response timer begins." },
                { label: "02 / RESPOND", title: "Start speaking when ready", detail: "Tap to start your microphone and 30-second timer. Your recognized words appear as a live transcript." },
                { label: "03 / CONTROL", title: "Submit early or move on", detail: "Finish a strong answer before time runs out, or use up to three skips across the session." },
                { label: "04 / REVIEW", title: "Leave with a next step", detail: "Review each answer, your three score dimensions, and one prioritized focus area." },
              ].map((item) => (
                <div key={item.label} className="grid gap-2 border-b border-border py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
                  <span className="pt-1 text-[10px] tracking-[0.18em] text-[hsl(var(--brand-signal))]">{item.label}</span>
                  <div>
                    <h3 className="font-display text-2xl text-foreground">{item.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-12 border-t border-border px-6 py-24 md:grid-cols-2 md:items-center md:gap-20 md:py-32">
        <Reveal>
          <span className="text-xs tracking-[0.3em] text-muted-foreground">SPEAK, DON&apos;T SCRIPT</span>
          <h2 className="mt-8 font-display text-4xl leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
            Practice the delivery, not just the notes.
          </h2>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            TimberVue is voice-first. Questions are spoken to you, your microphone captures your answer, and the
            transcript stays visible so you can see what came through. Typed answers are not part of the practice.
          </p>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Fluency and confidence are estimated from the transcript&apos;s wording. TimberVue does not analyze vocal
            tone, volume, or other audio characteristics.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <div className="liquid-glass w-full rounded-2xl p-6 text-left sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <span className="text-[11px] tracking-[0.25em] text-muted-foreground">VOICE ROUND · EXAMPLE</span>
              <span className="font-display text-2xl text-foreground">30s</span>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground">Question, read aloud</p>
            <p className="mt-3 font-display text-2xl leading-snug text-foreground">
              Tell me about a decision you made with incomplete information.
            </p>
            <div className="mt-8 border-t border-white/10 pt-5">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Your live transcript</span>
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                “I compared the options we had, explained the risks to the team, and chose the path we could validate
                fastest.”
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="scoring" className="relative z-10 mx-auto max-w-7xl border-t border-border px-6 py-24 md:py-32">
        <Reveal>
          <span className="text-xs tracking-[0.3em] text-muted-foreground">THE DEBRIEF</span>
          <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
            A score should tell you what to work on next.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            After all ten questions, review the overall score, feedback on each answer, and one concrete focus area.
            The breakdown keeps substance separate from delivery.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <div className="mt-12 grid border-y border-border md:grid-cols-3 md:divide-x md:divide-border">
            {SCORES.map((score, index) => (
              <div key={score.label} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-border py-6 last:border-b-0 md:border-b-0 md:px-6 md:first:pl-0 md:last:pr-0">
                <span className="font-display text-xl text-muted-foreground">0{index + 1}</span>
                <div>
                  <h3 className="font-display text-2xl text-foreground">{score.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{score.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Fluency and confidence are estimated from transcript wording, not vocal tone.
          </p>
        </Reveal>
      </section>

      <section id="history" className="relative z-10 border-t border-border bg-secondary/20 px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_auto] md:items-end md:gap-16">
          <Reveal>
            <span className="text-xs tracking-[0.3em] text-muted-foreground">A PRACTICE HABIT, NOT A ONE-OFF</span>
            <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
              Keep the feedback. See the progress.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              TimberVue saves completed and unfinished sessions to your training history. Revisit answer-level notes,
              compare pressure scores, and return to the area that needs another round.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <GlassButton to={authPath} size="lg">Start your first round</GlassButton>
          </Reveal>
        </div>
      </section>

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center border-t border-border px-6 py-32 text-center md:py-40">
        <Reveal>
          <h2 className="font-display text-4xl leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
            Ready when the pressure starts.
          </h2>
          <p className="mt-8 text-base text-muted-foreground sm:text-lg">
            Start with one spoken answer. Build from there.
          </p>
          <div className="mt-12 flex flex-col items-center">
            <GlassButton to={authPath} size="lg">Start training</GlassButton>
            <span className="mt-5 text-xs text-muted-foreground">Your first round starts with your target role.</span>
          </div>
        </Reveal>
      </section>

      <footer className="relative z-10 mx-auto max-w-7xl border-t border-border px-6 py-14">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <Wordmark className="text-xl" supClass="text-[10px]" />
            <p className="mt-1 text-xs text-muted-foreground">Speak clearly when the pressure starts.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                {label}
              </a>
            ))}
          </div>
        </div>
        <p className="mt-10 text-center text-[11px] text-muted-foreground md:text-left">© 2026 TimberVue.</p>
      </footer>
    </div>
  );
}
