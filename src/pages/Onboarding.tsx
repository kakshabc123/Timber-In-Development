import { useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormMessage, SubmitButton } from "@/components/FormControls";
import { FullScreenLoader } from "@/components/RouteGuards";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, type Profile } from "@/contexts/ProfileContext";
import { EXPERIENCE_LEVELS, RESUME_BUCKET, RESUME_TYPES, ROLES, validateResume } from "@/lib/onboarding";
import { supabase } from "@/lib/supabase";

const OTHER_ROLE = "Other";

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function Onboarding() {
  const { profile, loading } = useProfile();
  if (loading) return <FullScreenLoader />;
  return <OnboardingFlow profile={profile} />;
}

function OnboardingFlow({ profile }: { profile: Profile | null }) {
  const { user, signOut } = useAuth();
  const { refresh } = useProfile();
  const navigate = useNavigate();

  const savedRole = profile?.target_role ?? "";
  const savedRoleIsPreset = ROLES.includes(savedRole);

  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [roleChoice, setRoleChoice] = useState(savedRole ? (savedRoleIsPreset ? savedRole : OTHER_ROLE) : "");
  const [customRole, setCustomRole] = useState(savedRoleIsPreset ? "" : savedRole);
  const [experience, setExperience] = useState(profile?.experience_level ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const existingResume = profile?.resume_filename ?? null;
  const targetRole = roleChoice === OTHER_ROLE ? customRole.trim() : roleChoice;

  function pickFile(next: File | undefined) {
    if (!next) return;
    const problem = validateResume(next);
    setError(problem);
    setFile(problem ? null : next);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    pickFile(event.dataTransfer.files[0]);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    pickFile(event.target.files?.[0]);
    event.target.value = "";
  }

  async function handleFinish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setError(null);
    setSubmitting(true);

    let resumePath = profile?.resume_path ?? null;
    let resumeFilename = existingResume;

    if (file) {
      const path = `${user.id}/resume.${RESUME_TYPES[file.type]}`;
      const { error: uploadError } = await supabase.storage
        .from(RESUME_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) {
        setSubmitting(false);
        setError(`Resume upload failed: ${uploadError.message}`);
        return;
      }
      if (resumePath && resumePath !== path) {
        await supabase.storage.from(RESUME_BUCKET).remove([resumePath]);
      }
      resumePath = path;
      resumeFilename = file.name;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      target_role: targetRole,
      experience_level: experience,
      resume_path: resumePath,
      resume_filename: resumeFilename,
      onboarded_at: profile?.onboarded_at ?? new Date().toISOString(),
    });

    if (profileError) {
      setSubmitting(false);
      setError(`Couldn't save your profile: ${profileError.message}`);
      return;
    }

    await refresh();
    navigate("/dashboard", { replace: true });
  }

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link to="/" className="font-display text-3xl tracking-tight">
          Timber<sup className="text-xs">®</sup>
        </Link>
        {profile?.onboarded_at ? (
          <Link to="/dashboard" className="text-sm text-muted-foreground transition hover:text-foreground">
            Cancel
          </Link>
        ) : (
          <button onClick={handleSignOut} className="text-sm text-muted-foreground transition hover:text-foreground">
            Log out
          </button>
        )}
      </header>

      <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-6">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Step {step} of 2</p>
          <div className="mt-3 h-px w-full bg-border">
            <div
              className="h-px bg-foreground transition-all duration-500"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

        {step === 1 ? (
          <section>
            <h1 className="font-display text-5xl leading-tight">Upload your resume.</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your AI interviewer builds questions around your real experience. PDF, DOC, or DOCX up to 5 MB.
            </p>

            <label
              htmlFor="resume"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center transition ${
                dragging ? "border-foreground bg-secondary/60" : "border-border bg-secondary/30 hover:bg-secondary/50"
              }`}
            >
              <input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="sr-only"
              />
              {file ? (
                <>
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="mt-1 text-xs text-muted-foreground">{formatBytes(file.size)} · click to replace</span>
                </>
              ) : existingResume ? (
                <>
                  <span className="text-sm font-medium">{existingResume}</span>
                  <span className="mt-1 text-xs text-muted-foreground">Current resume · click to replace</span>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium">Drop your resume here</span>
                  <span className="mt-1 text-xs text-muted-foreground">or click to browse</span>
                </>
              )}
            </label>

            {error && (
              <div className="mt-4">
                <FormMessage type="error">{error}</FormMessage>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep(2);
              }}
              disabled={!file && !existingResume}
              className="mt-8 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue
            </button>
          </section>
        ) : (
          <form onSubmit={handleFinish} noValidate>
            <h1 className="font-display text-5xl leading-tight">Choose your role.</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              We&apos;ll tailor interview questions and pressure levels to the job you&apos;re going for.
            </p>

            <fieldset className="mt-8">
              <legend className="mb-3 text-sm font-medium">Target role</legend>
              <div className="grid grid-cols-2 gap-2">
                {[...ROLES, OTHER_ROLE].map((role) => (
                  <button
                    key={role}
                    type="button"
                    aria-pressed={roleChoice === role}
                    onClick={() => setRoleChoice(role)}
                    className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                      roleChoice === role
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-secondary/30 hover:bg-secondary/60"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              {roleChoice === OTHER_ROLE && (
                <input
                  aria-label="Custom role"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g. DevOps Engineer"
                  maxLength={80}
                  className="mt-3 w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}
            </fieldset>

            <fieldset className="mt-8">
              <legend className="mb-3 text-sm font-medium">Experience</legend>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    aria-pressed={experience === level.value}
                    onClick={() => setExperience(level.value)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition ${
                      experience === level.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-secondary/30 hover:bg-secondary/60"
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {error && (
              <div className="mt-6">
                <FormMessage type="error">{error}</FormMessage>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={submitting}
                className="rounded-full border border-border px-5 py-2.5 text-sm transition hover:bg-secondary disabled:opacity-60"
              >
                Back
              </button>
              <SubmitButton loading={submitting} disabled={!targetRole || !experience}>
                Finish setup
              </SubmitButton>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
